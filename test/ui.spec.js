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
    it('lists as many NFTs are are ingested', async () => {
      const template = fs.readFileSync('./src/index.html')
      const builtHTML = await ingest('./test/fixtures', template)
      expect(builtHTML.querySelectorAll('#nfts li').length).to.equal(2)
    })
  })
})
