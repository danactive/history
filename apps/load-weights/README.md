Hugging Face timm https://huggingface.co/timm/convnext_large_mlp.laion2b_ft_augreg_inat21

1. Create account and tokens from https://huggingface.co/settings/tokens
1. Log into Hugging Face via CLI `make login`


## Image classifier

`make load-weights MODEL_REPO=timm/eva02_large_patch14_clip_336.merged2b_ft_inat21 FILENAMES="pytorch_model.bin"`

## BioCLIP 2 classifier

The BioCLIP 2 model and official TreeOfLife-200M species index have separate immutable revisions,
file lists, and SHA-256 values pinned in `apps/load-weights/manifests`.

```sh
make load-bioclip2
```

The verified model is stored in `models/imageomics_bioclip-2`; the taxonomy and precomputed text
embeddings are stored in `models/imageomics_TreeOfLife-200M`. Only the safetensors checkpoint is
downloaded; the duplicate pickle checkpoint is intentionally omitted.

## Aesthetic Scorer

No longer uses weights loader
