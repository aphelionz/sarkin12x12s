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

.PHONY: test
test: reset
	export CONTRACT_ADDRESS=`npx hardhat run --network localhost scripts/deploy.js | tail -1`
	npx hardhat test --network localhost

clean: reset
	docker-compose down
	rm -f package-lock.json
	rm -rf node_modules

deps:
	mkdir -p ${INSTA_DEST}
	npm install
	browserify node_modules/bs58 > src/js/bs58.js --standalone bs58
	browserify node_modules/ethers > src/js/ethers.js --standalone ethers
	browserify node_modules/buffer > src/js/buffer.js --standalone Buffer
	browserify node_modules/ipfs-http-client > src/js/ipfs-http-client.js --standalone IpfsHttpClient
	# TODO: venv
	pip3 install instaloader

ingest-metadata: deps
	instaloader --fast-update --login ${INSTA_USER} ${INSTA_USER} --dirname-pattern=${INSTA_DEST}
	for file in ./.instaloader/*.xz; do xz -fd "$$file"; done
	cp ${INSTA_DEST}/${INSTA_USER}_${INSTA_ID}.json ./src/metadata.json
	cp artifacts/contracts/721-SarkinNFTs.sol/SarkinNFTs.json ./src/artifact.json

ingest-nfts: deps
	npx hardhat run scripts/ingest.js --network localhost

ingest: reset ingest-metadata ingest-nfts

reset:
	rm -rf .ipfs
	docker-compose down
	docker-compose up -d
	sleep 5
	docker-compose exec ipfs ipfs config --json -- API.HTTPHeaders.Access-Control-Allow-Origin '["http://127.0.0.1:3000", "http://localhost:3000"]'
	docker-compose restart ipfs
