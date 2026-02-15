from fastapi import Request
import torch
import torch.nn as nn
import torchvision.transforms as T
from PIL import Image, ImageFilter
import numpy as np
import logging
from collections import OrderedDict
import io
import clip
from transformers import CLIPProcessor, CLIPVisionModel

# Set up logging once
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)

HEAD_PATH = "models/aesthetic/sa_0_4_vit_b_16_linear.pth"
SCORER_DIR = "models/rsinema_aesthetic-scorer"
SCORER_MODEL_PATH = f"{SCORER_DIR}/model.pt"
CLIP_BASE_DIR = "models/openai_clip-vit-base-patch32"

device = "cuda" if torch.cuda.is_available() else "cpu"

def build_head():
    return nn.Sequential(
        nn.Linear(512, 512),
        nn.ReLU(),
        nn.Linear(512, 128),
        nn.ReLU(),
        nn.Linear(128, 64),
        nn.ReLU(),
        nn.Linear(64, 16),
        nn.ReLU(),
        nn.Linear(16, 1),
    )

def load_aesthetic_head(head_path: str) -> nn.Module:
    logger.info(f"📥 Loading aesthetic regression head from: {head_path}")
    loaded = torch.load(head_path, map_location="cpu")

    if isinstance(loaded, dict):
        if 'state_dict' in loaded:
            logger.info("🧠 Detected state_dict format with 'state_dict' key.")
            head = build_head()
            head.load_state_dict(loaded['state_dict'])
            return head.eval()
        elif all(k.startswith("layers.") for k in loaded.keys()):
            logger.info("🧠 Detected raw state_dict format for MLP.")
            renamed = OrderedDict((k.replace("layers.", ""), v) for k, v in loaded.items())
            head = build_head()
            head.load_state_dict(renamed, strict=False)
            return head.eval()
        elif all(isinstance(v, torch.Tensor) for v in loaded.values()):
            logger.info("🧠 Detected plain state_dict format.")
            head = build_head()
            head.load_state_dict(loaded, strict=False)
            return head.eval()
        else:
            raise ValueError(f"❌ Unrecognized dict format in aesthetic head. Keys: {list(loaded.keys())}")
    else:
        logger.info("🧠 Detected direct model object.")
        return loaded.eval()

def load_clip_model() -> tuple[torch.nn.Module, callable]:
    logger.info("🔧 Creating ViT-B/16 model and transforms...")
    model, preprocess = clip.load("ViT-B/16", device=device)
    model.eval()
    logger.info("✅ Model and transforms created.")
    return model, preprocess

# One-time global setup
_clip_model, preprocess = load_clip_model()
regression_head = load_aesthetic_head(HEAD_PATH)
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
    _aesthetic_processor = CLIPProcessor.from_pretrained(SCORER_DIR, use_fast=False)
    _aesthetic_backbone = CLIPVisionModel.from_pretrained(CLIP_BASE_DIR, local_files_only=True).to(device)
    loaded = torch.load(SCORER_MODEL_PATH, map_location=device)
    if isinstance(loaded, dict) and all(isinstance(v, torch.Tensor) for v in loaded.values()):
      scorer = AestheticScorer(_aesthetic_backbone)
      scorer.load_state_dict(loaded, strict=False)
      _aesthetic_scorer = scorer
    else:
      _aesthetic_scorer = loaded
    _aesthetic_scorer.eval()
    logger.info("✅ Aesthetic scorer loaded.")
  except Exception as e:
    logger.error(f"⚠️ Failed to load aesthetic scorer: {e}")
    _aesthetic_scorer = None
    _aesthetic_processor = None
    _aesthetic_backbone = None

load_aesthetic_scorer()

async def score_aesthetic(req: Request) -> float:
  img_bytes = await req.body()
  img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

  with torch.no_grad():
    image_tensor = preprocess(img).unsqueeze(0)
    image_features = _clip_model.encode_image(image_tensor)
    image_features /= image_features.norm(dim=-1, keepdim=True)
    score_tensor = regression_head(image_features)
    score = score_tensor.item()

  return float(score)

