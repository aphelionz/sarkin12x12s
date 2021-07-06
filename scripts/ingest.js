const fs = require('fs')
const { parse } = require('node-html-parser')
const { create, globSource } = require('ipfs-http-client')

const ipfs = create('http://127.0.0.1:5001')

async function main () {
  // TODO: Only jpg for now, other media types later
  const DIR = process.env.INSTA_DEST
  const files = fs.readdirSync(DIR).filter(f => f.match(/UTC\.jpg/))
  const timestamps = new Set(files.map(f => f.split('.')[0]))

  const template = fs.readFileSync('./src/index.html')
  const root = parse(template.toString())
  const nftsList = root.querySelector('#nfts')
  nftsList.innerHTML = ''
  const nftTemplate = root.querySelector('template#nft')

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

      const item = nftTemplate.innerHTML
        .replace(/%TOKEN_CID%/g, metadata.cid.toString())
        .replace(/%IMAGE_CID%/g, hash.cid.toString())
        .replace(/%TITLE%/g, timestamp)
        .replace(/%DESC%/g, description)

      nftsList.appendChild(parse(item))
    } catch (err) {
      // console.warn(err.message)
    }
  }
  console.log(root.toString())
  fs.writeFileSync('./.build/index.html', root.toString())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
