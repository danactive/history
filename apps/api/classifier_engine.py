from __future__ import annotations

from dataclasses import dataclass
import hashlib
import logging
import os
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageOps
import torch

from taxonomy import Taxon, load_taxonomy


logger = logging.getLogger("uvicorn")

MODEL_ID = "imageomics/bioclip-2"
MODEL_REVISION = "2957b322090f9cb17ae72c71981c7218a28d81e0"
MODEL_SHA256 = "b7b2bf6fbc95799e42630e394cf95803892ab447c1a8ab629dbc82fbeaf7dfef"
SPECIES_INDEX_REVISION = "41f7bd67aec3de20f89b99390212dfdbce9501a6"
SPECIES_TAXONOMY_SHA256 = "4648928b006f85d83d28e5a27074ca9363465d82e778d708b369c5eaf54b8ef5"
SPECIES_EMBEDDINGS_SHA256 = "c72442de7b0cb7fcb55ab7ca08099d0f42fbd6769efe16ca64c1daa7a8b87db2"

ORGANISM_PROMPTS = (
    "a biological photograph of an animal",
    "a biological photograph of a plant",
    "a biological photograph of a fungus",
)

NON_ORGANISM_PROMPTS = (
    "a photograph of a person",
    "a photograph of a building",
    "a photograph of a vehicle",
    "a photograph of food",
    "a landscape photograph without a visible organism",
)


class ClassifierUnavailable(RuntimeError):
    pass


@dataclass(frozen=True)
class ClassifierConfig:
    model_dir: Path
    taxonomy_path: Path
    embeddings_path: Path
    minimum_similarity: float = 0.70
    minimum_margin: float = 0.015
    non_organism_margin: float = 0.02
    top_k: int = 5
    multi_crop: bool = False

    @classmethod
    def from_environment(cls) -> "ClassifierConfig":
        return cls(
            model_dir=Path(os.getenv("BIOCLIP_MODEL_DIR", "models/imageomics_bioclip-2")),
            taxonomy_path=Path(os.getenv(
                "CLASSIFIER_TAXONOMY_PATH",
                "models/imageomics_TreeOfLife-200M/embeddings/txt_emb_species.json",
            )),
            embeddings_path=Path(os.getenv(
                "CLASSIFIER_EMBEDDINGS_PATH",
                "models/imageomics_TreeOfLife-200M/embeddings/txt_emb_species.npy",
            )),
            minimum_similarity=float(os.getenv("CLASSIFIER_MINIMUM_SIMILARITY", "0.70")),
            minimum_margin=float(os.getenv("CLASSIFIER_MINIMUM_MARGIN", "0.015")),
            non_organism_margin=float(os.getenv("CLASSIFIER_NON_ORGANISM_MARGIN", "0.02")),
            multi_crop=os.getenv("CLASSIFIER_MULTI_CROP", "false").lower() in {"1", "true", "yes"},
        )


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_image_crops(image: Image.Image, include_edges: bool = False) -> list[Image.Image]:
    image = ImageOps.exif_transpose(image).convert("RGB")
    width, height = image.size
    longest = max(width, height)
    background = (123, 116, 103)
    crops = [ImageOps.pad(image, (longest, longest), color=background)]

    if not include_edges:
        return crops

    ratio = longest / max(1, min(width, height))
    if ratio < 1.2:
        return crops

    side = min(width, height)
    if width > height:
        crops.extend([
            image.crop((0, 0, side, side)),
            image.crop((width - side, 0, width, side)),
        ])
    else:
        crops.extend([
            image.crop((0, 0, side, side)),
            image.crop((0, height - side, side, height)),
        ])
    return crops


def determine_status(
    top_similarity: float,
    top_margin: float,
    crop_agreement: float,
    organism_score: float,
    non_organism_score: float,
    top_two_same_family: bool,
    _top_two_same_genus: bool,
    config: ClassifierConfig,
) -> str:
    looks_non_organism = (
        non_organism_score >= organism_score + config.non_organism_margin
        and top_similarity < config.minimum_similarity + 0.08
    )
    if looks_non_organism:
        return "not_organism"
    if (
        top_similarity >= config.minimum_similarity
        and top_margin >= config.minimum_margin
        and crop_agreement >= 0.5
        and top_two_same_family
    ):
        return "identified"
    return "uncertain"


