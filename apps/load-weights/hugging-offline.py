# One-time Hugging Face model fetcher (store offline)

import argparse
from huggingface_hub import hf_hub_download
from huggingface_hub.utils import RepositoryNotFoundError, HfHubHTTPError
import shutil
import os
import sys
import logging
import subprocess

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG, force=True)
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def log_huggingface_whoami():
    logger.info("🔑 Checking Hugging Face authentication with 'huggingface-cli whoami'...")
    try:
        result = subprocess.run(
            ["huggingface-cli", "whoami"],
            capture_output=True,
            text=True,
            check=True
        )
        logger.info(f"Hugging Face user: {result.stdout.strip()}")
    except Exception as e:
        logger.error(f"❌ Unable to verify Hugging Face authentication: {e}")

def download_weights(repo_id: str, filenames: list[str]):
    log_huggingface_whoami()
    # Create destination path
    dest_dir = os.path.join("models", repo_id.replace("/", "_"))
    os.makedirs(dest_dir, exist_ok=True)

    for filename in filenames:
        logger.info(f"📥 Downloading {filename} from {repo_id} on Hugging Face Hub...")
        try:
            path = hf_hub_download(repo_id=repo_id, filename=filename)
            # Move and rename
            dest_path = os.path.join(dest_dir, filename)
            shutil.copy(path, dest_path)
            logger.info(f"✅ Saved {filename} to {dest_path}")
        except (RepositoryNotFoundError, HfHubHTTPError) as e:
            logger.error(f"❌ Failed to fetch '{filename}' from '{repo_id}': {e}")
            continue

    # Verification step
    missing = []
    for filename in filenames:
        dest_path = os.path.join(dest_dir, filename)
        if not os.path.isfile(dest_path):
            missing.append(filename)
    if missing:
        logger.error(f"❌ The following files are missing after download: {missing}")
    else:
        logger.info(f"✅ All expected files present in: {dest_dir}")

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Download Hugging Face model weights")
  parser.add_argument(
    "--repo-id",
    required=True,
    help="Hugging Face repository ID (e.g., openai/clip-vit-base-patch32)"
  )
  parser.add_argument(
    "--filenames",
    nargs="+",
    default=["pytorch_model.bin", "config.json"],
    help="List of filenames to download (space-separated)"
  )
  args = parser.parse_args()
  download_weights(args.repo_id, args.filenames)
