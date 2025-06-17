from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
import logging
import sys
import traceback
from aesthetic import score_aesthetic
from classify import classify_image
from PIL import Image
import io

# Setup logging once
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.ERROR)

logger.debug("FastAPI is initializing...")

main_py_app = FastAPI()

@main_py_app.get("/health")
def health_check():
    return {"status": "ok"}

def error_response(e: Exception):
    trace = traceback.format_exc()
    logger.error(f"Exception occurred: {str(e)}\n{trace}")
    return JSONResponse(
        status_code=500,
        content={"error": str(e), "trace": trace}
    )

@main_py_app.post("/classify")
async def classify_endpoint(req: Request, debug: bool = Query(False)):
    try:
        results, debug_data = await classify_image(req, debug)
        return {"predictions": results} if not debug else {
            "predictions": results,
            **debug_data
        }
    except Exception as e:
        return error_response(e)

@main_py_app.post("/scores")
async def score_endpoint(req: Request):
    try:
        img_bytes = await req.body()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        score = score_aesthetic(img)
        return {"aesthetic_score": round(score, 3)}
    except Exception as e:
        return error_response(e)
