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
		-e FILENAMES="$(FILENAMES)" \
		weights-loader \
		sh -c 'python /dock/hugging-offline.py --repo-id "$$MODEL_REPO" --filenames $$FILENAMES > /dock/build.log 2>&1'
	@echo "Part 3/3 Copying weights to local directory and display log"
	docker cp extract-model:/dock/models/. ./models/
	docker cp extract-model:/dock/build.log ./weights.log || true
	docker rm extract-model
	cat ./weights.log || true

load-aesthetic-scorer:
	$(MAKE) load-clip-vit-base-patch32
	$(MAKE) load-weights MODEL_REPO="rsinema/aesthetic-scorer" \
		FILENAMES="model.pt preprocessor_config.json tokenizer.json tokenizer_config.json special_tokens_map.json merges.txt vocab.json"

load-clip-vit-base-patch32:
	$(MAKE) load-weights MODEL_REPO="openai/clip-vit-base-patch32" \
		FILENAMES="pytorch_model.bin config.json preprocessor_config.json tokenizer.json tokenizer_config.json special_tokens_map.json merges.txt vocab.json"

build-ai-api:
	docker build -f apps/api/Dockerfile -t ai-api .

ai-api:
	# OpenAI model stores in ~/.cache/clip
	docker run --rm --name ai-api -p 8080:8080 \
		-v $(HOME)/.cache/clip:/root/.cache/clip \
		ai-api

build-test:
	docker build  -f apps/api/Dockerfile --build-arg INSTALL_TEST=true -t ai-api-test .

test:
	docker run --rm --entrypoint pytest ai-api-test -v

