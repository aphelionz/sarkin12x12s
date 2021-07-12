/* global HTMLElement */

import { truncateAddress } from '../utils.js'

export class MetaMaskLogin extends HTMLElement {
  constructor () {
    super()

    const template = document.createElement('template')
    template.innerHTML = '<slot name="button"></slot>'

    if (window.ethereum) {
      this.attachShadow({ mode: 'open' })
      this.shadowRoot.append(template.content.cloneNode(true))

      this.addEventListener('click', this.getAccount.bind(this))
      window.ethereum.on('accountsChanged', this.updateSigner.bind(this))
      window.ethereum.on('chainChanged', this.handleChainChange.bind(this))
      window.ethereum.on('message', console.log)

      this.button = this.querySelector('button')
      this.updateSigner([window.ethereum.selectedAddress])
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
