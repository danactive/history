# One-time Hugging Face model fetcher (store offline)

import argparse
from huggingface_hub import hf_hub_download
from huggingface_hub.utils import RepositoryNotFoundError, HfHubHTTPError
import shutil
import os
import sys
import logging
import traceback

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG, force=True)
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def download_weights(repo_id: str, filenames: list[str]):
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
        except (RepositoryNotFoundError, HfHubHTTPError) as e:
            logger.error(f"❌ Failed to fetch '{filename}' from '{repo_id}': {e}")
            continue

    logger.info(f"✅ All saved to: {dest_dir}")

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
