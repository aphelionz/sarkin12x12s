
const bs58 = require('bs58')

const bs58toHex = (b58) => `0x${Buffer.from(bs58.decode(b58).slice(2)).toString('hex')}`

module.exports = {
  bs58toHex
}
