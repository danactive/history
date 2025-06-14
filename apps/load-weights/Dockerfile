FROM python:3.11-slim

ARG MODEL_REPO
ARG FILENAMES

WORKDIR /dock

COPY apps/load-weights/requirements.txt /dock/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/load-weights/hugging-offline.py /dock/hugging-offline.py

RUN python /dock/hugging-offline.py --repo-id "$MODEL_REPO" --filenames $FILENAMES
