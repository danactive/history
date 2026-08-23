from fastapi import Request
import torch
import torch.nn as nn
from PIL import Image
import numpy as np
import logging
import io
import math
from transformers import CLIPProcessor, CLIPVisionModel

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)

SCORER_DIR = "models/rsinema_aesthetic-scorer"
SCORER_MODEL_PATH = f"{SCORER_DIR}/model.pt"
CLIP_BASE_DIR = "models/openai_clip-vit-base-patch32"

device = "cuda" if torch.cuda.is_available() else "cpu"

_aesthetic_scorer = None
_aesthetic_processor = None
_aesthetic_backbone = None

class AestheticScorer(nn.Module):
  def __init__(self, backbone):
    super().__init__()
    self.backbone = backbone
    hidden_dim = backbone.config.hidden_size
    self.aesthetic_head = nn.Sequential(nn.Linear(hidden_dim, 1))
    self.quality_head = nn.Sequential(nn.Linear(hidden_dim, 1))
    self.composition_head = nn.Sequential(nn.Linear(hidden_dim, 1))
    self.light_head = nn.Sequential(nn.Linear(hidden_dim, 1))
    self.color_head = nn.Sequential(nn.Linear(hidden_dim, 1))
    self.dof_head = nn.Sequential(nn.Linear(hidden_dim, 1))
    self.content_head = nn.Sequential(nn.Linear(hidden_dim, 1))

  def forward(self, pixel_values):
    features = self.backbone(pixel_values).pooler_output
    return (
      self.aesthetic_head(features),
      self.quality_head(features),
      self.composition_head(features),
      self.light_head(features),
      self.color_head(features),
      self.dof_head(features),
      self.content_head(features),
    )

def load_aesthetic_scorer():
  global _aesthetic_scorer, _aesthetic_processor, _aesthetic_backbone
  try:
    _aesthetic_processor = CLIPProcessor.from_pretrained(SCORER_DIR, use_fast=False, local_files_only=True)
    _aesthetic_backbone = CLIPVisionModel.from_pretrained(
      CLIP_BASE_DIR,
      local_files_only=True,
    ).vision_model.to(device)
    loaded = torch.load(SCORER_MODEL_PATH, map_location=device, weights_only=True)
    if not isinstance(loaded, dict):
      raise ValueError("Aesthetic scorer must be a state dictionary")
    scorer = AestheticScorer(_aesthetic_backbone)
    scorer.load_state_dict(loaded)
    _aesthetic_scorer = scorer.to(device).eval()
    logger.info("✅ Aesthetic scorer loaded.")
  except Exception as e:
    logger.error(f"⚠️ Failed to load aesthetic scorer: {e}")
    _aesthetic_scorer = None
    _aesthetic_processor = None
    _aesthetic_backbone = None

load_aesthetic_scorer()

def _grayscale_np(img: Image.Image, size: int = 256) -> np.ndarray:
  resized = img.resize((size, size))
  return (np.array(resized.convert("L"), dtype=np.float32) / 255.0)

def _sharpness_score(gray: np.ndarray) -> float:
  if gray.size == 0:
    return 0.0
  padded = np.pad(gray, 1, mode="edge")
  lap = (
    padded[:-2, 1:-1]
    + padded[2:, 1:-1]
    + padded[1:-1, :-2]
    + padded[1:-1, 2:]
    - 4 * padded[1:-1, 1:-1]
  )
  variance = float(lap.var())
  score = variance * 1000.0
  return float(max(0.0, min(10.0, score)))

def _exposure_score(gray: np.ndarray) -> float:
  if gray.size == 0:
    return 0.0
  shadow_clipping = float(np.mean(gray <= 0.02))
  highlight_clipping = float(np.mean(gray >= 0.98))
  clipping_penalty = min(7.0, (shadow_clipping + highlight_clipping) * 18.0)
  mean_luminance = float(gray.mean())
  luminance_penalty = max(0.0, abs(mean_luminance - 0.5) - 0.28) * 7.0
  return float(max(0.0, min(10.0, 10.0 - clipping_penalty - luminance_penalty)))

