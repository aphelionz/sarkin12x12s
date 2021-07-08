# Include env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

build: clean deps instaloader ingest-nfts
	cp -r ./src/js .build/js
	cp -r ./src/css .build/css
	cp ./src/favicon.ico .build

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

deps:
	mkdir -p ${INSTA_DEST}
	mkdir -p .build
	touch ./.build/index.html
	npm install
	python3 -m venv venv
	./venv/bin/pip3 install instaloader
	docker-compose up -d
	sleep 10
	npx hardhat run --network localhost scripts/deploy.js

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
