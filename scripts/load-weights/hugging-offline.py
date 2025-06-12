# One-time Hugging Face model fetcher (store offline)

from huggingface_hub import hf_hub_download
import shutil
import os

# Target model and file
repo_id = "timm/eva02_large_patch14_clip_336.merged2b_ft_inat21"
filename = "pytorch_model.bin"

print("Starting download from Hugging Face Hub...")
path = hf_hub_download(repo_id=repo_id, filename=filename)

# Create destination path
dest_dir = os.path.join("models", repo_id.replace("/", "_"))
os.makedirs(dest_dir, exist_ok=True)

# Move and rename
dest_path = os.path.join(dest_dir, filename)
shutil.copy(path, dest_path)

print(f"✅ Model saved to: {dest_path}")
