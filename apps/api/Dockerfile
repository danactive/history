FROM python:3.11-slim

WORKDIR /dock

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY apps/api/requirements.txt /dock/requirements.txt
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY apps/api/ /dock/
COPY config.json /dock/config.json
COPY models /dock/models

CMD ["python", "start.py"]
