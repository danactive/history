FROM python:3.11-slim

WORKDIR /dock

ARG INSTALL_TEST=false

# PyTest
ENV PYTHONPATH="/dock"
ENV HF_HUB_OFFLINE=1
ENV TRANSFORMERS_OFFLINE=1
ENV HF_HUB_DISABLE_TELEMETRY=1
ENV BIOCLIP_MODEL_DIR="/dock/models/imageomics_bioclip-2"
ENV CLASSIFIER_TAXONOMY_PATH="/dock/models/imageomics_TreeOfLife-200M/embeddings/txt_emb_species.json"
ENV CLASSIFIER_EMBEDDINGS_PATH="/dock/models/imageomics_TreeOfLife-200M/embeddings/txt_emb_species.npy"

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    # For CLIP in requirements.txt
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY apps/api/requirements.txt /dock/requirements.txt
COPY apps/api/requirements-dev.txt /dock/requirements-dev.txt

RUN python -m pip install --no-cache-dir -r requirements.txt
RUN if [ "$INSTALL_TEST" = "true" ]; then python -m pip install --no-cache-dir -r requirements-dev.txt; fi

COPY apps/api/ /dock/
COPY public/test/fixtures/classifier /dock/tests/fixtures/classifier
COPY config.json /dock/config.json
COPY models /dock/models

CMD ["python", "start.py"]
