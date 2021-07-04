const { create } = require('ipfs-http-client')
const { expect } = require('chai')

const client = create('http://127.0.0.1:5001')

describe('IPFS Baseline', function () {
  it('is version 0.9.0, repo version 11', async () => {
    const { version, repo } = await client.version()

    expect(version).to.equal('0.9.0')
    expect(repo).to.equal('11')
  })
})
