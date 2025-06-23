import json
import logging
import uvicorn

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)

# Load config.json
with open("/dock/config.json", "r") as config:
    config = json.load(config)

# Extract port
port = config.get("pythonPort")

if __name__ == "__main__":
    logger.debug(f"Starting Uvicorn server on port {port}...")
    try:
        uvicorn.run("main:main_py_app", host="0.0.0.0", port=port, log_level="debug", access_log=True)
    except Exception as e:
        logger.error(f"Uvicorn failed to start: {e}")
