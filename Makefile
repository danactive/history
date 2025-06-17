login:
	@echo "🔐 Logging in to Hugging Face CLI..."
	huggingface-cli login
	@echo "Verify account"
	huggingface-cli whoami

load-weights:
	docker build \
		--build-arg MODEL_REPO="$(MODEL_REPO)" \
		--build-arg FILENAMES="$(FILENAMES)" \
		-f apps/load-weights/Dockerfile \
		-t weights-loader .
	docker create --name extract-model weights-loader
	docker cp extract-model:/dock/models/. ./models/
	docker rm extract-model

build-ai-api:
	docker build -f apps/api/Dockerfile -t ai-api .

ai-api:
	docker run -p 8080:8080 ai-api
