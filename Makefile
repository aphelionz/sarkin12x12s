export SHELL:=/bin/bash

.ONESHELL:

# Include env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

build: clean deps instaloader ingest-nfts

.PHONY: test
test: deps
	export CONTRACT_ADDRESS=`npx hardhat run --network localhost scripts/deploy.js | tail -1`
	npx hardhat test --network localhost

clean:
	docker-compose down
	rm -f package-lock.json
	rm -rf node_modules
	rm -rf artifacts
	rm -rf cache
	rm -rf .build
	rm -rf .ipfs
	rm -rf venv

deploy: test ingest build
	export HASH=`docker-compose exec -T ipfs ipfs add -q -r /data/build | tail -1`
	echo "Deployed to http://localhost:8080/ipfs/$$HASH"

deps:
	mkdir -p ${INSTA_DEST}
	mkdir -p .build
	touch ./.build/index.html
	npm install
	python3 -m venv venv
	./venv/bin/pip3 install instaloader
	docker-compose up -d
	sleep 10

instaloader:
	./venv/bin/instaloader \
		--fast-update \
		--no-videos \
		--login ${INSTA_USER} \
		--password ${INSTA_PASS} \
		--dirname-pattern=${INSTA_DEST} \
		--post-filter="'nft' in caption_hashtags" \
		${INSTA_USER}
	for file in ./.instaloader/*.xz; do xz -fd "$$file"; done

ingest-nfts: deps
	npx hardhat run scripts/ingest.js --network localhost
