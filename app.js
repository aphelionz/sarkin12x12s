/* global ethereum, requestAnimationFrame */

const SKARKIN_ADDRESS = '0x574591e62aa28f370b2496A32d1db22708bbB50F'
const SKARKIN_PRICE = '0x11C37937E08000'

const connectMetamask = async () => {
  if (typeof window.ethereum === 'undefined') { return }
  ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => console.log)
    .catch((e, f, b) => {
      console.error(e, f, b)
    })
}

const processForm = async (e) => {
  const transactionParameters = {
    to: SKARKIN_ADDRESS,
    from: ethereum.selectedAddress, // must match user's active address.
    value: SKARKIN_PRICE // 0.005 ETH
  }

  // txHash is a hex string
  // As with any RPC call, it may throw an error
  await ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionParameters]
  })

  return false
}

;(() => {
  const body = document.body
  const q = (selectors) => document.querySelector(selectors)
  const qAll = (selectors) => document.querySelectorAll(selectors)

  q('#metamask-login').addEventListener('click', connectMetamask)
  q('#nft-form').addEventListener('submit', event => {
    event.preventDefault()
    processForm(event).then(console.log).catch(console.error)
  })

  if (typeof window.ethereum !== 'undefined') {
    body.classList.add('metamask')

    ethereum.on('accountsChanged', console.log)
    ethereum.on('connect', (connectInfo) => {
      requestAnimationFrame(() => {
        qAll('[data-eth-account]')
          .forEach(el => { el.innerText = ethereum.selectedAddress })
      })
    })
  } else {
    console.warn('No metamask found')
  }
})()
