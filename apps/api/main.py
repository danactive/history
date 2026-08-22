from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import logging
import sys

from aesthetic import score_photo_tips
import classify
from classifier_engine import ClassifierUnavailable

# Setup logging once
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)

logger.debug("FastAPI is initializing...")

@asynccontextmanager
async def lifespan(_: FastAPI):
    await classify.initialize_classifier()
    yield


main_py_app = FastAPI(lifespan=lifespan)

@main_py_app.get("/health")
def health_check():
    health = classify.engine.health()
    return JSONResponse(
        status_code=200 if classify.engine.ready else 503,
        content=health,
    )

def error_response(e: Exception):
    logger.exception("Python API request failed")
    return JSONResponse(
        status_code=500,
        content={"error": str(e)},
    )

@main_py_app.post("/classify")
async def classify_endpoint(req: Request):
    try:
        results = await classify.classify_image(req)
        return results
    except HTTPException as error:
        return JSONResponse(status_code=error.status_code, content={"error": str(error.detail)})
    except ClassifierUnavailable as error:
        return JSONResponse(status_code=503, content={"error": str(error)})
    except Exception as error:
        return error_response(error)

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
