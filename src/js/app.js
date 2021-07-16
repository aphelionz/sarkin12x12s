/* global customElements, CustomEvent, ethers  */

import { MetaMaskLogin } from './components/MetaMaskLogin.js'
import { NFTListing } from './components/NFTListing.js'

const CONTRACT_ADDRESS = document.querySelector('#nfts').dataset.contract
const CHAINLINK_ADDRESS = document.querySelector('#nfts').dataset.chainlink
const ABI = JSON.parse(document.querySelector('#abi').innerText)
const CHAINLINK_ABI = JSON.parse(document.querySelector('#chainlinkAbi').innerText)

function weiToEth (wei) {
  return (wei / (10 ** 18)).toFixed(4)
}

if (window.location.hash === '') {
  window.location.hash = 'available'
}

window.addEventListener('hashchange', (function updateNFTList () {
  const hash = window.location.hash.substr(1)
  const nftList = document.querySelector('#nfts')

  document.querySelectorAll('body > nav a').forEach(el => {
    el.classList.remove('active')
    nftList.classList.remove(el.href.split('#')[1])
  })
  document.querySelector(`body > nav a[href="#${hash}"]`).classList.add('active')
  nftList.classList.add(hash)

  return updateNFTList
})())


setTimeout(async (e) => {
  if (window.ethereum) {
    document.querySelectorAll('.metamask').forEach(e => { e.style.display = 'inherit' })
  }

  customElements.define('metamask-login', MetaMaskLogin)
  customElements.define('nft-listing', NFTListing)

  document.querySelector('button#buy-random').addEventListener('click', async () => {
    const array = new Uint32Array(1)
    const selection = window.crypto.getRandomValues(array)[0] % 113
    const cid = document.querySelectorAll('nft-listing')[selection].id

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider.getSigner())
    const gasPrice = await provider.getGasPrice()
    const gasLimit = await contract.estimateGas.purchase(cid, { value: window.priceInWei })
    await contract.purchase(cid, { gasPrice, gasLimit, value: window.priceInWei })
  })

  setInterval((function sendEvents () {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
    const filter = contract.filters.Transfer()
    contract.queryFilter(filter).then(events => {
      const transfersEvent = new CustomEvent('transfers', { detail: events })
      document.dispatchEvent(transfersEvent)
    })

    const chainlinkAggregator = new ethers.Contract(CHAINLINK_ADDRESS, CHAINLINK_ABI, provider)
    chainlinkAggregator.functions.latestRoundData().then(res => {
      window.priceInWei = ethers.BigNumber.from('0x1D14A0219E54822428000000').div(res.answer)
      const priceEvent = new CustomEvent('price', { detail: window.priceInWei })
      document.dispatchEvent(priceEvent)

      document.querySelector('var.price').innerText = weiToEth(window.priceInWei)

      // TODO: Move this somewhere else
      const all = document.querySelectorAll('nft-listing').length
      const owned = document.querySelectorAll('nft-listing[owner]').length
      const yours = document.querySelectorAll('nft-listing[yours]').length

      document.querySelector('var.all').innerText = all
      document.querySelector('var.available').innerText = all - owned
      document.querySelector('var.yours').innerText = yours
    })

    return sendEvents
  })(), 5000)
}, 500)
