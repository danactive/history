# 🌿 iNaturalist 2021 Image Classifier (FastAPI + EVA-CLIP)

This project serves a high-accuracy image classification API using a **Vision Transformer** model fine-tuned on the **iNaturalist 2021** biodiversity dataset. It supports top-k prediction and an optional debug mode with detailed logits, scores, and resized input images.

## 🧠 Model Details

- **Model Family**: [`timm`](https://github.com/rwightman/pytorch-image-models)
- **Model Name**: `eva02_large_patch14_clip_336.merged2b_ft_inat21`
- **Source**: Hugging Face Hub via `hf-hub:timm/eva02_large_patch14_clip_336.merged2b_ft_inat21`
- **Architecture**: Vision Transformer (EVA-CLIP backbone)
- **Pretraining**: Internally pre-trained CLIP-like architecture
- **Fine-tuned On**: iNaturalist 2021 (10,000+ species of plants, animals, fungi, and microbes)
- **Output Classes**: Mapped using `inat21_class_index.json`
- **Label URL**: Provided via `model.default_cfg['label_url']`

## 🖼️ Input Format

- Accepts raw image bytes (e.g., `image/jpeg`, `image/png`)
- Auto-converted to RGB using Pillow
- Resized to 384x384, then center cropped to 336x336
- Normalized using CLIP-style mean and std values:
  - `mean = [0.48145466, 0.4578275, 0.40821073]`
  - `std = [0.26862954, 0.26130258, 0.27577711]`

## CLI commands
- `docker build -f scripts/api/Dockerfile -t image-classifier .`
- `docker run -p 8080:8080 image-classifier`
