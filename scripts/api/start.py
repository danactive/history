import json
import uvicorn

# Load config.json
with open("/dock/config.json", "r") as config:
    config = json.load(config)

# Extract port
port = config.get("pythonPort")

if __name__ == "__main__":
    uvicorn.run("main:main_py_app", host="0.0.0.0", port=port)