def _resolution_score(img: Image.Image) -> float:
  short_side = min(img.size)
  return float(max(0.0, min(10.0, ((short_side - 320) / 1120) * 10.0)))

def _score_with_aesthetic_model(img: Image.Image) -> dict | None:
  if _aesthetic_scorer is None or _aesthetic_processor is None:
    return None
  inputs = _aesthetic_processor(images=img, return_tensors="pt")["pixel_values"].to(device)
  with torch.no_grad():
    scores = _aesthetic_scorer(inputs)
  labels = ["overall", "quality", "composition", "lighting", "color", "depth_of_field", "content"]
  return {label: float(score.item()) for label, score in zip(labels, scores)}

def _normalize_model_score(raw_score: float) -> float:
  bounded_score = max(-8.0, min(8.0, raw_score))
  return 10.0 / (1.0 + math.exp(-bounded_score))

def _model_characteristic(model_scores: dict[str, float] | None, name: str) -> float | None:
  if model_scores is None:
    return None
  raw_score = model_scores.get(name)
  if raw_score is None:
    return None
  return _normalize_model_score(raw_score)

def _overall_score(
  technical_score: float,
  composition_score: float | None,
  aesthetic_score: float | None,
) -> float:
  weighted_scores: list[tuple[float, float]] = [(technical_score, 0.4)]
  if composition_score is not None:
    weighted_scores.append((composition_score, 0.35))
  if aesthetic_score is not None:
    weighted_scores.append((aesthetic_score, 0.25))

  total_weight = sum(weight for _, weight in weighted_scores)
  return sum(score * weight for score, weight in weighted_scores) / total_weight * 10.0

def _analysis_notes(
  sharpness_score: float,
  exposure_score: float,
  resolution_score: float,
  composition_score: float | None,
  aesthetic_score: float | None,
) -> list[str]:
  notes: list[str] = []
  if sharpness_score < 5.0:
    notes.append("The image appears soft.")
  if exposure_score < 6.0:
    notes.append("Exposure has substantial clipped shadows or highlights.")
  if resolution_score < 6.0:
    notes.append("Limited resolution may constrain cropping or large prints.")
  if composition_score is not None and composition_score < 5.0:
    notes.append("The learned composition signal is below its neutral midpoint.")
  if aesthetic_score is not None and aesthetic_score < 5.0:
    notes.append("The learned aesthetic signal is below its neutral midpoint.")
  if composition_score is None or aesthetic_score is None:
    notes.append("Learned aesthetic characteristics are unavailable; technical measurements remain available.")
  if not notes:
    notes.append("No obvious technical limitation was detected.")
  return notes

def score_photo_image(img: Image.Image) -> dict:
  gray = _grayscale_np(img)
  sharpness_score = _sharpness_score(gray)
  exposure_score = _exposure_score(gray)
  resolution_score = _resolution_score(img)
  technical_score = (sharpness_score * 0.5) + (exposure_score * 0.3) + (resolution_score * 0.2)
  model_scores = _score_with_aesthetic_model(img)
  composition_score = _model_characteristic(model_scores, "composition")
  aesthetic_score = _model_characteristic(model_scores, "overall")
  overall_score = _overall_score(technical_score, composition_score, aesthetic_score)
  return {
    "overall_score": round(overall_score, 1),
    "technical_score": round(technical_score, 2),
    "composition_score": round(composition_score, 2) if composition_score is not None else None,
    "aesthetic_score": round(aesthetic_score, 2) if aesthetic_score is not None else None,
    "sharpness_score": round(sharpness_score, 2),
    "exposure_score": round(exposure_score, 2),
    "resolution_score": round(resolution_score, 2),
    "image_width": img.width,
    "image_height": img.height,
    "notes": _analysis_notes(
      sharpness_score,
      exposure_score,
      resolution_score,
      composition_score,
      aesthetic_score,
    ),
  }

async def score_photo_tips(req: Request) -> dict:
  img_bytes = await req.body()
  img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
  return score_photo_image(img)
