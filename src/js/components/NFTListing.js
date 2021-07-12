/* global ethers, HTMLElement */

const CONTRACT_ADDRESS = document.querySelector('#nfts').dataset.address
const ABI = JSON.parse(document.querySelector('#abi').innerText)
const provider = new ethers.providers.Web3Provider(window.ethereum)

import { truncateAddress } from '../utils.js'

export class NFTListing extends HTMLElement {
  constructor () {
    super()

    document.addEventListener('transfers', (e) => {
      this.updateAttributes(e.detail)
      this.filterSelf()
    })

    document.addEventListener('price', (e) => {
      this.updatePrice(e.detail)
    })

    this.attachShadow({ mode: 'open' })

    const img = document.createElement('img')
    img.src = `http://localhost:8080/ipfs/${this.getAttribute('image-src')}`
    img.style.maxWidth = '100%'
    this.shadowRoot.append(img)

    const nftButton = document.createElement('button')
    nftButton.innerText = 'Buy NFT'
    nftButton.classList.add('nft')
    nftButton.addEventListener('click', this.buyNFT.bind(this))
    this.shadowRoot.append(nftButton)
  }

  async buyNFT (e) {
    e.preventDefault()

    const cid = this.id

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider.getSigner())
      const value = (await contract.functions.getLatestPrice())[0]

      const gasPrice = await provider.getGasPrice()
      const gasLimit = await contract.estimateGas.purchase(cid, { value })
      await contract.purchase(cid, { gasPrice, gasLimit, value })
    } catch (e) {
      console.log(e.code, (e.data?.message || e.message))
    }
  }

  updateAttributes (events) {
    const owner = events
      .filter(e => e.args.tokenId.toHexString() === this.id)
      .filter(e => !ethers.BigNumber.from(e.args.from).isZero())
      .map(e => e.args.to)
      .pop()

    if (owner) {
      this.setAttribute('owner', owner || null)
      const nftButton = this.shadowRoot.querySelector('button.nft')
      nftButton?.remove()
    }
  }

  updatePrice (priceInWei) {
    const priceInETH = (priceInWei / (10 ** 18)).toFixed(4)
    const nftButton = this.shadowRoot.querySelector('button.nft')

    if (nftButton) {
      nftButton.innerText = `Buy NFT for ${priceInETH} ETH`
    }
  }

  filterSelf () {}
}
