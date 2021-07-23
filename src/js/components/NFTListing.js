/* global ethers, HTMLElement */

const IPFS_GATEWAY_URL = document.querySelector('meta[name="ipfs-gateway-url"]').content

export class NFTListing extends HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.style.height = `${this.offsetWidth}px`

    document.addEventListener('transfers', (e) => this.updateAttributes(this.id, e.detail))
    document.addEventListener('scroll', this.renderIfVisible.bind(this))
    this.renderIfVisible()
  }

  renderIfVisible () {
    if (this.shadowRoot.querySelector('img')) return
    if (this.offsetTop - window.scrollY > window.innerHeight) return
    if (this.offsetTop - window.scrollY < 0) return

    const img = document.createElement('img')
    img.src = `${IPFS_GATEWAY_URL}${this.getAttribute('image-src')}`
    img.style.maxWidth = '100%'
    this.shadowRoot.append(img)
  }

  updateAttributes (id, events) {
    this.removeAttribute('yours')
    this.removeAttribute('owner')

    const owner = events
      .filter(e => e.args.tokenId.toHexString() === id)
      .map(e => e.args.to)
      .pop()

    if (!owner) return

    this.setAttribute('owner', owner)

    if (!window.ethereum.selectedAddress) return
    if (ethers.BigNumber.from(owner).eq(ethers.BigNumber.from(window.ethereum.selectedAddress))) {
      this.setAttribute('yours', true)
    }
  }
}
