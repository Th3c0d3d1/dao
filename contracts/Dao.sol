//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {
    // dao creator
    address owner;
    Token public token;
    // quorum - amount of votes needed to pass proposal
    uint256 public quorum;

    // Define structure of the proposal
    struct Proposal {
        // id - proposal id
        uint256 id;
        string name;
        uint256 amount;
        address payable recipient;
        uint256 votes;
        bool finalized;
    }

    uint256 public proposalCount;

    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
    }

    // Allows contract to receive eth
    receive() external payable {}

    // Proposal function
    // eg. Name: "Invest rewards into stablecoin lp"
    // eg. Amount: "Rewards earned"
    // eg. Recipient: "lp wallet address"
    function createProposal(
        string memory _name,
        uint256 _amount,
        address payable _recipient
    ) external {
        proposalCount++;

        // Proposal
    Proposal(proposalCount, _name, _amount, _recipient, 0, false);
    }
}
