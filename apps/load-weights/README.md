Hugging Face timm https://huggingface.co/timm/convnext_large_mlp.laion2b_ft_augreg_inat21

1. Create account and tokens from https://huggingface.co/settings/tokens
1. Log into Hugging Face via CLI `make login`


## Image classifier

`make load-weights MODEL_REPO=timm/eva02_large_patch14_clip_336.merged2b_ft_inat21 FILENAMES="pytorch_model.bin"`

## Aesthetic Scorer

`make load-weights MODEL_REPO=apple/DFN5B-CLIP-ViT-H-14-378 FILENAMES="open_clip_pytorch_model.bin open_clip_config.json"`


`make load-weights MODEL_REPO=CrowsonKB/simulacra-aesthetic-model FILENAMES="simulacra_aesthetic_model.pth"`
