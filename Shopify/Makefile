# Include env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

all: deps .instaloader shopify
deps: node_modules venv

clean:
	rm -f package-lock.json
	rm -rf node_modules
	rm -rf venv

node_modules:
	npm install

venv:
	python3 -m venv venv
	./venv/bin/pip3 install instaloader

.instaloader: venv
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

shopify: .instaloader
	rm -f .instaloader/*_profile_pic.*
	node scripts/ingest-from-instagram.js
