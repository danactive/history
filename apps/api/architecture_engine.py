from __future__ import annotations

from dataclasses import dataclass
import json
import logging
import os
from pathlib import Path
from threading import Lock
from typing import Any

from PIL import Image
import torch

from classifier_engine import ClassifierUnavailable, build_image_crops, sha256_file


logger = logging.getLogger("uvicorn")

MODEL_ID = "google/siglip2-base-patch16-224"
MODEL_REVISION = "75de2d55ec2d0b4efc50b3e9ad70dba96a7b2fa2"
TEXT_MAX_LENGTH = 64

ARCHITECTURE_PROMPTS = (
    "a photograph clearly showing a building and its architectural style",
    "a photograph of a building facade",
    "a photograph of an architectural interior",
    "a photograph of architectural details on a building",
)

NON_ARCHITECTURE_PROMPTS = (
    "a photograph without a visible building",
    "a landscape photograph with no building",
    "a photograph of an animal",
    "a portrait photograph of a person",
    "a close-up photograph of an ordinary object",
    "a photograph of food",
)


@dataclass(frozen=True)
class ArchitectureStyle:
    style_id: str
    name: str
    family: str
    prompts: tuple[str, ...]
    review_cues: tuple[str, ...]


@dataclass(frozen=True)
class ArchitectureConfig:
    model_dir: Path
    manifest_path: Path
    taxonomy_path: Path
    minimum_similarity: float = 0.11
    minimum_family_margin: float = 0.004
    minimum_style_margin: float = 0.003
    architecture_margin: float = 0.01
    minimum_crop_agreement: float = 0.5
    top_k: int = 4

    @classmethod
    def from_environment(cls) -> "ArchitectureConfig":
        return cls(
            model_dir=Path(os.getenv(
                "ARCHITECTURE_MODEL_DIR",
                "models/google_siglip2-base-patch16-224",
            )),
            manifest_path=Path(os.getenv(
                "ARCHITECTURE_MANIFEST_PATH",
                "apps/load-weights/manifests/siglip2-base-patch16-224.json",
            )),
            taxonomy_path=Path(os.getenv(
                "ARCHITECTURE_TAXONOMY_PATH",
                "apps/api/architecture_taxonomy.json",
            )),
            minimum_similarity=float(os.getenv(
                "ARCHITECTURE_MINIMUM_SIMILARITY",
                "0.11",
            )),
            minimum_family_margin=float(os.getenv(
                "ARCHITECTURE_MINIMUM_FAMILY_MARGIN",
                "0.004",
            )),
            minimum_style_margin=float(os.getenv(
                "ARCHITECTURE_MINIMUM_STYLE_MARGIN",
                "0.003",
            )),
            architecture_margin=float(os.getenv(
                "ARCHITECTURE_GATE_MARGIN",
                "0.01",
            )),
            minimum_crop_agreement=float(os.getenv(
                "ARCHITECTURE_MINIMUM_CROP_AGREEMENT",
                "0.5",
            )),
        )


def load_architecture_taxonomy(path: Path) -> tuple[list[ArchitectureStyle], str]:
    with path.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    version = payload.get("version")
    rows = payload.get("styles")
    if not isinstance(version, str) or not version:
        raise ValueError("Architecture taxonomy must have a version")
    if not isinstance(rows, list) or not rows:
        raise ValueError("Architecture taxonomy must contain styles")

    styles = []
    seen_ids = set()
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("Architecture taxonomy entries must be objects")
        style_id = row.get("id")
        name = row.get("name")
        family = row.get("family")
        prompts = row.get("prompts")
        review_cues = row.get("reviewCues")
        if not all(isinstance(value, str) and value for value in (style_id, name, family)):
            raise ValueError("Architecture styles require id, name, and family")
        if style_id in seen_ids:
            raise ValueError(f"Duplicate architecture style id: {style_id}")
        if not isinstance(prompts, list) or not prompts or not all(isinstance(value, str) for value in prompts):
            raise ValueError(f"Architecture style {style_id} requires prompts")
        if not isinstance(review_cues, list) or not all(isinstance(value, str) for value in review_cues):
            raise ValueError(f"Architecture style {style_id} has invalid review cues")
        seen_ids.add(style_id)
        styles.append(ArchitectureStyle(
            style_id=style_id,
            name=name,
            family=family,
            prompts=tuple(prompts),
            review_cues=tuple(review_cues),
        ))

    return styles, version


