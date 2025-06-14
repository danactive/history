from fastapi import Request
import torch
import timm
import json
from PIL import Image
import torchvision.transforms as T
import base64
import io
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)

# Load class labels
with open("inat21_class_index.json", "r") as f:
  idx_to_label = json.load(f)

# Offline model setup
model_name = "eva02_large_patch14_clip_336"  # base architecture name
checkpoint_path = "models/timm_eva02_large_patch14_clip_336.merged2b_ft_inat21/pytorch_model.bin"

# Load model without pretraining, then load offline weights
model = timm.create_model(model_name, pretrained=False, num_classes=len(idx_to_label))
try:
    checkpoint = torch.load(checkpoint_path, map_location="cpu")
    model.load_state_dict(checkpoint)
    model.eval()
except Exception as e:
    logger.debug("Error loading model:", e)

# Image transform
raw_size = 384
input_size = 336

transform = T.Compose([
  T.Resize(raw_size),
  T.CenterCrop(input_size),
  T.ToTensor(),
  T.Normalize(
    mean=[0.48145466, 0.4578275, 0.40821073],
    std=[0.26862954, 0.26130258, 0.27577711]
  )
])

# To show transformed image for debug
debug_transform = T.Compose([
  T.Resize(raw_size),
  T.CenterCrop(input_size),
])

async def classify_image(req: Request, debug: bool):
  img_bytes = await req.body()
  img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

  # Image preparation
  resized_img = debug_transform(img)
  input_tensor = transform(img).unsqueeze(0)

  with torch.no_grad():
    logits = model(input_tensor)
    probs = torch.nn.functional.softmax(logits, dim=1)
    topk = torch.topk(probs, k=3)

  results = [
    {
      "label": idx_to_label.get(str(idx.item()), f"Unknown ({idx.item()})"),
      "score": float(score)
    }
    for idx, score in zip(topk.indices[0], topk.values[0])
  ]

  if not debug:
    return {"predictions": results}, {}

  # Debug details
  topk_debug = torch.topk(probs, k=50)
  top_50 = [
    {
      "label": idx_to_label.get(str(idx.item()), f"Unknown ({idx.item()})"),
      "score": float(score)
    }
    for idx, score in zip(topk_debug.indices[0], topk_debug.values[0])
  ]

  buffered = io.BytesIO()
  resized_img.save(buffered, format="JPEG")
  img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

  return {
    "predictions": results,
    "top_50": top_50,
    "logits_shape": list(logits.shape),
    "max_prob": float(probs.max()),
    "min_prob": float(probs.min()),
    "resized_image": img_base64,
    "confirm_order": "offline_weights_loaded",
  }
