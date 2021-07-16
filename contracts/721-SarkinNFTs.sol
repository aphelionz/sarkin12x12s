// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SarkinNFTs is ERC721 {
    address payable private immutable _owner;
    AggregatorV3Interface internal immutable priceFeed;
    uint256 immutable _priceInUSD;

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

    function contractURI() public view returns (string memory) {
        return "https://12x12.jonsarkin.com/collection-metadata.json";
    }

    function mint(address to, uint256 cid) external onlyOwner {
        _safeMint(to, cid, "{id}");
    }

    function purchase(uint256 cid) public payable {
      uint latestPrice = getLatestPrice();

      require(msg.value > 0, "Not enough ETH");
      require(msg.value >= latestPrice, "Not enough ETH");
      require(msg.value < latestPrice + 1000000, "Too much ETH");

      emit Transfer(address(0x0), _owner, cid);
      _safeMint(msg.sender, cid, "{id}");
      _owner.transfer(msg.value);
    }

    function getLatestPrice() internal view returns (uint) {
      (
        /* uint80 roundID */,
        int price,
        /* uint startedAt */,
        uint timeStamp,
        /* uint80 answeredInRound */
      ) = priceFeed.latestRoundData();
      // If the round is not complete yet, timestamp is 0
      require(timeStamp > 0, "Round not complete");
      return _priceInUSD / uint(price);
    }
}
