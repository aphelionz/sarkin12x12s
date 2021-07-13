const fs = require('fs')

const bs58 = require('bs58')
const { parse } = require('node-html-parser')
const { create, globSource } = require('ipfs-http-client')

const AggregatorV3Abi = require('@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json')

const ipfs = create(process.env.IPFS_API_URL)

const bs58toHex = (b58) => `0x${Buffer.from(bs58.decode(b58).slice(2)).toString('hex')}`

async function ingest (instaloaderFolder, htmlTemplate) {
  // TODO: Only jpg for now, other media types later
  const files = fs.readdirSync(instaloaderFolder)
    .filter(f => f.match(/UTC\.json/))
  const timestamps = new Set(files.map(f => f.split('.')[0]))
  const artifact = fs.readFileSync('./artifacts/contracts/721-SarkinNFTs.sol/SarkinNFTs.json')
  const abi = JSON.parse(artifact).abi

  const root = parse(htmlTemplate.toString())
  const nftsList = root.querySelector('#nfts')

  for (let it = timestamps.values(), timestamp = null; timestamp = it.next().value;) { // eslint-disable-line
    // TODO: Better Insta handling parsing
    // Set a start date
    // Only parse things with #NFTs or some such hash tag
    try {
      const nftTemplate = parse('<nft-listing></nft-listing>').firstChild
      const description = ''
      // const description = fs
      //   .readFileSync(instaloaderFolder + `/${timestamp}.txt`).toString().trim()
      const hash = await ipfs.add(globSource(instaloaderFolder + `/${timestamp}.jpg`))

      const nftMetadata = {
        name: timestamp,
        description,
        image: `${hash.cid.toString()}`
      }

      const metadata = await ipfs.add(JSON.stringify(nftMetadata))

      nftTemplate.setAttributes({
        id: bs58toHex(metadata.cid.toString()),
        'image-src': hash.cid.toString(),
        name: timestamp,
        description
      })

      nftsList.appendChild(nftTemplate)
    } catch (err) {
      console.warn(err.message)
    }
  }

  root.innerHTML = root.innerHTML.replace(/%IPFS_GATEWAY_URL%/g, process.env.IPFS_GATEWAY_URL)
  root.innerHTML = root.innerHTML.replace(/%CONTRACT_ADDRESS%/g, process.env.CONTRACT_ADDRESS)
  root.innerHTML = root.innerHTML.replace(/%CHAINLINK_ADDRESS%/g, process.env.CHAINLINK_ADDRESS)
  const abiScriptTag =
    parse(`<script id="abi" type="application/json">${JSON.stringify(abi)}</script>`)
  const chainlinkAbiScriptTag =
    parse(`<script id="chainlinkAbi" type="application/json">${JSON.stringify(AggregatorV3Abi)}</script>`)

  root.appendChild(abiScriptTag)
  root.appendChild(chainlinkAbiScriptTag)
  return root
}

module.exports = {
  bs58toHex,
  ingest
}