def determine_architecture_status(
    top_similarity: float,
    top_family_margin: float,
    crop_agreement: float,
    architecture_score: float,
    non_architecture_score: float,
    config: ArchitectureConfig,
) -> str:
    if non_architecture_score >= architecture_score + config.architecture_margin:
        return "not_architecture"
    if (
        architecture_score >= non_architecture_score + config.architecture_margin
        and top_similarity >= config.minimum_similarity
        and top_family_margin >= config.minimum_family_margin
        and crop_agreement >= config.minimum_crop_agreement
    ):
        return "identified"
    return "uncertain"


class ArchitectureClassifier:
    def __init__(self, config: ArchitectureConfig | None = None):
        self.config = config or ArchitectureConfig.from_environment()
        configured_device = os.getenv("ARCHITECTURE_CLASSIFIER_DEVICE")
        if configured_device:
            device_name = configured_device
        elif torch.cuda.is_available():
            device_name = "cuda"
        elif torch.backends.mps.is_available():
            device_name = "mps"
        else:
            device_name = "cpu"
        self.device = torch.device(device_name)
        self.model: Any | None = None
        self.image_processor: Any | None = None
        self.tokenizer: Any | None = None
        self.styles: list[ArchitectureStyle] = []
        self.taxonomy_version = "unavailable"
        self.taxonomy_sha256 = "unavailable"
        self.style_features: torch.Tensor | None = None
        self.gate_features: torch.Tensor | None = None
        self.family_names: list[str] = []
        self.family_style_indices: list[list[int]] = []
        self.ready = False
        self.error: str | None = None
        self._initialization_attempted = False
        self._initialization_lock = Lock()

    def ensure_initialized(self) -> None:
        if self.ready:
            return
        with self._initialization_lock:
            if self.ready:
                return
            if not self._initialization_attempted:
                self.initialize()
        if not self.ready:
            raise ClassifierUnavailable(self.error or "Architecture classifier is not ready")

    def initialize(self) -> None:
        self._initialization_attempted = True
        try:
            self._initialize()
            self.ready = True
            self.error = None
            logger.info(
                "SigLIP 2 architecture classifier ready on %s with %d styles",
                self.device,
                len(self.styles),
            )
        except Exception as error:
            self.ready = False
            self.error = str(error)
            logger.exception("SigLIP 2 architecture classifier failed to initialize")

    def _initialize(self) -> None:
        self._verify_model_bundle()
        if not self.config.taxonomy_path.is_file():
            raise FileNotFoundError(
                f"Architecture taxonomy is missing: {self.config.taxonomy_path}"
            )

        from transformers import AutoImageProcessor, AutoModel, AutoTokenizer

        self.image_processor = AutoImageProcessor.from_pretrained(
            self.config.model_dir,
            local_files_only=True,
            use_fast=False,
        )
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.config.model_dir,
            local_files_only=True,
            use_fast=True,
        )
        self.model = AutoModel.from_pretrained(
            self.config.model_dir,
            local_files_only=True,
            use_safetensors=True,
        ).to(self.device)
        self.model.eval()
        self.styles, self.taxonomy_version = load_architecture_taxonomy(
            self.config.taxonomy_path
        )
        self.taxonomy_sha256 = sha256_file(self.config.taxonomy_path)
        self._build_family_index()
        self.style_features = self._build_style_features()
        self.gate_features = self._encode_texts(list(
            ARCHITECTURE_PROMPTS + NON_ARCHITECTURE_PROMPTS
        ))

    def _verify_model_bundle(self) -> None:
        if not self.config.manifest_path.is_file():
            raise FileNotFoundError(
                f"Architecture model manifest is missing: {self.config.manifest_path}"
            )
        with self.config.manifest_path.open("r", encoding="utf-8") as file:
            manifest = json.load(file)
        if manifest.get("repo_id") != MODEL_ID or manifest.get("revision") != MODEL_REVISION:
            raise ValueError("Architecture model manifest identity does not match the runtime")
        for file_spec in manifest.get("files", []):
            path = self.config.model_dir / file_spec["name"]
            if not path.is_file():
                raise FileNotFoundError(
                    "Incomplete architecture model bundle. "
                    "Run make load-architecture-classifier before starting the API."
                )
            actual_sha256 = sha256_file(path)
            if actual_sha256 != file_spec["sha256"]:
                raise ValueError(
                    f"Architecture model checksum mismatch for {file_spec['name']}: "
                    f"expected {file_spec['sha256']}, got {actual_sha256}"
                )

    def _build_family_index(self) -> None:
        family_indices: dict[str, list[int]] = {}
        for index, style in enumerate(self.styles):
            family_indices.setdefault(style.family, []).append(index)
        self.family_names = list(family_indices)
        self.family_style_indices = list(family_indices.values())

    def _encode_texts(self, texts: list[str]) -> torch.Tensor:
        if self.model is None or self.tokenizer is None:
            raise ClassifierUnavailable("Architecture classifier model is not loaded")
        inputs = self.tokenizer(
            texts,
            padding="max_length",
            truncation=True,
            max_length=TEXT_MAX_LENGTH,
            return_tensors="pt",
        )
        inputs = {name: value.to(self.device) for name, value in inputs.items()}
        with torch.inference_mode():
            features = self.model.get_text_features(**inputs).float()
        return torch.nn.functional.normalize(features, dim=-1)

    def _build_style_features(self) -> torch.Tensor:
        prompts = [prompt for style in self.styles for prompt in style.prompts]
        prompt_features = self._encode_texts(prompts)
        style_features = []
        offset = 0
        for style in self.styles:
            count = len(style.prompts)
            feature = prompt_features[offset:offset + count].mean(dim=0)
            style_features.append(feature)
            offset += count
        stacked = torch.stack(style_features)
        return torch.nn.functional.normalize(stacked, dim=-1)

    def _encode_images(self, crops: list[Image.Image]) -> torch.Tensor:
        if self.model is None or self.image_processor is None:
            raise ClassifierUnavailable("Architecture classifier model is not loaded")
        inputs = self.image_processor(images=crops, return_tensors="pt")
        pixel_values = inputs["pixel_values"].to(self.device)
        with torch.inference_mode():
            features = self.model.get_image_features(pixel_values=pixel_values).float()
        return torch.nn.functional.normalize(features, dim=-1)

    def health(self) -> dict[str, Any]:
        if self.ready:
            status = "ok"
        elif self.error:
            status = "unavailable"
        else:
            status = "not_loaded"
        return {
            "status": status,
            "model": {
                "id": MODEL_ID,
                "revision": MODEL_REVISION,
            },
            "taxonomy": self.taxonomy_version,
            "taxonomySha256": self.taxonomy_sha256,
            "styleCount": len(self.styles),
            "device": str(self.device),
            **({"error": self.error} if self.error else {}),
        }

    def classify(
        self,
        image: Image.Image,
        metadata: dict[str, str | None] | None = None,
    ) -> dict[str, Any]:
        self.ensure_initialized()
        if self.style_features is None or self.gate_features is None:
            raise ClassifierUnavailable("Architecture classifier embeddings are not ready")

        crops = build_image_crops(image, include_edges=True)
        image_features = self._encode_images(crops)
        crop_style_scores = image_features @ self.style_features.T
        style_scores = crop_style_scores.mean(dim=0)
        crop_family_scores = torch.stack([
            crop_style_scores[:, indices].max(dim=1).values
            for indices in self.family_style_indices
        ], dim=1)
        family_scores = crop_family_scores.mean(dim=0)

        family_top_k = min(2, len(self.family_names))
        top_family_scores, top_family_indices = torch.topk(
            family_scores,
            k=family_top_k,
        )
        top_family_index = int(top_family_indices[0].item())
        top_family_name = self.family_names[top_family_index]
        top_family_score = float(top_family_scores[0].item())
        top_family_margin = (
            top_family_score - float(top_family_scores[1].item())
            if family_top_k > 1 else top_family_score
        )
        crop_family_winners = crop_family_scores.argmax(dim=1)
        crop_agreement = float(
            (crop_family_winners == top_family_index).float().mean().item()
        )

        gate_scores = image_features.mean(dim=0, keepdim=True) @ self.gate_features.T
        architecture_count = len(ARCHITECTURE_PROMPTS)
        architecture_score = float(gate_scores[0, :architecture_count].max().item())
        non_architecture_score = float(gate_scores[0, architecture_count:].max().item())
        status = determine_architecture_status(
            top_family_score,
            top_family_margin,
            crop_agreement,
            architecture_score,
            non_architecture_score,
            self.config,
        )

        top_k = min(self.config.top_k, len(self.styles))
        top_scores, top_indices = torch.topk(style_scores, k=top_k)
        predictions = []
        for rank, (score_tensor, index_tensor) in enumerate(zip(top_scores, top_indices)):
            score = float(score_tensor.item())
            if rank == 0 and status == "identified":
                strength = "strong"
            elif score >= self.config.minimum_similarity:
                strength = "possible"
            else:
                strength = "weak"
            predictions.append(self._style_prediction(
                self.styles[int(index_tensor.item())],
                score,
                strength,
            ))
        accepted_prediction = None
        if status == "identified":
            family_indices = self.family_style_indices[top_family_index]
            family_style_scores = style_scores[family_indices]
            family_style_top_k = min(2, len(family_indices))
            family_top_scores, family_top_indices = torch.topk(
                family_style_scores,
                k=family_style_top_k,
            )
            top_style_index = family_indices[int(family_top_indices[0].item())]
            top_style = self.styles[top_style_index]
            style_margin = (
                float(family_top_scores[0].item() - family_top_scores[1].item())
                if family_style_top_k > 1 else 1.0
            )
            if style_margin >= self.config.minimum_style_margin:
                accepted_prediction = self._style_prediction(
                    top_style,
                    float(family_top_scores[0].item()),
                    "strong",
                )
            else:
                accepted_prediction = {
                    "styleId": f"family:{top_family_name.casefold().replace(' ', '-')}",
                    "name": top_family_name,
                    "family": top_family_name,
                    "specificity": "family",
                    "score": top_family_score,
                    "matchStrength": "strong",
                    "reviewCues": list(top_style.review_cues),
                }

        supplied_metadata = metadata or {}
        return {
            "status": status,
            "model": {
                "id": MODEL_ID,
                "revision": MODEL_REVISION,
                "taxonomy": self.taxonomy_version,
            },
            "acceptedPrediction": accepted_prediction,
            "predictions": predictions,
            "diagnostics": {
                "styleCount": len(self.styles),
                "cropCount": len(crops),
                "cropAgreement": crop_agreement,
                "topFamilyMargin": top_family_margin,
                "architectureScore": architecture_score,
                "nonArchitectureScore": non_architecture_score,
                "metadataAvailable": any(supplied_metadata.values()),
                "metadataApplied": False,
            },
        }

    @staticmethod
    def _style_prediction(
        style: ArchitectureStyle,
        score: float,
        match_strength: str,
    ) -> dict[str, Any]:
        return {
            "styleId": style.style_id,
            "name": style.name,
            "family": style.family,
            "specificity": "style",
            "score": score,
            "matchStrength": match_strength,
            "reviewCues": list(style.review_cues),
        }
