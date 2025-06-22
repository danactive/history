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
		sh -c 'python /dock/hugging-offline.py --repo-id "$$MODEL_REPO" --filenames "$$FILENAMES" > /dock/build.log 2>&1'
	@echo "Part 3/3 Copying weights to local directory and display log"
	docker cp extract-model:/dock/models/. ./models/
	docker cp extract-model:/dock/build.log ./weights.log || true
	docker rm extract-model
	cat ./weights.log || true

build-ai-api:
	docker build -f apps/api/Dockerfile -t ai-api .

ai-api:
	docker run -p 8080:8080 ai-api

build-test:
	docker build  -f apps/api/Dockerfile --build-arg INSTALL_TEST=true -t ai-api-test .

test:
	docker run --rm --entrypoint pytest ai-api-test -v

