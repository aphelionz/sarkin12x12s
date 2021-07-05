/* global ethers */

const bs58 = require('bs58')
const crypto = require('crypto')
const CID = require('cids')
const { expect } = require('chai')
const multihashing = require('multihashing-async')

const randomCID = async () => {
  const randomHash = await multihashing(crypto.randomBytes(Math.random() * 100000), 'sha2-256')
  return (new CID(0, 'dag-pb', Buffer.from(randomHash)))
}

const bs58toHex = (b58) => `0x${Buffer.from(bs58.decode(b58).slice(2)).toString('hex')}`

const txOptions = {}

describe('ERC721 Baseline', function () {
  let nfts
  let owner

  before(async function () {
    [owner] = await ethers.getSigners()
    txOptions.gasPrice = await ethers.provider.getGasPrice()

    const SarkinNFTs = await ethers.getContractFactory('SarkinNFTs')
    nfts = SarkinNFTs.attach(process.env.CONTRACT_ADDRESS)
  })

  describe('Details', function () {
    it('is named "Jon Sarkin"', async () => {
      const name = await nfts.name()
      expect(name).to.equal('Jon Sarkin')
    })

    it('has the symbol "SRK"', async () => {
      const symbol = await nfts.symbol()
      expect(symbol).to.equal('SRK')
    })

    it('returns true when 0x80ac58cd is passed to supportsInterface', async () => {
      const supports = await nfts.supportsInterface('0x80ac58cd')
      expect(supports).to.equal(true)
    })

    it('returns true when 0x5b5e139f is passed to supportsInterface', async () => {
      const supports = await nfts.supportsInterface('0x5b5e139f')
      expect(supports).to.equal(true)
    })
  })

  describe('Minting', function () {
    it('has a blank tokenURI (for now)', async () => {
      const tokenId = await randomCID()
      const tokenHex = bs58toHex(tokenId.toString())

      const tx = await nfts.mint(owner.address, tokenHex)
      await tx.wait()

      const tokenURI = await nfts.tokenURI(tokenHex)
      expect(tokenURI).to.equal('')
    })

    it('reports the correct owner', async () => {
      const tokenId = await randomCID()
      const tokenHex = bs58toHex(tokenId.toString())

      const tx = await nfts.mint(owner.address, tokenHex)
      await tx.wait()

      const ownerOf = await nfts.ownerOf(tokenHex)
      expect(ownerOf).to.equal(owner.address)
    })

    it('reports the balanceOf', async () => {
      const tokenId = await randomCID()
      const tokenHex = bs58toHex(tokenId.toString())

      const tx = await nfts.mint(owner.address, tokenHex)
      await tx.wait()

      const balance = await nfts.balanceOf(owner.address)
      expect(balance.toString()).to.equal('3')
    })

    it('logs Transfer events for the above mints', async () => {
      const filter = nfts.filters.Transfer()
      const events = await nfts.queryFilter(filter)
      expect(events.length).to.be.at.least(3)
    })
  })

  describe('Transfer and Approval', function () {
    /*

 'Approval(address,address,uint256)': [Function (anonymous)],
 'ApprovalForAll(address,address,bool)': [Function (anonymous)],

 'approve(address,uint256)': [Function (anonymous)],
 'getApproved(uint256)': [Function (anonymous)],
 'isApprovedForAll(address,address)': [Function (anonymous)],
 'safeTransferFrom(address,address,uint256)': [Function (anonymous)],
 'safeTransferFrom(address,address,uint256,bytes)': [Function (anonymous)],
 'setApprovalForAll(address,bool)': [Function (anonymous)],
 'transferFrom(address,address,uint256)': [Function (anonymous)],

*/
  })

  it.skip('logs', async () => {
    console.log(nfts)
  })
})
