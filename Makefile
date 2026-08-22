login-check:
	huggingface-cli whoami

login:
	@echo "🔐 Logging in to Hugging Face CLI..."
	huggingface-cli login
	@echo "Verify account"
	huggingface-cli whoami

load-weights:
	@echo "Part 1/3 Build docker image"
	docker build \
		--build-arg MODEL_REPO="$(MODEL_REPO)" \
		--build-arg FILENAMES="$(FILENAMES)" \
		-f apps/load-weights/Dockerfile \
		-t weights-loader .
	@echo "Part 2/3 Extracting weights from Hugging Face using cached credential"
	docker run --name extract-model \
		-v $$HOME/.cache/huggingface:/root/.cache/huggingface \
		-e MODEL_REPO="$(MODEL_REPO)" \
		-e MODEL_REVISION="$(MODEL_REVISION)" \
		-e FILENAMES="$(FILENAMES)" \
		weights-loader \
		sh -c 'python /dock/hugging-offline.py --repo-id "$$MODEL_REPO" --revision "$$MODEL_REVISION" --filenames $$FILENAMES > /dock/build.log 2>&1'
	@echo "Part 3/3 Copying weights to local directory and display log"
	docker cp extract-model:/dock/models/. ./models/
	docker cp extract-model:/dock/build.log ./weights.log || true
	docker rm extract-model
	cat ./weights.log || true

load-bioclip2:
	@echo "Downloading the pinned BioCLIP 2 model and TreeOfLife species index"
	docker build \
		-f apps/load-weights/Dockerfile \
		-t weights-loader .
	docker run --name extract-model \
		-v $$HOME/.cache/huggingface:/root/.cache/huggingface \
		-e HF_HUB_DISABLE_XET=1 \
		weights-loader \
		sh -c 'python /dock/hugging-offline.py --manifest /dock/manifests/bioclip-2.json > /dock/build.log 2>&1 && \
			python /dock/hugging-offline.py --manifest /dock/manifests/treeoflife-200m-bioclip2.json >> /dock/build.log 2>&1'
	docker cp extract-model:/dock/models/. ./models/
	docker cp extract-model:/dock/build.log ./weights.log || true
	docker rm extract-model
	cat ./weights.log || true

load-architecture-classifier:
	@echo "Downloading the pinned SigLIP 2 architecture classifier"
	docker build \
		-f apps/load-weights/Dockerfile \
		-t weights-loader .
	docker run --name extract-architecture-model \
		-v $$HOME/.cache/huggingface:/root/.cache/huggingface \
		-e HF_HUB_DISABLE_XET=1 \
		weights-loader \
		sh -c 'python /dock/hugging-offline.py --manifest /dock/manifests/siglip2-base-patch16-224.json > /dock/build.log 2>&1'
	docker cp extract-architecture-model:/dock/models/. ./models/
	docker cp extract-architecture-model:/dock/build.log ./weights.log || true
	docker rm extract-architecture-model
	cat ./weights.log || true

load-aesthetic-scorer:
	@[ -n "$(AESTHETIC_SCORER_REVISION)" ] || (echo "Set AESTHETIC_SCORER_REVISION to an immutable commit hash before download"; exit 1)
	$(MAKE) load-clip-vit-base-patch32
	$(MAKE) load-weights MODEL_REPO="rsinema/aesthetic-scorer" \
		MODEL_REVISION="$(AESTHETIC_SCORER_REVISION)" \
		FILENAMES="model.pt preprocessor_config.json tokenizer.json tokenizer_config.json special_tokens_map.json merges.txt vocab.json"

load-clip-vit-base-patch32:
	@[ -n "$(CLIP_VIT_REVISION)" ] || (echo "Set CLIP_VIT_REVISION to an immutable commit hash before download"; exit 1)
	$(MAKE) load-weights MODEL_REPO="openai/clip-vit-base-patch32" \
		MODEL_REVISION="$(CLIP_VIT_REVISION)" \
		FILENAMES="pytorch_model.bin config.json preprocessor_config.json tokenizer.json tokenizer_config.json special_tokens_map.json merges.txt vocab.json"

build-ai-api:
	docker build -f apps/api/Dockerfile -t ai-api .

ai-api:
	# OpenAI model stores in ~/.cache/clip
	@container_id="$$(docker ps -aq --filter name=^/ai-api$$)"; \
	current_image="$$(docker image inspect ai-api:latest --format '{{.Id}}')"; \
	if [ -n "$$container_id" ]; then \
		container_image="$$(docker inspect "$$container_id" --format '{{.Image}}')"; \
		container_running="$$(docker inspect "$$container_id" --format '{{.State.Running}}')"; \
		if [ "$$container_running" = "true" ] && [ "$$container_image" = "$$current_image" ]; then \
			echo "ai-api is already running at http://localhost:8080"; \
			exit 0; \
		fi; \
		echo "Replacing stale ai-api container"; \
		docker rm -f "$$container_id" >/dev/null; \
	fi; \
	docker run --rm --name ai-api -p 8080:8080 \
		-v $(HOME)/.cache/clip:/root/.cache/clip \
		-v $(PWD)/models/google_siglip2-base-patch16-224:/dock/models/google_siglip2-base-patch16-224:ro \
		-v $(PWD)/models/imageomics_TreeOfLife-200M:/dock/models/imageomics_TreeOfLife-200M:ro \
		ai-api

build-test:
	docker build  -f apps/api/Dockerfile --build-arg INSTALL_TEST=true -t ai-api-test .

test:
	docker run --rm \
		-v $(HOME)/.cache/clip:/root/.cache/clip:ro \
		-v $(PWD)/models/google_siglip2-base-patch16-224:/dock/models/google_siglip2-base-patch16-224:ro \
		-v $(PWD)/models/imageomics_TreeOfLife-200M:/dock/models/imageomics_TreeOfLife-200M:ro \
		--entrypoint pytest ai-api-test -v
