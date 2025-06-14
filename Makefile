login:
	@echo "🔐 Logging in to Hugging Face CLI..."
	huggingface-cli login
	@echo "Verify account"
	huggingface-cli whoami

build-load-weights:
	docker build \
		--build-arg MODEL_REPO=$(MODEL_REPO) \
		--build-arg FILENAMES="$(FILENAMES)" \
		-f apps/load-weights/Dockerfile \
		-t weights-loader .
