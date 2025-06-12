FROM python:3.11-slim

WORKDIR /dock

COPY scripts/load-weights/requirements.txt /dock/requirements.txt
RUN pip install --no-cache-dir -r /dock/requirements.txt

COPY scripts/load-weights/hugging.py /dock/hugging.py

CMD ["python", "/dock/hugging.py"]
