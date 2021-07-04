const { ethers, network, upgrades } = require('hardhat')

async function main () {
  const SarkinNFTs = await ethers.getContractFactory('SarkinNFTs')
  const NFTs = await SarkinNFTs.deploy()

  process.stdout.write(NFTs.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

