/* global ethers */

const { create } = IpfsHttpClient
const client = create('http://localhost:5001')

// TODO: Why Buffer.Buffer? Browserify...
const bs58toHex = (b58) => `0x${Buffer.Buffer.from(bs58.decode(b58).slice(2)).toString('hex')}`
const hexToBs58 = (hex) => bs58.encode(Buffer.Buffer.from(`1220${hex.slice(2)}`, 'hex'))

if (window.ethereum) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  fetch('./artifact.json')
    .then(res => res.json())
    .then((artifact) => {
      const address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      const contract = new ethers.Contract(address, artifact.abi, signer)

      const filter = contract.filters.Transfer()
      return contract.queryFilter(filter)
    })
    .then(events => {
      return Promise.allSettled(events.map(event => {
        console.log(event.args.tokenId, event.args.tokenId.toHexString())
        const cidv0 = hexToBs58(event.args.tokenId.toHexString())
        console.log(cidv0)
        const contents = client.get(cidv0)
        // TODO: This only returns the first item.
        // fine (for now), but should be addressed.
        return contents.next()
      }))
    })
    .then(contents => {
      const fulfilled = contents
        .filter(d => d.status === 'fulfilled')
        .map(d => d.value)

      return Promise.all(fulfilled.map(item => {
        return new Promise((resolve, reject) => {
          item.value.content.next().then(content => {
            item.value.metadata = content
            resolve(item)
          })
        })
      }))
    })
    .then(metadata => {
      return Promise.all(metadata.map(item => {
        const cidv0 = item.value.path
        const ul = document.getElementById('nfts')
        const li = document.createElement('li')
        li.setAttribute('data-cid', bs58toHex(cidv0))

        const img = document.createElement('img')
        const metadata = JSON.parse(item.value.metadata.value.toString())
        img.setAttribute('src', `http://localhost:8080/ipfs/${metadata.properties.image}`)
        img.setAttribute('width', 1080)
        li.appendChild(img)

        ul.appendChild(li)
      }))
    })
    .then(console.log)
    .catch(console.error)
} else {
  // TODO: Fix ugly alerts
  alert('Metamask is required');
}


fetch('./metadata.json')
  .then(res => res.json())
  .then(console.log)