def _grayscale_np(img: Image.Image, size: int = 256) -> np.ndarray:
  resized = img.resize((size, size))
  return (np.array(resized.convert("L"), dtype=np.float32) / 255.0)

def _edges_intensity(img: Image.Image, size: int = 256) -> np.ndarray:
  resized = img.resize((size, size))
  edges = resized.filter(ImageFilter.FIND_EDGES).convert("L")
  return (np.array(edges, dtype=np.float32) / 255.0)

def _rule_of_thirds_score(edge_map: np.ndarray) -> float:
  if edge_map.size == 0:
    return 0.0
  h, w = edge_map.shape
  ys = np.linspace(0, h - 1, h, dtype=np.float32)
  xs = np.linspace(0, w - 1, w, dtype=np.float32)
  yy, xx = np.meshgrid(ys, xs, indexing="ij")
  thirds_y = np.array([h / 3, 2 * h / 3], dtype=np.float32)
  thirds_x = np.array([w / 3, 2 * w / 3], dtype=np.float32)
  sigma = min(h, w) / 12
  weight = np.zeros_like(edge_map, dtype=np.float32)
  for ty in thirds_y:
    for tx in thirds_x:
      weight += np.exp(-(((yy - ty) ** 2 + (xx - tx) ** 2) / (2 * sigma ** 2)))
  weighted = float((edge_map * weight).sum())
  total = float(edge_map.sum())
  if total <= 0:
    return 0.0
  ratio = weighted / total
  return float(max(0.0, min(10.0, ratio * 10)))

def _visual_interest_score(edge_map: np.ndarray) -> float:
  mean_edge = float(edge_map.mean())
  score = mean_edge * 60.0
  return float(max(0.0, min(10.0, score)))

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

def _score_with_aesthetic_model(img: Image.Image) -> dict | None:
  if _aesthetic_scorer is None or _aesthetic_processor is None:
    return None
  inputs = _aesthetic_processor(images=img, return_tensors="pt")["pixel_values"].to(device)
  with torch.no_grad():
    scores = _aesthetic_scorer(inputs)
  labels = ["overall", "quality", "composition", "lighting", "color", "depth_of_field", "content"]
  return {label: float(score.item()) for label, score in zip(labels, scores)}

async def score_photo_tips(req: Request) -> dict:
  img_bytes = await req.body()
  img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
  edge_map = _edges_intensity(img)
  gray = _grayscale_np(img)
  thirds_score = _rule_of_thirds_score(edge_map)
  interest_score = _visual_interest_score(edge_map)
  sharpness_score = _sharpness_score(gray)
  composition = (interest_score * 0.8) + (thirds_score * 0.2)
  sharpness_factor = 0.9 + (sharpness_score / 20.0)
  model_scores = _score_with_aesthetic_model(img)
  model_overall = (model_scores["overall"] * 2) if model_scores else None
  base_overall = composition if model_overall is None else ((model_overall * 0.7) + (composition * 0.3))
  overall_score = base_overall * sharpness_factor
  tips = []
  if thirds_score < 4:
    tips.append("Try placing the subject near rule-of-thirds intersections.")
  if interest_score < 4:
    tips.append("Add more texture, contrast, or a clearer subject to increase visual interest.")
  if sharpness_score < 4:
    tips.append("Looks a bit soft; try a faster shutter or steadier shot.")
  if not tips:
    tips.append("Strong composition and visual interest.")
  return {
    "rule_of_thirds_score": round(thirds_score, 2),
    "visual_interest_score": round(interest_score, 2),
    "sharpness_score": round(sharpness_score, 2),
    "overall_score": round(max(0.0, min(10.0, overall_score)) * 10, 1),
    "model_scores": model_scores,
    "tips": tips,
  }
