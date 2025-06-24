# 🌿 iNaturalist 2021 Image Classifier & LAION Aesthetic Scoring API

This project provides a robust FastAPI-based backend for two advanced computer vision endpoints:

- **Biodiversity Image Classification** using a fine-tuned Vision Transformer (ViT) on the iNaturalist 2021 dataset.
- **Aesthetic Scoring** using the LAION regression head on OpenAI CLIP ViT-B/16 features.

Both endpoints support raw image uploads, and leverage state-of-the-art models for their respective tasks while keeping our data private.

---

## 🧠 Model Details

### 1. Biodiversity Classifier

- **Model Family:** [`timm`](https://github.com/rwightman/pytorch-image-models)
- **Model Name:** `eva02_large_patch14_clip_336.merged2b_ft_inat21`
- **Source:** Hugging Face Hub
- **Architecture:** Vision Transformer (EVA-CLIP backbone)
- **Fine-tuned On:** iNaturalist 2021 (10,000+ species)
- **Output Classes:** Mapped using `inat21_class_index.json`

### 2. Aesthetic Scoring

- **Backbone:** OpenAI CLIP ViT-B/16
- **Regression Head:** Multilayer Perceptron (MLP) trained for aesthetic prediction ([LAION aesthetic predictor](https://github.com/LAION-AI/aesthetic-predictor))
- **Head Weights:** `models/aesthetic/sa_0_4_vit_b_16_linear.pth`
- **Feature Dimension:** 512

---

## 🚀 API Endpoints

### 1. `/classify` — Biodiversity Image Classification

**Description:**
Predicts the top-3 most likely species for a given image using a ViT model fine-tuned on iNaturalist 2021.

**Request:**
- **Method:** `POST`
- **Content-Type:** `image/jpeg` or `image/png`
- **Body:** Raw image bytes

**Example (using curl):**
```sh
curl -X POST -H "Content-Type: image/jpeg" --data-binary @your_image.jpg http://localhost:8080/classify
```

**Response:**
- **Status:** 200 OK
- **Content-Type:** `application/json`
- **Body:** JSON object with top-3 species predictions, e.g.,
```json
{
  "predictions": [
    {"species": "Cardinalis cardinalis", "score": 0.987},
    {"species": "Pica pica", "score": 0.005},
    {"species": "Corvus corax", "score": 0.003}
  ]
}
```

### 2. `/score` — Aesthetic Scoring

**Description:**
Predicts the aesthetic score of an image on a scale from 0 to 10 using the LAION regression head.

**Request:**
- **Method:** `POST`
- **Content-Type:** `image/jpeg` or `image/png`
- **Body:** Raw image bytes

**Example (using curl):**
```sh
curl -X POST -H "Content-Type: image/jpeg" --data-binary @your_image.jpg http://localhost:8080/score
```

**Response:**
- **Status:** 200 OK
- **Content-Type:** `application/json`
- **Body:** JSON object with the aesthetic score, e.g.,
```json
{
  "score": 7.5
}
```

---

## Local setup

1. Download the regression head:
   [sa_0_4_vit_b_16_linear.pth](https://github.com/LAION-AI/aesthetic-predictor/blob/main/sa_0_4_vit_b_16_linear.pth)
1. Place it in `models/aesthetic/sa_0_4_vit_b_16_linear.pth`
1. The OpenAI CLIP backbone weights for ViT-B/16 will be downloaded automatically on first run `make ai-api`
