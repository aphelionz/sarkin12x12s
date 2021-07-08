// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SarkinNFTs is ERC721 {
    address private immutable _owner;
    AggregatorV3Interface internal priceFeed;
    int256 _priceInUSD;

    /**
     * Network: Mainnet
     * Aggregator: ETH/USD
     * Address: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
     */
    constructor() ERC721("Jon Sarkin", "SRK") {
        _owner = msg.sender;
        _priceInUSD = 0x7ce66c50e2840000; // $90
        priceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Access Denied");
        _;
    }

    function mint(address to, bytes32 cid) external onlyOwner {
        _safeMint(to, uint256(cid), "{id}");
    }

    function purchase() public payable {
    }

    function getLatestPrice() public view returns (int) {
      (
        uint80 roundID,
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
      ) = priceFeed.latestRoundData();
      // If the round is not complete yet, timestamp is 0
      require(timeStamp > 0, "Round not complete");
      return _priceInUSD / price;
    }
}
