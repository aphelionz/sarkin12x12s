/* global ethers, HTMLElement */

import { onWindowEthereum } from '../utils.js'

const ABI = JSON.parse(document.querySelector('#abi').innerText)
const CHAINLINK_ABI = JSON.parse(document.querySelector('#chainlinkAbi').innerText)
const CHAINLINK_ADDRESS = document.querySelector('meta[name="chainlink-address"]').content
const CONTRACT_ADDRESS = document.querySelector('meta[name="contract-address"]').content

function weiToEth (wei) {
  return (wei / (10 ** 18)).toFixed(4)
}

export class BuyRandom extends HTMLElement {
  constructor () {
    super()

    this.price = 0
    this.boundConnectWallet = this.connectWallet.bind(this)

    const template = document.createElement('template')
    template.innerHTML = '<slot name="button"></slot>'
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))

    this.button = this.querySelector('[slot="button"]')
    this.button.addEventListener('click', this.boundConnectWallet)

    onWindowEthereum(() => {
      if (!window.ethereum) return
      setTimeout(() => {
        if (!window.ethereum.selectedAddress) return
        this.initialize()
      }, 500)
    })
  }

  async connectWallet (e) {
    e.preventDefault()

    if (!window.ethereum) {
      window.location = '//metamask.app.link/dapp/12x12.jonsarkin.com'
      return
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      this.initialize()
    } catch (err) {
      console.warn(err.message)
    }
  }

  async initialize () {
    console.log('initialize')
    this.button.removeEventListener('click', this.boundConnectWallet)
    this.button.innerHTML = 'Buy random piece for Ξ<var class="price"></var>'

    setInterval(this.updatePrice.bind(this), 10000)
    this.updatePrice()

    this.button.addEventListener('click', async (e) => {
      e.preventDefault()

      const array = new Uint32Array(1)
      const selection = window.crypto.getRandomValues(array)[0] % 131
      const cid = document.querySelectorAll('nft-listing')[selection].id

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider.getSigner())
      const gasPrice = await provider.getGasPrice()
      const gasLimit = await contract.estimateGas.purchase(cid, { value: this.price })
      await contract.purchase(cid, { gasPrice, gasLimit, value: this.price })
    })
  }

  async updatePrice () {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(CHAINLINK_ADDRESS, CHAINLINK_ABI, provider.getSigner())
    const res = await contract.latestRoundData()

    this.price = ethers.BigNumber.from('0x26C62AD77DC602DAE0000000').div(res.answer)
    this.querySelector('var.price').innerText = weiToEth(this.price)
  }
}
