from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
import sys
import traceback
from aesthetic import score_photo_tips
from classify import classify_image

# Setup logging once
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)

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
async def classify_endpoint(req: Request):
    try:
        results = await classify_image(req)
        return results
    except Exception as e:
        return error_response(e)

@main_py_app.post("/scores")
async def score_endpoint(req: Request):
    try:
        result = await score_photo_tips(req)
        # Backwards compatibility for callers/tests that still expect aesthetic_score.
        if isinstance(result, dict) and "aesthetic_score" not in result:
            score_value = result.get("overall_score")
            if isinstance(score_value, (int, float)):
                result["aesthetic_score"] = float(score_value)
        return result
    except Exception as e:
        return error_response(e)
