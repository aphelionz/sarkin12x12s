// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SarkinNFTs is ERC721 {
    using Strings for uint256;

    address payable private immutable _owner;
    address payable private immutable _manager;

    AggregatorV3Interface internal immutable priceFeed;
    uint256 immutable _priceInUSD;

    /**
     * Network: Mainnet
     * Aggregator: ETH/USD
     * Address: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
     */
    constructor() ERC721("Jon Sarkin", "SRK") {
        _owner = payable(msg.sender);
        _manager = payable(address(0x003c44cdddb6a900fa2b585dd299e03d12fa4293bc));
        _priceInUSD = 0x26C62AD77DC602DAE0000000; // $120
        priceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Access Denied");
        _;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://12x12.jonsarkin.com/token/";
    }

    function contractURI() public pure returns (string memory) {
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

      _owner.transfer((msg.value * 70) / 100);
      _manager.transfer((msg.value * 30) / 100);
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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toHexString(), ".json")) : "";
    }
}
