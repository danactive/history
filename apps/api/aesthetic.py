import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as T
import open_clip
import logging
from collections import OrderedDict

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
_clip_model, _preprocess = load_clip_model()
_regression_head = load_aesthetic_head(HEAD_PATH)

def score_aesthetic(pil_image: Image.Image) -> float:
    transform = T.Compose([
        T.Resize(224, interpolation=T.InterpolationMode.BICUBIC),
        T.CenterCrop(224),
        T.ToTensor(),
        T.Normalize(
            mean=(0.48145466, 0.4578275, 0.40821073),
            std=(0.26862954, 0.26130258, 0.27577711)
        ),
    ])
    image_tensor = transform(pil_image).unsqueeze(0)

    with torch.no_grad():
        image_features = _clip_model.encode_image(image_tensor)
        image_features /= image_features.norm(dim=-1, keepdim=True)
        aesthetic_score = _regression_head(image_features).item()

    return float(aesthetic_score)
