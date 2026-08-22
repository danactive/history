import io
from urllib.parse import unquote

from fastapi import HTTPException, Request
from PIL import Image, UnidentifiedImageError
from starlette.concurrency import run_in_threadpool

from classifier_engine import BioClipClassifier


Image.MAX_IMAGE_PIXELS = 100_000_000
MAX_UPLOAD_BYTES = 75 * 1024 * 1024

engine = BioClipClassifier()


def classification_metadata(request: Request) -> dict[str, str | None]:
    encoded = request.headers.get("x-photo-metadata-encoding") == "percent"

    def header(name: str) -> str | None:
        value = request.headers.get(name)
        return unquote(value) if encoded and value is not None else value

    return {
        "photoDate": header("x-photo-date"),
        "latitude": header("x-photo-latitude"),
        "longitude": header("x-photo-longitude"),
        "city": header("x-photo-city"),
        "location": header("x-photo-location"),
    }


async def initialize_classifier() -> None:
    await run_in_threadpool(engine.initialize)


async def classification_request(
    request: Request,
) -> tuple[Image.Image, dict[str, str | None]]:
    image_bytes = await request.body()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image body is empty")
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 75 MB limit")

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as error:
        raise HTTPException(status_code=400, detail="Unsupported or invalid image") from error

    return image, classification_metadata(request)


async def classify_loaded_image(
    image: Image.Image,
    metadata: dict[str, str | None],
):
    return await run_in_threadpool(engine.classify, image, metadata)


async def classify_image(request: Request):
    image, metadata = await classification_request(request)
    return await classify_loaded_image(image, metadata)
