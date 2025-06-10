# Dockerfile
FROM python:3.11-slim

WORKDIR /

# Install dependencies
RUN pip install --no-cache-dir fastapi uvicorn tensorflow pillow python-multipart

COPY config.json /config.json
COPY main.py /main.py
COPY start.py /start.py

CMD ["python", "/start.py"]
