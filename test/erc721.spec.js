/* global ethers */

const crypto = require('crypto')
const CID = require('cids')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const multihashing = require('multihashing-async')
const AggregatorV3Abi = require('@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json')
const { bs58toHex } = require('../scripts/utils')

const { CONTRACT_ADDRESS } = process.env

const randomCID = async () => {
  const randomHash = await multihashing(crypto.randomBytes(Math.random() * 100000), 'sha2-256')
  return (new CID(0, 'dag-pb', Buffer.from(randomHash)))
}

const txOptions = {}

describe('ERC721 Baseline', function () {
  let nfts
  let acct1, manager, owner
  let chainlinkAggregator

  this.timeout(0)

  before(async function () {
    [owner, acct1, manager] = await ethers.getSigners()
    txOptions.gasPrice = await ethers.provider.getGasPrice()

    chainlinkAggregator = new ethers
      .Contract(process.env.CHAINLINK_ADDRESS, AggregatorV3Abi, owner)

    const SarkinNFTs = await ethers.getContractFactory('SarkinNFTs')
    nfts = SarkinNFTs.attach(CONTRACT_ADDRESS)
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

    it('returns the 12x12.jonsarkin.com contractURI()', async () => {
      const contractURI = await nfts.contractURI()
      expect(contractURI).to.equal('https://12x12.jonsarkin.com/collection-metadata.json')
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

  describe('Purchasing', function () {
    let startingManagerBalance, startingOwnerBalance, tokenHex, value

    before(async () => {
      // ~$90 in USD
      const latestPrice = (await chainlinkAggregator.latestRoundData()).answer
      value = BigNumber.from('0x26C62AD77DC602DAE0000000').div(latestPrice)

      const tokenCID = await randomCID()
      tokenHex = bs58toHex(tokenCID.toString())

      startingOwnerBalance = await ethers.provider.getBalance(owner.address)
      startingManagerBalance = await ethers.provider.getBalance(manager.address)
    })

    it('accepts the correct amount of ETH', async () => {
      const initialBalance = await ethers.provider.getBalance(acct1.address)
      txOptions.gasLimit = await nfts.connect(acct1)
        .estimateGas.purchase(tokenHex, { value })
      txOptions.value = value

      const tx = await nfts.connect(acct1).purchase(tokenHex, txOptions)
      await tx.wait()

      const finalBalance = await ethers.provider.getBalance(acct1.address)
      expect(finalBalance.lte(initialBalance.sub(value))).to.equal(true)
    })

    it('passes 70% the ETH through to the contract owner', async () => {
      const newOwnerBalance = await ethers.provider.getBalance(owner.address)
      expect(newOwnerBalance.sub(startingOwnerBalance)).to.deep.equal(value.mul(70).div(100))
    })

    it('passes 30% the ETH through to the contract owner', async () => {
      const newManagerBalance = await ethers.provider.getBalance(manager.address)
      expect(newManagerBalance.sub(startingManagerBalance)).to.deep.equal(value.mul(30).div(100))
    })

    it('transfers the NFT to acct1 upon purchase', async () => {
      const acct1NFTBalance = await nfts.balanceOf(acct1.address)
      expect(acct1NFTBalance.gt(0)).to.equal(true)
    })

    it('fails when trying to purchase with not enough ETH', async () => {
      const adjustedAmount = value.sub(7000000)

      try {
        txOptions.gasLimit = await nfts.connect(acct1)
          .estimateGas.purchase(tokenHex, { value: adjustedAmount })
        txOptions.value = adjustedAmount
        const tx = await nfts.connect(acct1).purchase(tokenHex, txOptions)
        await tx.wait()

        expect(false).to.equal(true)
      } catch (e) {
        expect(e.message).to.contain('Not enough ETH')
      }
    })

    it('fails when trying to purchase with more ETH', async () => {
      const adjustedAmount = value.add(2000000)

      try {
        txOptions.gasLimit = await nfts.connect(acct1)
          .estimateGas.purchase(tokenHex, { value: adjustedAmount })
        txOptions.value = adjustedAmount
        const tx = await nfts.connect(acct1).purchase(tokenHex, txOptions)
        await tx.wait()

        expect(false).to.equal(true)
      } catch (e) {
        expect(e.message).to.contain('Too much ETH')
      }
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

  describe('Chainlink price feed', function () {
    it('returns the latest ETH/USD price for pinned USD amount', async () => {
      const latestPrice = (await chainlinkAggregator.latestRoundData()).answer
      const oneTwentyInWei = BigNumber.from('0x26C62AD77DC602DAE0000000').div(latestPrice)
      console.log(`The current price of $120 is ${oneTwentyInWei.toString()} WEI`)
    })
  })

  it.skip('logs', async () => {
    console.log(nfts)
  })
})
