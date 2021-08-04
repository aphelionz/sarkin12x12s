/* global customElements, CustomEvent, ethers, getComputedStyle */

import { BuyRandom } from './components/BuyRandom.js'
import { MetaMaskIdentity } from './components/MetaMaskIdentity.js'
import { NFTListing } from './components/NFTListing.js'

import { onWindowEthereum } from './utils.js'

const CONTRACT_ADDRESS = document.querySelector('meta[name="contract-address"]').content
const ABI = JSON.parse(document.querySelector('#abi').innerText)

window.onbeforeunload = function () {
  window.scrollTo(0, 0)
  document.querySelector('.nfts').style.display = 'none'
}

window.onload = function () {
  window.addEventListener('hashchange', (function updateNFTList () {
    if (window.location.hash === '') return

    const hash = window.location.hash.substr(1)
    const nftList = document.querySelector('#nfts')
    nftList.classList.remove('yours', 'available', 'all')
    nftList.classList.add(hash)
    return updateNFTList
  })())

  document.querySelector('.nfts').addEventListener('click', e => {
    const listing = e.target
    const listingBottom = listing.offsetTop + listing.offsetHeight
    const windowBottom = window.scrollY + window.innerHeight

    document.querySelector('nft-listing.selected')?.classList.remove('selected')
    listing.classList.add('selected')

    if (listingBottom > windowBottom) {
      const delta = listingBottom - windowBottom
      const bottomMargin = parseInt(getComputedStyle(document.querySelector('body')).marginBottom)
      const firstLoadPadding = (window.scrollY === 0)
        ? document.querySelector('nft-listing.selected').offsetHeight
        : 0

      window.scrollTo(0, window.scrollY + delta + bottomMargin + firstLoadPadding)
    }
  })

  if (window.location.hash === '') { window.location.hash = 'available' }
  document.body.addEventListener('change', function (e) { window.location.hash = e.target.value })

  const nfts = document.querySelectorAll('nft-listing')
  nfts[Math.floor(Math.random() * nfts.length)].click()
}

onWindowEthereum(async (e) => {
  if (window.ethereum) {
    document.querySelectorAll('.metamask').forEach(e => { e.classList.remove('metamask') })
  }

  customElements.define('buy-random', BuyRandom)
  customElements.define('metamask-identity', MetaMaskIdentity)
  customElements.define('nft-listing', NFTListing)

  setInterval((function sendEvents () {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
    const filter = contract.filters.Transfer()
    contract.queryFilter(filter).then(events => {
      const transfersEvent = new CustomEvent('transfers', { detail: events })
      document.dispatchEvent(transfersEvent)
    })
  })(), 5000)

  setInterval((function updateCounts () {
    const all = document.querySelectorAll('nft-listing').length
    const owned = document.querySelectorAll('nft-listing[owner]').length
    const yours = document.querySelectorAll('nft-listing[yours]').length

    document.querySelectorAll('var.all').forEach(e => { e.innerText = all })
    document.querySelector('var.available').innerText = all - owned
    document.querySelector('var.yours').innerText = yours

    return updateCounts
  })(), 1000)
})
