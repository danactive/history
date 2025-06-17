from fastapi import Request
import torch
import torch.nn as nn
import torchvision.transforms as T
import open_clip
from PIL import Image
import logging
from collections import OrderedDict
import io

# Set up logging once
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)

HEAD_PATH = "models/aesthetic/ava+logos-l14-linearMSE.pth"
CHECKPOINT_PATH = "models/laion_CLIP-ViT-L-14-laion2B-s32B-b82K/open_clip_pytorch_model.bin"

def build_head():
    return nn.Sequential(
        nn.Linear(768, 1024),
        nn.ReLU(),
        nn.Linear(1024, 128),
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
        else:
            raise ValueError("❌ Unrecognized dict format in aesthetic head.")
    else:
        logger.info("🧠 Detected direct model object.")
        return loaded.eval()

def load_clip_model() -> tuple[torch.nn.Module, callable]:
    logger.info("🔧 Creating model and transforms...")
    model, _, preprocess = open_clip.create_model_and_transforms(
        'ViT-L-14',
        pretrained=None
    )
    model.eval()

    logger.info("✅ Model and transforms created.")
    logger.info(f"📦 Loading checkpoint from: {CHECKPOINT_PATH}")
    from open_clip import load_checkpoint
    load_checkpoint(model, CHECKPOINT_PATH)
    logger.info("✅ Checkpoint loaded.")

    return model, preprocess

# One-time global setup
_clip_model, preprocess = load_clip_model()
regression_head = load_aesthetic_head(HEAD_PATH)

async def score_aesthetic(req: Request) -> float:
  img_bytes = await req.body()
  img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

  with torch.no_grad():
    image_tensor = preprocess(img).unsqueeze(0)
    image_features = _clip_model.encode_image(image_tensor)
    image_features /= image_features.norm(dim=-1, keepdim=True)
    score = regression_head(image_features).item()

  return float(score)
