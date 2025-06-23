FROM python:3.11-slim

WORKDIR /dock

ARG INSTALL_TEST=false

# forces computations to run single-threaded, improving consistency by eliminating variations caused by multi-threaded execution.
ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1

# PyTest
ENV PYTHONPATH="/dock"

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
COPY config.json /dock/config.json
COPY models /dock/models

CMD ["python", "start.py"]
