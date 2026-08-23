from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import logging
import sys

from aesthetic import score_photo_tips
import architecture
import classify
import photo_classify
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
    organism_health = classify.engine.health()
    architecture_health = architecture.engine.health()
    health = {
        "status": organism_health["status"],
        "classifiers": {
            "organism": organism_health,
            "architecture": architecture_health,
        },
    }
    return JSONResponse(
        status_code=200 if classify.engine.ready else 503,
        content=health,
    )

def error_response(e: Exception):
    logger.exception("Python API request failed")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )

@main_py_app.post("/classify/organism")
async def classify_organism_endpoint(req: Request):
    try:
        results = await classify.classify_image(req)
        return results
    except HTTPException as error:
        return JSONResponse(status_code=error.status_code, content={"error": str(error.detail)})
    except ClassifierUnavailable as error:
        return JSONResponse(status_code=503, content={"error": str(error)})
    except Exception as error:
        return error_response(error)


@main_py_app.post("/classify/architecture")
async def classify_architecture_endpoint(req: Request):
    try:
        results = await architecture.classify_image(req)
        return results
    except HTTPException as error:
        return JSONResponse(status_code=error.status_code, content={"error": str(error.detail)})
    except ClassifierUnavailable as error:
        return JSONResponse(status_code=503, content={"error": str(error)})
    except Exception as error:
        return error_response(error)


@main_py_app.post("/classify/photo")
async def classify_photo_endpoint(req: Request):
    try:
        results = await photo_classify.classify_photo(req)
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
        return await score_photo_tips(req)
    except Exception as e:
        return error_response(e)
