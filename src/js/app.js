/* global customElements, CustomEvent, ethers  */

import { weiToEth } from './utils.js'
import { MetaMaskLogin } from './components/MetaMaskLogin.js'
import { NFTListing } from './components/NFTListing.js'

const CONTRACT_ADDRESS = document.querySelector('#nfts').dataset.contract
const CHAINLINK_ADDRESS = document.querySelector('#nfts').dataset.chainlink
const ABI = JSON.parse(document.querySelector('#abi').innerText)
const CHAINLINK_ABI = JSON.parse(document.querySelector('#chainlinkAbi').innerText)

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
  customElements.define('metamask-login', MetaMaskLogin)
  customElements.define('nft-listing', NFTListing)

  const provider = new ethers.providers.Web3Provider(window.ethereum)

  document.querySelector('button#buy-random').addEventListener('click', async () => {
    const array = new Uint32Array(1)
    const selection = window.crypto.getRandomValues(array)[0] % 113
    const cid = document.querySelectorAll('nft-listing')[selection].id

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider.getSigner())
    const gasPrice = await provider.getGasPrice()
    const gasLimit = await contract.estimateGas.purchase(cid, { value: window.priceInWei })
    await contract.purchase(cid, { gasPrice, gasLimit, value: window.priceInWei })
  })

  setInterval((function fetchPrice () {
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
    })

    return fetchPrice
  })(), 5000)

  const all = document.querySelectorAll('nft-listing').length
  const owned = document.querySelectorAll('nft-listing[owner]').length
  const yours = document.querySelectorAll('nft-listing[yours]').length

  document.querySelector('var.all').innerText = all - owned
  document.querySelector('var.available').innerText = all - owned
  document.querySelector('var.yours').innerText = yours
}, 500)
