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

    const template = document.createElement('template')
    template.innerHTML = '<slot name="button"></slot>'
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))
    this.button = this.querySelector('button')

    onWindowEthereum(() => {
      this.price = 0

      setInterval(this.updatePrice.bind(this), 10000)
      this.updatePrice()

      this.querySelector('[slot="button"]').addEventListener('click', async (e) => {
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

/*
<svg role="img" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Ethereum</title><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>
*/
