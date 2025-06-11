# Dockerfile
FROM python:3.11-slim

WORKDIR /

# Install dependencies
RUN pip install fastapi uvicorn timm torch torchvision pillow

COPY config.json /config.json
COPY main.py /main.py
COPY start.py /start.py
COPY inat21_class_index.json /inat21_class_index.json

CMD ["python", "/start.py"]
