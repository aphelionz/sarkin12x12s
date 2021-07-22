# 12'' x 12''s, by Jon Sarkin
> Smart Contract and front-end code for the "Jon Sarkin 12x12s" NFT collection 

[![Static Analysis](https://github.com/aphelionz/scrarkin/actions/workflows/static-analysis.yml/badge.svg)](https://github.com/aphelionz/scrarkin/actions/workflows/static-analysis.yml)
[![Tests](https://github.com/aphelionz/scrarkin/actions/workflows/node.js.yml/badge.svg)](https://github.com/aphelionz/scrarkin/actions/workflows/node.js.yml)
[![GitHub Pages](https://github.com/aphelionz/sarkin12x12s/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/aphelionz/sarkin12x12s/actions/workflows/gh-pages.yml)

## Install

```
$ git clone https://github.com/aphelionz/sarkin12x12s
$ cp env.example .env
```

Add the environment variables:

1. `INSTA_USER` and `INSTA_PASS`: Your authentication creds for Instagram
2. `ALCHEMY_MAINNET_RPC_URL`: Mainnet API credentials from https://alchemy.io
3. `CONTRACT_ADDRESS`: The address to the deployed ERC721 contract (deterministic in hardhat)
4. `IPFS_GATEWAY_URL`: The URL to an IPFS gateway, e.g. http://127.0.0.1:8080/ipfs/
5. `IPFS_API_URL`: The URL to an IPFS REST API, e.g. http://127.0.0.1:5001

Then, install dependencies, deploy the contract, and ingest the NFT
content to IPFS.

```
$ make
```

## Usage

Once the docker containers are running, the UI will be running at
https://localhost:3000

## Contributing

Issues and PRs open.

### Development

For development, a convenience method is available that will re-ingest
the NFTs and re-build the HTML

```
$ make watch
```

Tests are available as well.
```
$ make test
```
