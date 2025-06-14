from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
import sys
import logging

from classify import classify_image

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.ERROR)

logger.debug("FastAPI is initializing...")

main_py_app = FastAPI()

@main_py_app.get("/health")
def health_check():
    return {"status": "ok"}

@main_py_app.post("/classify")
async def classify_endpoint(req: Request, debug: bool = Query(False)):
  try:
    results, debug_data = await classify_image(req, debug)

    if not debug:
      return {"predictions": results}

    return {
      "predictions": results,
      **debug_data
    }

  except Exception as e:
    import traceback
    error_trace = traceback.format_exc()

    logger.error(f"Exception occurred: {str(e)}\n{error_trace}")

    return JSONResponse(
      status_code=500,
      content={
        "error": str(e),
        "trace": error_trace
      }
    )
