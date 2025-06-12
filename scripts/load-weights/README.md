Hugging Face timm https://huggingface.co/timm/convnext_large_mlp.laion2b_ft_augreg_inat21

1. Create account and tokens from https://huggingface.co/settings/tokens
2. Add token as git credential: Yes
3. Verify Hugging tokens `cat ~/.cache/huggingface/token`
3. Mount Hugging Face token at Docker runtime. execute from project root
```
docker build -f scripts/load-weights/Dockerfile -t weights-loader .

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
