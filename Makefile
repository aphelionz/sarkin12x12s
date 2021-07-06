export SHELL:=/bin/bash

.ONESHELL:

# Include env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

export UID = $(shell id -u)
export GID = $(shell id -g)

build: test ingest
	rm -rf .build/**
	cp -r src/** .build

.PHONY: test
test: reset
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
	npm install
	python3 -m venv venv
	./venv/bin/pip3 install instaloader

ingest: reset instaloader ingest-nfts

instaloader: deps
	./venv/bin/instaloader \
		--fast-update \
		--no-videos \
		--login ${INSTA_USER} ${INSTA_USER} \
		--dirname-pattern=${INSTA_DEST} \
		--post-filter="'nft' in caption_hashtags"
	for file in ./.instaloader/*.xz; do xz -fd "$$file"; done

ingest-nfts: deps
	npx hardhat run scripts/ingest.js --network localhost

reset: clean deps
	mkdir -p .build
	touch ./.build/index.html
	docker-compose down
	docker-compose up -d
	sleep 10
