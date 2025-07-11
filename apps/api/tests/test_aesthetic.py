from PIL import Image
from aesthetic import score_aesthetic

async def test_score_aesthetic_on_sample_image():
    img = Image.new("RGB", (224, 224), color="blue")  # deterministic image
    score = await score_aesthetic(img)
    assert isinstance(score, float)
    assert -1.0 <= score <= 1.0
