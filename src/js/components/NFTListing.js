/* global ethers, HTMLElement */

const CONTRACT_ADDRESS = document.querySelector('#nfts').dataset.contract
const IPFS_GATEWAY_URL = document.querySelector('#nfts').dataset.gateway
const ABI = JSON.parse(document.querySelector('#abi').innerText)
const provider = new ethers.providers.Web3Provider(window.ethereum)

export class NFTListing extends HTMLElement {
  constructor () {
    super()

    document.addEventListener('transfers', (e) => this.updateAttributes(this.id, e.detail))

    this.attachShadow({ mode: 'open' })

    const img = document.createElement('img')
    img.src = `${IPFS_GATEWAY_URL}${this.getAttribute('image-src')}`
    img.style.maxWidth = '100%'
    this.shadowRoot.append(img)

    this.addEventListener('click', this.buyNFT)
  }

  async buyNFT (e) {
    e.preventDefault()

    const cid = this.id

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider.getSigner())

      const gasPrice = await provider.getGasPrice()
      const gasLimit = await contract.estimateGas.purchase(cid, { value: window.priceInWei })
      await contract.purchase(cid, { gasPrice, gasLimit, value: window.priceInWei })
    } catch (e) {
      console.log(e.code, (e.data?.message || e.message))
    }
  }

  updateAttributes (id, events) {
    this.removeAttribute('yours')
    this.removeAttribute('owner')

    const owner = events
      .filter(e => e.args.tokenId.toHexString() === id)
      .map(e => e.args.to)
      .pop()

    if (!owner) return

    this.setAttribute('owner', owner)

    if (!window.ethereum.selectedAddress) return
    if (ethers.BigNumber.from(owner).eq(ethers.BigNumber.from(window.ethereum.selectedAddress))) {
      this.setAttribute('yours', true)
    }
  }
}
