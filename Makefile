export SHELL:=/bin/bash

.ONESHELL:

# Include env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: test

test:
	function tearDown {
		kill `lsof -i:8545 -t`
	}
	trap tearDown EXIT
	npx hardhat node > /dev/null &
	export CONTRACT_ADDRESS=`npx hardhat run --network localhost scripts/deploy.js | tail -1`
	npx hardhat test --network localhost
