export SHELL:=/bin/bash

.ONESHELL:

# Include env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

INSTA_ID := $(shell cat "${INSTA_DEST}"/id)
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

# HASH := $(shell sh -c "docker-compose exec -T ipfs ipfs add -q -r /data/build | tail -1")
deploy: test ingest build
	export HASH=`docker-compose exec -T ipfs ipfs add -q -r /data/build | tail -1`
	echo "Deployed to http://localhost:8080/ipfs/$$HASH"

deps:
	mkdir -p ${INSTA_DEST}
	npm install
	python3 -m venv venv
	./venv/bin/pip3 install instaloader

ingest: reset ingest-metadata ingest-nfts

ingest-metadata: deps
	./venv/bin/instaloader \
		--fast-update \
		--no-videos \
		--login ${INSTA_USER} ${INSTA_USER} \
		--dirname-pattern=${INSTA_DEST}
	for file in ./.instaloader/*.xz; do xz -fd "$$file"; done
	# cp ${INSTA_DEST}/${INSTA_USER}_${INSTA_ID}.json ./src/metadata.json
	# cp artifacts/contracts/721-SarkinNFTs.sol/SarkinNFTs.json ./src/artifact.json

ingest-nfts: deps
	npx hardhat run scripts/ingest.js --network localhost

reset: clean deps
	mkdir -p .build
	touch ./.build/index.html
	docker-compose down
	docker-compose up -d
	sleep 3
	sh -c "docker-compose exec -T ipfs ipfs config \
		--json -- API.HTTPHeaders.Access-Control-Allow-Origin '[\"*\"]'"
	sh -c "docker-compose exec -T ipfs ipfs config --json -- Addresses.Swarm '[]'"
	sh -c "docker-compose exec -T ipfs ipfs config --json -- Bootstrap '[]'"
	docker-compose restart ipfs
	sleep 10
