# Include env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

all: deps deploy-hardhat .instaloader ingest-nfts

deps: node_modules venv .build cache
	docker-compose up -d
	sleep 10

deploy-hardhat:
	npx hardhat run --network localhost scripts/deploy.js

deploy-rinkeby:
	git apply ./patches/rinkeby.patch
	npx hardhat run --network rinkeby scripts/deploy.js
	git checkout contracts

watch: node_modules .build .instaloader
	./venv/bin/html_lint.py src/index.html
	npx nodemon --watch src -e js,html,css --exec "sh -c" \
		"cp -r src/** .build && npx hardhat run scripts/ingest.js --network localhost"

.PHONY: test
test: clean deps deploy-hardhat
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

node_modules:
	npm install

venv:
	python3 -m venv venv
	./venv/bin/pip3 install instaloader
	./venv/bin/pip3 install html-linter

.build: artifacts
	mkdir -p .build
	cp artifacts/contracts/721-SarkinNFTs.sol/SarkinNFTs.json .build/artifact.json
	cp -vr src/** .build/

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

ingest-nfts: node_modules .build .instaloader
	npx hardhat run scripts/ingest.js --network localhost
