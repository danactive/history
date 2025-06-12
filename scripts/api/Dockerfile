FROM python:3.11-slim

WORKDIR /dock

COPY scripts/api/ /dock/
COPY config.json /dock/config.json

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "start.py"]
