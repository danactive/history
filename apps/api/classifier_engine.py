from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
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
SPECIES_INDEX_ID = "imageomics/TreeOfLife-200M"
SPECIES_INDEX_REVISION = "41f7bd67aec3de20f89b99390212dfdbce9501a6"

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
    model_manifest_path: Path | None = None
    species_index_manifest_path: Path | None = None
    species_index_dir: Path | None = None
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
            model_manifest_path=Path(os.getenv(
                "BIOCLIP_MODEL_MANIFEST_PATH",
                "apps/load-weights/manifests/bioclip-2.json",
            )),
            species_index_manifest_path=Path(os.getenv(
                "CLASSIFIER_SPECIES_INDEX_MANIFEST_PATH",
                "apps/load-weights/manifests/treeoflife-200m-bioclip2.json",
            )),
            species_index_dir=Path(os.getenv(
                "CLASSIFIER_SPECIES_INDEX_DIR",
                "models/imageomics_TreeOfLife-200M",
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
        self._verify_model_bundle()
        self._verify_species_index_bundle()

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

    def _verify_manifest_bundle(
        self,
        *,
        bundle_dir: Path,
        manifest_path: Path,
        repo_id: str,
        revision: str,
        missing_message: str,
        label: str,
    ) -> None:
        if not manifest_path.is_file():
            raise FileNotFoundError(f"{label} manifest is missing: {manifest_path}")

        with manifest_path.open("r", encoding="utf-8") as file:
            manifest = json.load(file)

        if manifest.get("repo_id") != repo_id or manifest.get("revision") != revision:
            raise ValueError(f"{label} manifest identity does not match the runtime")

        file_specs = manifest.get("files")
        if not isinstance(file_specs, list) or not file_specs:
            raise ValueError(f"{label} manifest must list files")

        for file_spec in file_specs:
            name = file_spec.get("name")
            expected_sha256 = file_spec.get("sha256")
            if not isinstance(name, str) or not name or not isinstance(expected_sha256, str) or not expected_sha256:
                raise ValueError(f"{label} manifest contains an invalid file entry")

            path = bundle_dir / name
            if not path.is_file():
                raise FileNotFoundError(missing_message)

            actual_sha256 = sha256_file(path)
            if actual_sha256 != expected_sha256:
                raise ValueError(
                    f"{label} checksum mismatch for {name}: "
                    f"expected {expected_sha256}, got {actual_sha256}"
                )

    def _verify_model_bundle(self) -> None:
        self._verify_manifest_bundle(
            bundle_dir=self.config.model_dir,
            manifest_path=self.config.model_manifest_path or Path("apps/load-weights/manifests/bioclip-2.json"),
            repo_id=MODEL_ID,
            revision=MODEL_REVISION,
            missing_message=(
                "Incomplete BioCLIP 2 model bundle. "
                "Run make load-bioclip2 before starting the API."
            ),
            label="BioCLIP 2 model",
        )

    def _verify_species_index_bundle(self) -> None:
        species_index_dir = self.config.species_index_dir or self.config.embeddings_path.parent.parent
        self._verify_manifest_bundle(
            bundle_dir=species_index_dir,
            manifest_path=(
                self.config.species_index_manifest_path
                or Path("apps/load-weights/manifests/treeoflife-200m-bioclip2.json")
            ),
            repo_id=SPECIES_INDEX_ID,
            revision=SPECIES_INDEX_REVISION,
            missing_message=(
                "Incomplete TreeOfLife-200M species index. "
                "Run make load-bioclip2 before starting the API."
            ),
            label="TreeOfLife-200M species index",
        )

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
