/* global HTMLElement */

import { onWindowEthereum, truncateAddress } from '../utils.js'

export class BuyRandom extends HTMLElement {
  constructor () {
    super()

    const template = document.createElement('template')
    template.innerHTML = '<slot name="button"></slot>'
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))

    onWindowEthereum(() => {
      this.querySelector('[slot="button"]').addEventListener('click touchstart', async (e) => {
        e.preventDefault()

        const array = new Uint32Array(1)
        const selection = window.crypto.getRandomValues(array)[0] % 113
        const cid = document.querySelectorAll('nft-listing')[selection].id

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider.getSigner())
        const gasPrice = await provider.getGasPrice()
        const gasLimit = await contract.estimateGas.purchase(cid, { value: window.priceInWei })
        await contract.purchase(cid, { gasPrice, gasLimit, value: window.priceInWei })
      })
    })
  }

  buyRandomPiece () {
  }

  updateSigner (accounts) {
    if (accounts && accounts[0]) {
      this.querySelector('[slot="identity"]').innerText = truncateAddress(accounts[0])
    }
  }
}

/*
<svg role="img" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Ethereum</title><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>
*/
