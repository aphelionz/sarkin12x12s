/* global customElements, CustomEvent, ethers  */

import { MetaMaskLogin } from './components/MetaMaskLogin.js'
import { NFTListing } from './components/NFTListing.js'

const CONTRACT_ADDRESS = document.querySelector('#nfts').dataset.address
const ABI = JSON.parse(document.querySelector('#abi').innerText)

setTimeout(async (e) => {
  customElements.define('metamask-login', MetaMaskLogin)
  customElements.define('nft-listing', NFTListing)

  const provider = new ethers.providers.Web3Provider(window.ethereum)

  setInterval((function fetchPrice () {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
    const filter = contract.filters.Transfer()
    contract.queryFilter(filter).then(events => {
      const transfersEvent = new CustomEvent('transfers', { detail: events })
      document.dispatchEvent(transfersEvent)
    })

    contract.functions.getLatestPrice().then(res => {
      const wei = parseInt(res[0].toString(), 10)
      const priceEvent = new CustomEvent('price', { detail: wei })
      document.dispatchEvent(priceEvent)
    })

    return fetchPrice
  })(), 10000)
}, 500)
