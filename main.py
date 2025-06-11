# Model Family: timm (PyTorch Image Models) library
# Model: iNat2021 fine-tuned model (e.g., tf_efficientnetv2_s_in21k)
# Training Dataset: iNaturalist 2021 (a biodiversity dataset with 10k+ species)
# Label Source: inat21_class_index.json used to map model outputs to species names

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from PIL import Image
import io
import torch
import timm
import json
import torchvision.transforms as T

# Load class index map
with open("inat21_class_index.json", "r") as f:
    idx_to_label = json.load(f)

# Load fine-tuned model
model_name = "tf_efficientnetv2_s_in21ft1k"
model = timm.create_model(model_name, pretrained=True, num_classes=len(idx_to_label))
model.eval()

app = FastAPI()

# Image transform (match model expectations)
transform = T.Compose([
    T.Resize((384, 384)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/classify")
async def classify_image(req: Request):
    try:
        # This reads raw image/jpeg bytes
        img_bytes = await req.body()

        # Load and process the image
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        input_tensor = transform(img).unsqueeze(0)  # shape: (1, 3, 384, 384)

        with torch.no_grad():
            logits = model(input_tensor)
            probs = torch.nn.functional.softmax(logits, dim=1)
            topk = torch.topk(probs, k=3)

        results = []
        for idx, score in zip(topk.indices[0], topk.values[0]):
            label = idx_to_label.get(str(idx.item()), f"Unknown ({idx.item()})")
            results.append({
                "label": label,
                "score": float(score)
            })

        return {"predictions": results}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
