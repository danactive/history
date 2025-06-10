import json
import uvicorn

# Load config.json
with open("/config.json", "r") as config:
    config = json.load(config)

# Extract port
port = config.get("pythonPort")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=port)
