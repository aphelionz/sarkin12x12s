const fs = require('fs')

const bs58 = require('bs58')
const { ethers } = require('hardhat')
const { create, globSource } = require('ipfs-http-client')

const bs58toHex = (b58) => `0x${Buffer.from(bs58.decode(b58).slice(2)).toString('hex')}`

const ipfs = create('http://127.0.0.1:5001')

async function main () {
  const [owner] = await ethers.getSigners()

  // TODO: Only jpg for now, other media types later
  const DIR = process.env.INSTA_DEST || './.instaloader'
  const files = fs.readdirSync(DIR).filter(f => f.match(/UTC\.jpg/))
  const timestamps = new Set(files.map(f => f.split('.')[0]))

  const SarkinNFTs = await ethers.getContractFactory('SarkinNFTs')
  const NFTs = await SarkinNFTs.deploy()

  for (let it = timestamps.values(), timestamp = null; timestamp = it.next().value;) { // eslint-disable-line
    // TODO: Better Insta handling parsing
    // Set a start date
    // Only parse things with #NFTs or some such hash tag
    try {
      const description = fs.readFileSync(DIR + `/${timestamp}.txt`).toString()
      const hash = await ipfs.add(globSource(DIR + `/${timestamp}.jpg`))
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
      const mintingCID = metadata.cid.toString()

      const tx = await NFTs.mint(owner.address, bs58toHex(mintingCID))
      await tx.wait()
    } catch (err) {
      console.warn(err.message)
    }
  }
  console.log(NFTs.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
