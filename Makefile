export SHELL:=/bin/bash

.ONESHELL:

# Include env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

INSTA_DEST = "./.instaloader"
INSTA_ID := $(shell cat "${INSTA_DEST}"/id)


.PHONY: test
test: deps
	export CONTRACT_ADDRESS=`npx hardhat run --network localhost scripts/deploy.js | tail -1`
	npx hardhat test --network localhost

clean:
	docker-compose down
	rm -f package-lock.json
	rm -rf node_modules

deps:
	docker-compose up -d
	pip3 install instaloader
	npm install

ingest-metadata: deps
	instaloader --fast-update --login ${INSTA_USER} ${INSTA_USER} --dirname-pattern=${INSTA_DEST}
	cp ${INSTA_DEST}/${INSTA_USER}_${INSTA_ID}.json.xz ./src/metadata.json.xz
	xz -fd ./src/metadata.json.xz

ingest: ingest-metadata

stop:
	docker-compose down
