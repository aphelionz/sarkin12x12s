// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SarkinNFTs is ERC721 {
    address private immutable _owner;

    constructor() ERC721("Jon Sarkin", "SRK") {
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Access Denied");
        _;
    }

    function mint(address to, bytes32 cid) external onlyOwner {
        _safeMint(to, uint256(cid), "{id}");
    }
}
