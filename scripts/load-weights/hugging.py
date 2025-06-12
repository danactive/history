# See README.md for execute instructions

from huggingface_hub import hf_hub_download
import torch

# Your model repo and filename on HF
repo_id = "timm/convnext_large_mlp.laion2b_ft_augreg_inat21"
filename = "pytorch_model.bin"

print("Starting download...")
# Download with token authentication
path = hf_hub_download(repo_id=repo_id, filename=filename)
print(f"Download complete. File saved at: {path}")

# Load checkpoint from downloaded path
checkpoint = torch.load(path)
