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
test: deps
	export CONTRACT_ADDRESS=`npx hardhat run --network localhost scripts/deploy.js | tail -1`
	npx hardhat test --network localhost

clean: reset
	docker-compose down
	rm -f package-lock.json
	rm -rf node_modules

deps:
	mkdir -p ${INSTA_DEST}
	npm install
	# TODO: venv
	pip3 install instaloader
	docker-compose up -d

ingest-metadata: deps
	instaloader --fast-update --login ${INSTA_USER} ${INSTA_USER} --dirname-pattern=${INSTA_DEST}
	for file in ./.instaloader/*.xz; do xz -fd "$$file"; done
	cp ${INSTA_DEST}/${INSTA_USER}_${INSTA_ID}.json ./src/metadata.json

ingest-nfts: deps
	npx hardhat run scripts/ingest.js --network localhost

ingest: reset ingest-metadata ingest-nfts

reset:
	rm -rf .ipfs
	docker-compose down
