/* global ethers, HTMLElement */

import { truncateAddress } from '../utils.js'

const CONTRACT_ADDRESS = document.querySelector('#nfts').dataset.address
const IPFS_GATEWAY_URL = document.querySelector('#nfts').dataset.gateway
const ABI = JSON.parse(document.querySelector('#abi').innerText)
const provider = new ethers.providers.Web3Provider(window.ethereum)

export class NFTListing extends HTMLElement {
  constructor () {
    super()

    document.addEventListener('transfers', (e) => this.updateAttributes(e.detail))
    document.addEventListener('price', (e) => this.updatePrice(e.detail))

    this.attachShadow({ mode: 'open' })

    const img = document.createElement('img')
    img.src = `${IPFS_GATEWAY_URL}${this.getAttribute('image-src')}`
    img.style.maxWidth = '100%'
    this.shadowRoot.append(img)

    const nftButton = document.createElement('button')
    nftButton.innerText = ''
    nftButton.classList.add('nft')
    nftButton.style.position = 'absolute'
    nftButton.style.bottom = '0'
    nftButton.style.left = '0'
    nftButton.style.background = '#000000c3'
    nftButton.style.width = '100%'
    nftButton.style.color = '#fff0ff'
    nftButton.style.border = 'none'
    nftButton.style.fontWeight = 'bold'
    nftButton.style.paddingTop = '0.5rem'
    nftButton.style.paddingBottom = '0.5rem'
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
    this.removeAttribute('yours')
    this.removeAttribute('owner')

    const owner = events
      .filter(e => e.args.tokenId.toHexString() === this.id)
      .filter(e => !ethers.BigNumber.from(e.args.from).isZero())
      .map(e => e.args.to)
      .pop()

    if (!owner) return

    this.setAttribute('owner', owner)

    if (ethers.BigNumber.from(owner).eq(ethers.BigNumber.from(window.ethereum.selectedAddress))) {
      this.setAttribute('yours', true)
    }
  }

  updatePrice (priceInWei) {
    const priceInETH = (priceInWei / (10 ** 18)).toFixed(4)
    const nftButton = this.shadowRoot.querySelector('button.nft')
    const owner = this.getAttribute('owner') !== 'undefined' ? this.getAttribute('owner') : false

    if (nftButton) {
      if (owner) {
        nftButton.innerText = `Owned by ${truncateAddress(owner)}`
      } else {
        nftButton.innerText = `Available: Ξ${priceInETH}`
      }
    }
  }
}
