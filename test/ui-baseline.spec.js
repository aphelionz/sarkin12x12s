const { expect } = require('chai')
const fetch = require('node-fetch')

describe('UI Baseline', function () {
  it('Responds with a 200 at 127.0.0.1:3000', async () => {
    const res = await fetch('http://127.0.0.1:3000')
    expect(res.status).to.equal(200)
  })
})
