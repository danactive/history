FROM python:3.11-slim

ARG MODEL_REPO
ARG FILENAMES

ENV MODEL_REPO="${MODEL_REPO}"
ENV FILENAMES="${FILENAMES}"
# Ensures Python output shows up immediately
ENV PYTHONUNBUFFERED=1

WORKDIR /dock

COPY apps/load-weights/requirements.txt /dock/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/load-weights/hugging-offline.py /dock/hugging-offline.py

RUN echo "MODEL_REPO: '$MODEL_REPO'"
RUN echo "FILENAMES: '$FILENAMES'"
RUN python /dock/hugging-offline.py --repo-id "$MODEL_REPO" --filenames $(echo $FILENAMES)
