const fs = require('fs')

const bs58 = require('bs58')
const { parse } = require('node-html-parser')
const { create, globSource } = require('ipfs-http-client')

const ipfs = create('http://127.0.0.1:5001')

const bs58toHex = (b58) => `0x${Buffer.from(bs58.decode(b58).slice(2)).toString('hex')}`

async function ingest (instaloaderFolder, htmlTemplate, contractAddress) {
  // TODO: Only jpg for now, other media types later
  const files = fs.readdirSync(instaloaderFolder)
    .filter(f => f.match(/UTC\.json/))
  const timestamps = new Set(files.map(f => f.split('.')[0]))
  const artifact = fs.readFileSync('./artifacts/contracts/721-SarkinNFTs.sol/SarkinNFTs.json')
  const abi = JSON.parse(artifact).abi

  const root = parse(htmlTemplate.toString())
  const nftsList = root.querySelector('#nfts')
  const nftTemplate = root.querySelector('template#nft')

  for (let it = timestamps.values(), timestamp = null; timestamp = it.next().value;) { // eslint-disable-line
    // TODO: Better Insta handling parsing
    // Set a start date
    // Only parse things with #NFTs or some such hash tag
    try {
      const description = fs.readFileSync(instaloaderFolder + `/${timestamp}.txt`).toString()
      const hash = await ipfs.add(globSource(instaloaderFolder + `/${timestamp}.jpg`))

      const nftMetadata = {
        title: 'Asset Metadata',
        type: 'object',
        properties: {
          name: '',
          description,
          image: `${hash.cid.toString()}`
        }
      }

      const metadata = await ipfs.add(JSON.stringify(nftMetadata))

      const item = nftTemplate.innerHTML
        .replace(/%TOKEN_CID%/g, metadata.cid.toString())
        .replace(/%IMAGE_CID%/g, hash.cid.toString())
        .replace(/%TITLE%/g, timestamp)
        .replace(/%DESC%/g, description)
        .replace(/%CONTRACT_ADDRESS%/g, contractAddress)

      nftsList.appendChild(parse(item))
    } catch (err) {
      console.warn(err.message)
    }
  }

  root.innerHTML = root.innerHTML.replace(/%CONTRACT_ADDRESS%/g, contractAddress)
  const abiScriptTag = parse(`<script id="abi" type="application/json">${JSON.stringify(abi)}</script>`)
  root.appendChild(abiScriptTag)
  return root
}

module.exports = {
  bs58toHex,
  ingest
}
