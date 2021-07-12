/* global HTMLElement */

function truncateAddress (address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export class MetaMaskLogin extends HTMLElement {
  constructor () {
    super()
    if (window.ethereum) {
      this.attachShadow({ mode: 'open' })

      this.addEventListener('click', this.getAccount.bind(this))
      window.ethereum.on('accountsChanged', this.updateSigner.bind(this))
      window.ethereum.on('chainChanged', this.handleChainChange.bind(this))
      window.ethereum.on('message', console.log)

      this.button = document.createElement('button')
      this.updateSigner([window.ethereum.selectedAddress])

      this.shadowRoot.append(this.button)
    }
  }

  async getAccount () {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    } catch (err) {
      console.warn(err.message)
    }
  }

  handleChainChange (chainInfo) {
    console.log(chainInfo)
  }

  updateSigner (accounts) {
    this.button.innerText = 'Connect MetaMask'
    this.connected = false

    if (accounts && accounts[0]) {
      this.button.innerText = truncateAddress(accounts[0])
      this.connected = true
    }
  }
}
