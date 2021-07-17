/* global HTMLElement */

import { onWindowEthereum, truncateAddress } from '../utils.js'

export class MetaMaskIdentity extends HTMLElement {
  constructor () {
    super()

    const template = document.createElement('template')
    template.innerHTML = '<slot name="identity"></slot>'
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))

    onWindowEthereum(() => {
      window.ethereum?.on('accountsChanged', this.updateSigner.bind(this))
      this.updateSigner([window.ethereum.selectedAddress])
    })
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
