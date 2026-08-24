from fastapi import Request
from PIL import Image
from starlette.concurrency import run_in_threadpool

from architecture_engine import ArchitectureClassifier
from classify import classification_request


engine = ArchitectureClassifier()


async def classify_loaded_image(
    image: Image.Image,
    metadata: dict[str, str | None],
):
    return await run_in_threadpool(engine.classify, image, metadata)


async def classify_image(request: Request):
    image, metadata = await classification_request(request)
    return await classify_loaded_image(image, metadata)
