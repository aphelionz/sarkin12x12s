const fs = require('fs')
const { expect } = require('chai')
const fetch = require('node-fetch')
const { ingest } = require('../scripts/utils')

describe('UI', function () {
  describe('Baseline', function () {
    it('Responds with a 200 at 127.0.0.1:3000', async () => {
      const res = await fetch('http://127.0.0.1:3000')
      expect(res.status).to.equal(200)
    })
  })

  describe('Built HTML', function () {
    let builtHTML

    before(async () => {
      const template = fs.readFileSync('./src/index.html')
      builtHTML = await ingest('./test/fixtures', template)
    })

    it('lists as many NFTs are are ingested', async () => {
      expect(builtHTML.querySelectorAll('nft-listing').length).to.equal(2)
    })

    it('contains the abi in a script tag', async () => {
      try {
        const abiScriptTag = builtHTML.querySelector('script#abi')
        JSON.parse(abiScriptTag.innerText)
      } catch (e) {
        console.log(e.message)
        expect(false).to.equal(true)
      }
    })

    it('contains the contract address in the html string', async () => {
      expect(process.env.CONTRACT_ADDRESS.length).to.be.above(0)
      expect(builtHTML.toString()).to.contain(process.env.CONTRACT_ADDRESS)
    })
  })
})
