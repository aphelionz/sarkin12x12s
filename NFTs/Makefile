# Include env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

all: deps .instaloader shopify
deps: node_modules venv cache

deploy-rinkeby:
	git apply ./patches/rinkeby.patch
	npx hardhat run --network rinkeby scripts/deploy.js
	git checkout contracts

reset:
	docker-compose down
	docker-compose up -d
	sleep 10
	npx hardhat run --network localhost scripts/deploy.js

.PHONY: test
test: reset deps
	npx hardhat test --network localhost

clean:
	rm -f package-lock.json
	rm -rf node_modules
	rm -rf artifacts
	rm -rf cache
	rm -rf .ipfs
	rm -rf venv

node_modules:
	npm install

venv:
	python3 -m venv venv
	./venv/bin/pip3 install instaloader

artifacts cache:
	npx hardhat compile

.instaloader:
	mkdir -p .instaloader
	./venv/bin/instaloader \
		--fast-update \
		--no-videos \
		--login ${INSTA_USER} \
		--password ${INSTA_PASS} \
		--dirname-pattern=.instaloader \
		--post-filter="'12x12' in caption_hashtags" \
		${INSTA_USER}
	for file in ./.instaloader/*.xz; do xz -fd "$$file"; done

shopify: .instaloader
	rm -f .instaloader/*_profile_pic.*
	npx hardhat run scripts/ingest/shopify.js

cron: .instaloader ingest-nfts
