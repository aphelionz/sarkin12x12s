# Include env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

watch: node_modules .build instaloader
	npx nodemon --watch src -e js,html,css --exec make .build

.PHONY: test
test: clean deps
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

.build:
	mkdir -p .build
	touch ./.build/index.html
	cp -r ./src/js .build/js
	cp -r ./src/css .build/css
	cp ./src/favicon.ico .build

.instaloader:
	mkdir -p .instaloader
	./venv/bin/instaloader \
		--fast-update \
		--no-videos \
		--login ${INSTA_USER} \
		--password ${INSTA_PASS} \
		--dirname-pattern=.instaloader \
		--post-filter="'nft' in caption_hashtags" \
		${INSTA_USER}
	for file in ./.instaloader/*.xz; do xz -fd "$$file"; done

deps: node_modules venv .build
	docker-compose up -d
	sleep 5
	npx hardhat run --network localhost scripts/deploy.js

ingest-nfts: node_modules .build
	npx hardhat run scripts/ingest.js --network localhost
