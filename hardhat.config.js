require('dotenv').config()

require('@nomiclabs/hardhat-waffle')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  solidity: '0.8.4',
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_MAINNET_RPC_URL
      }
    }
  }
}
