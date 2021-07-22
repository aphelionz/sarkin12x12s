require('dotenv').config()

require('@nomiclabs/hardhat-waffle')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  solidity: '0.8.4',
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/cjl-KmDLkL3lXgz0s8FtUl9OPFYIK5B2',
      from: process.env.KEYS_OWNER,
      accounts: [process.env.KEYS_OWNER, process.env.KEYS_ACCT1]
    },
    hardhat: {
      mining: {
        auto: false,
        interval: [500, 2000]
      },
      forking: {
        url: process.env.ALCHEMY_MAINNET_RPC_URL
      }
    }
  }
}

if (process.env.KEYS_OWNER && process.env.KEYS_ACCT1) {
  config.networks.rinkeby = {
    url: 'https://eth-rinkeby.alchemyapi.io/v2/cjl-KmDLkL3lXgz0s8FtUl9OPFYIK5B2',
    from: process.env.KEYS_OWNER,
    accounts: [process.env.KEYS_OWNER, process.env.KEYS_ACCT1]
  }
}

module.exports = config
