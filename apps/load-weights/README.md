Hugging Face timm https://huggingface.co/timm/convnext_large_mlp.laion2b_ft_augreg_inat21

1. Create account and tokens from https://huggingface.co/settings/tokens
1. Log into Hugging Face via CLI `make login`


## Image classifier
1. Build container `make build-load-weights MODEL_REPO=timm/eva02_large_patch14_clip_336.merged2b_ft_inat21 FILENAMES="pytorch_model.bin"`
1. Run container
```
docker run --rm \
  -v "$HOME/.cache/huggingface":/root/.cache/huggingface \
  weights-loader
```

Then copy from the Hugging Face cache to the repo
- `mkdir -p models/timm_eva02_large_patch14_clip_336.merged2b_ft_inat21`
- ```
cp $HOME/.cache/huggingface/hub/models--timm--eva02_large_patch14_clip_336.merged2b_ft_inat21/snapshots/*/pytorch_model.bin \
   models/timm_eva02_large_patch14_clip_336.merged2b_ft_inat21/
```
