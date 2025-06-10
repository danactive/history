from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2, decode_predictions, preprocess_input
)
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io

app = FastAPI()
model = MobileNetV2(weights="imagenet")

@app.post("/classify")
async def classify_image(req: Request):
    try:
        # This reads raw image/jpeg bytes
        body = await req.body()

        # Load and process the image
        img = Image.open(io.BytesIO(body)).convert("RGB")
        img = img.resize((224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        # Predict
        preds = model.predict(img_array)
        decoded = decode_predictions(preds, top=3)[0]

        return {
            "predictions": [
                {"label": label, "description": desc, "score": float(score)}
                for (label, desc, score) in decoded
            ]
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