class BioClipClassifier:
    def __init__(self, config: ClassifierConfig | None = None):
        self.config = config or ClassifierConfig.from_environment()
        configured_device = os.getenv("CLASSIFIER_DEVICE")
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
        self.preprocess: Any | None = None
        self.tokenizer: Any | None = None
        self.taxa: list[Taxon] = []
        self.taxonomy_version = "unavailable"
        self.text_features: torch.Tensor | None = None
        self._text_features_source: np.ndarray | None = None
        self.gate_features: torch.Tensor | None = None
        self.ready = False
        self.error: str | None = None

    def initialize(self) -> None:
        try:
            self._initialize()
            self.ready = True
            self.error = None
            logger.info(
                "BioCLIP 2 classifier ready on %s with %d taxa",
                self.device,
                len(self.taxa),
            )
        except Exception as error:
            self.ready = False
            self.error = str(error)
            logger.exception("BioCLIP 2 classifier failed to initialize")

    def _initialize(self) -> None:
        checkpoint_path = self.config.model_dir / "open_clip_model.safetensors"
        config_path = self.config.model_dir / "open_clip_config.json"
        if not checkpoint_path.is_file() or not config_path.is_file():
            raise FileNotFoundError(f"Incomplete BioCLIP 2 bundle in {self.config.model_dir}")
        if not self.config.taxonomy_path.is_file() or not self.config.embeddings_path.is_file():
            raise FileNotFoundError(
                "Incomplete TreeOfLife-200M species index. Run make load-bioclip2 before starting the API."
            )

        actual_sha256 = sha256_file(checkpoint_path)
        if actual_sha256 != MODEL_SHA256:
            raise ValueError(
                f"BioCLIP 2 checkpoint checksum mismatch: expected {MODEL_SHA256}, got {actual_sha256}"
            )
        taxonomy_sha256 = sha256_file(self.config.taxonomy_path)
        if taxonomy_sha256 != SPECIES_TAXONOMY_SHA256:
            raise ValueError(
                "TreeOfLife taxonomy checksum mismatch: "
                f"expected {SPECIES_TAXONOMY_SHA256}, got {taxonomy_sha256}"
            )
        embeddings_sha256 = sha256_file(self.config.embeddings_path)
        if embeddings_sha256 != SPECIES_EMBEDDINGS_SHA256:
            raise ValueError(
                "TreeOfLife embeddings checksum mismatch: "
                f"expected {SPECIES_EMBEDDINGS_SHA256}, got {embeddings_sha256}"
            )

        import open_clip

        model_source = f"local-dir:{self.config.model_dir.resolve()}"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_source,
            device=self.device,
            require_pretrained=True,
        )
        self.model.eval()
        self.tokenizer = open_clip.get_tokenizer(model_source)
        self.taxa, self.taxonomy_version = load_taxonomy(self.config.taxonomy_path)
        self.text_features = self._load_taxon_features()
        self.gate_features = self._encode_texts(list(ORGANISM_PROMPTS + NON_ORGANISM_PROMPTS))

    def _load_taxon_features(self) -> torch.Tensor:
        source = np.load(self.config.embeddings_path, mmap_mode="c")
        if source.ndim != 2:
            raise ValueError("TreeOfLife embeddings must be a two-dimensional matrix")
        if source.shape[1] == len(self.taxa):
            oriented = source
        elif source.shape[0] == len(self.taxa):
            oriented = source.T
        else:
            raise ValueError(
                "TreeOfLife taxonomy and embedding counts do not match: "
                f"{len(self.taxa)} labels for shape {source.shape}"
            )

        self._text_features_source = source
        features = torch.from_numpy(oriented)
        logger.info(
            "Loaded the TreeOfLife-200M species index with %d taxa",
            len(self.taxa),
        )
        return features

    def _encode_texts(self, texts: list[str]) -> torch.Tensor:
        if self.model is None or self.tokenizer is None:
            raise ClassifierUnavailable("Classifier model is not loaded")

        with torch.inference_mode():
            tokens = self.tokenizer(texts).to(self.device)
            features = self.model.encode_text(tokens).float()
        return torch.nn.functional.normalize(features, dim=-1)

    def health(self) -> dict[str, Any]:
        return {
            "status": "ok" if self.ready else "unavailable",
            "model": {
                "id": MODEL_ID,
                "revision": MODEL_REVISION,
                "sha256": MODEL_SHA256,
            },
            "taxonomy": self.taxonomy_version,
            "speciesIndexRevision": SPECIES_INDEX_REVISION,
            "candidateCount": len(self.taxa),
            "device": str(self.device),
            **({"error": self.error} if self.error else {}),
        }

    def classify(self, image: Image.Image, metadata: dict[str, str | None] | None = None) -> dict[str, Any]:
        if not self.ready or self.model is None or self.preprocess is None:
            raise ClassifierUnavailable(self.error or "Classifier is not ready")
        if self.text_features is None or self.gate_features is None:
            raise ClassifierUnavailable("Classifier embeddings are not ready")

        crops = build_image_crops(image, include_edges=self.config.multi_crop)
        image_batch = torch.stack([self.preprocess(crop) for crop in crops]).to(self.device)
        with torch.inference_mode():
            image_features = self.model.encode_image(image_batch).float()
            image_features = torch.nn.functional.normalize(image_features, dim=-1)
            crop_scores = image_features.cpu() @ self.text_features
            combined_scores = crop_scores.mean(dim=0)
            gate_scores = image_features.mean(dim=0, keepdim=True) @ self.gate_features.T

        top_k = min(self.config.top_k, len(self.taxa))
        top_scores, top_indices = torch.topk(combined_scores, k=top_k)
        top_score = float(top_scores[0].item())
        top_margin = top_score - float(top_scores[1].item()) if top_k > 1 else top_score
        top_taxon = self.taxa[int(top_indices[0].item())]
        top_genus = top_taxon.resolved_genus
        runner_up = self.taxa[int(top_indices[1].item())] if top_k > 1 else None
        top_two_same_family = bool(
            runner_up
            and top_taxon.family
            and top_taxon.family == runner_up.family
        )
        top_two_same_genus = bool(
            runner_up
            and top_genus
            and top_genus == runner_up.resolved_genus
        )

        crop_top_indices = crop_scores.argmax(dim=1).tolist()
        agreeing_crops = sum(
            1 for index in crop_top_indices
            if self.taxa[int(index)].resolved_genus == top_genus
        )
        crop_agreement = agreeing_crops / len(crops)

        organism_count = len(ORGANISM_PROMPTS)
        organism_score = float(gate_scores[0, :organism_count].max().item())
        non_organism_score = float(gate_scores[0, organism_count:].max().item())
        status = determine_status(
            top_score,
            top_margin,
            crop_agreement,
            organism_score,
            non_organism_score,
            top_two_same_family,
            top_two_same_genus,
            self.config,
        )

        predictions = []
        for rank, (score_tensor, index_tensor) in enumerate(zip(top_scores, top_indices)):
            taxon = self.taxa[int(index_tensor.item())]
            score = float(score_tensor.item())
            if rank == 0 and status == "identified":
                match_strength = "strong"
            elif score >= self.config.minimum_similarity:
                match_strength = "possible"
            else:
                match_strength = "weak"
            predictions.append({
                "taxonId": taxon.taxon_id,
                "scientificName": taxon.scientific_name,
                "commonName": taxon.common_name,
                "kingdom": taxon.kingdom,
                "family": taxon.family,
                "genus": taxon.resolved_genus,
                "lineage": taxon.lineage,
                "score": score,
                "matchStrength": match_strength,
            })

        supplied_metadata = metadata or {}
        return {
            "status": status,
            "model": {
                "id": MODEL_ID,
                "revision": MODEL_REVISION,
                "taxonomy": self.taxonomy_version,
            },
            "predictions": predictions,
            "diagnostics": {
                "candidateCount": len(self.taxa),
                "cropCount": len(crops),
                "cropAgreement": crop_agreement,
                "topMargin": top_margin,
                "organismScore": organism_score,
                "nonOrganismScore": non_organism_score,
                "topTwoSameFamily": top_two_same_family,
                "topTwoSameGenus": top_two_same_genus,
                "metadataAvailable": any(supplied_metadata.values()),
                "metadataApplied": False,
            },
        }
