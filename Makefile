export SHELL:=/bin/bash

.ONESHELL:

# Include env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: test

test: start
	export CONTRACT_ADDRESS=`npx hardhat run --network localhost scripts/deploy.js | tail -1`
	npx hardhat test --network localhost

start: deps
	docker-compose up -d

stop:
	docker-compose up

deps:
	npm install

clean:
	docker-compose down
	rm -f package-lock.json
	rm -rf node_modules

serve:
	npx live-server .
