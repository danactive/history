FROM python:3.11-slim

WORKDIR /dock

COPY scripts/load-weights/requirements.txt /dock/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts/load-weights/hugging-offline.py /dock/hugging-offline.py

CMD ["python", "/dock/hugging-offline.py"]
