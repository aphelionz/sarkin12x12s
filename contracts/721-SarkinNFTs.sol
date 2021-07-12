// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SarkinNFTs is ERC721 {
    address payable private immutable _owner;
    AggregatorV3Interface internal priceFeed;
    int256 _priceInUSD;

    /**
     * Network: Mainnet
     * Aggregator: ETH/USD
     * Address: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
     */
    constructor() ERC721("Jon Sarkin", "SRK") {
        _owner = payable(msg.sender);
        _priceInUSD = 0x1D14A0219E54822428000000; // $90
        priceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Access Denied");
        _;
    }

    function mint(address to, bytes32 cid) external onlyOwner {
        _safeMint(to, uint256(cid), "{id}");
    }

    function purchase(bytes32 cid) public payable {
      int latestPrice = getLatestPrice();

      require(msg.value > 0, "Not enough ETH");
      require(int(msg.value) >= latestPrice, "Not enough ETH");
      require(int(msg.value) < latestPrice + 1000000, "Too much ETH");

      _safeMint(_owner, uint256(cid), "{id}");
      _safeTransfer(_owner, msg.sender, uint256(cid), "");
      _owner.transfer(msg.value);
    }

    function getLatestPrice() public view returns (int) {
      (
        /* uint80 roundID */,
        int price,
        /* uint startedAt */,
        uint timeStamp,
        /* uint80 answeredInRound */
      ) = priceFeed.latestRoundData();
      // If the round is not complete yet, timestamp is 0
      require(timeStamp > 0, "Round not complete");
      return _priceInUSD / price;
    }
}
