# One-time Hugging Face model fetcher (store offline)

import argparse
import hashlib
import json
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

def sha256_file(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_manifest(path: str) -> tuple[str, str, str | None, list[dict[str, str]]]:
    with open(path, "r", encoding="utf-8") as file:
        manifest = json.load(file)

    files = manifest.get("files")
    if not isinstance(files, list) or not files:
        raise ValueError("Model manifest must contain a non-empty files list")

    return manifest["repo_id"], manifest["revision"], manifest.get("repo_type"), files


def download_weights(
    repo_id: str,
    files: list[dict[str, str]],
    revision: str | None = None,
    repo_type: str | None = None,
) -> bool:
    log_huggingface_whoami()
    # Create destination path
    dest_dir = os.path.join("models", repo_id.replace("/", "_"))
    os.makedirs(dest_dir, exist_ok=True)

    failed = []
    for file_spec in files:
        filename = file_spec["name"]
        logger.info(f"📥 Downloading {filename} from {repo_id} on Hugging Face Hub...")
        try:
            path = hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                revision=revision or None,
                repo_type=repo_type,
            )
            dest_path = os.path.join(dest_dir, filename)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            staging_path = f"{dest_path}.partial"
            shutil.copy2(path, staging_path)

            expected_sha256 = file_spec.get("sha256")
            if expected_sha256:
                actual_sha256 = sha256_file(staging_path)
                if actual_sha256 != expected_sha256:
                    os.remove(staging_path)
                    raise ValueError(
                        f"SHA-256 mismatch for {filename}: expected {expected_sha256}, got {actual_sha256}"
                    )

            os.replace(staging_path, dest_path)
            logger.info(f"✅ Saved {filename} to {dest_path}")
        except (RepositoryNotFoundError, HfHubHTTPError, OSError, ValueError) as e:
            logger.error(f"❌ Failed to fetch '{filename}' from '{repo_id}': {e}")
            failed.append(filename)

    # Verification step
    missing = []
    for file_spec in files:
        filename = file_spec["name"]
        dest_path = os.path.join(dest_dir, filename)
        if not os.path.isfile(dest_path):
            missing.append(filename)
    failures = sorted(set(failed + missing))
    if failures:
        logger.error(f"❌ Model download incomplete: {failures}")
        return False

    logger.info(f"✅ All expected files present and verified in: {dest_dir}")
    return True

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Download Hugging Face model weights")
  parser.add_argument(
    "--manifest",
    help="JSON manifest with repo_id, immutable revision, filenames, and optional SHA-256 values"
  )
  parser.add_argument(
    "--repo-id",
    help="Hugging Face repository ID (e.g., openai/clip-vit-base-patch32)"
  )
  parser.add_argument(
    "--filenames",
    nargs="+",
    default=["pytorch_model.bin", "config.json"],
    help="List of filenames to download (space-separated)"
  )
  parser.add_argument(
    "--revision",
    default=None,
    help="Optional immutable model revision/commit to pin downloads"
  )
  args = parser.parse_args()

  if args.manifest:
      repo_id, revision, repo_type, files = load_manifest(args.manifest)
  else:
      if not args.repo_id:
          parser.error("--repo-id is required when --manifest is not supplied")
      repo_id = args.repo_id
      revision = args.revision
      repo_type = None
      files = [{"name": filename} for filename in args.filenames]

  if not download_weights(repo_id, files, revision, repo_type):
      sys.exit(1)
