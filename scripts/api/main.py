from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
from PIL import Image
from timm import list_models
import io
import torch
import timm
import json
import torchvision.transforms as T
import base64

# Load label mapping
with open("inat21_class_index.json", "r") as f:
    idx_to_label = json.load(f)

model_name = "hf-hub:timm/eva02_large_patch14_clip_336.merged2b_ft_inat21"
model = timm.create_model(model_name, pretrained=True)
model.eval()

main_py_app = FastAPI()

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

@main_py_app.get("/health")
def health_check():
    return {"status": "ok"}

@main_py_app.post("/classify")
async def classify_image(req: Request, debug: bool = Query(False)):
    try:
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
            return {"predictions": results}

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
            "timm": list_models(pretrained=True, filter='hf-hub:*inat21*'),
            "confirm_order": model.default_cfg.get("label_url")
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
