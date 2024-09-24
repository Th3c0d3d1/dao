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

    // Mapping the proposals using the struct
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) votes;


    event Propose(
        uint id,
        uint256 amount,
        address recipient,
        address creator
    );

    event Vote(uint id, address investor);

    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
    }

    // Allows contract to receive eth
    receive() external payable {}

    modifier onlyInvestor() {
        require(
            token.balanceOf(msg.sender) > 0,
            "Must be token holder"
        );

        _;
    }

    // Proposal function
    // eg. Name: "Invest rewards into stablecoin lp"
    // eg. Amount: "Rewards earned"
    // eg. Recipient: "lp wallet address"
    function createProposal(
        string memory _name,
        uint256 _amount,
        address payable _recipient
    ) external onlyInvestor(){
        // Check balance of contract
        require(address(this).balance >= _amount);

        // Increment ID
        proposalCount++;

        // Proposal
    Proposal(
        proposalCount,
        _name,
        _amount,
        _recipient,
        0,
        false
        );

    // Create Inline struct
    // Save proposal to mapping
    proposals[proposalCount] = Proposal(
        proposalCount,
        _name,
        _amount,
        _recipient,
        0,
        false
        );

        emit Propose(
            proposalCount,
            _amount,
            _recipient,
            msg.sender
        );
    }
        
    // Vote on proposal
    function vote(uint256 _id) external onlyInvestor() {
        // Fetch proposal from mapping by id
        // Give type of variable
        // Telling solidity to read from storage (struct)
        Proposal storage proposal = proposals[_id];

        // Don't let investors vote twice
        require(!votes[msg.sender][_id], "already voted");

        // update votes by token balance
        proposal.votes += token.balanceOf(msg.sender);

        // Track that user voted
        // Check investor by id to verify vote submission
        votes[msg.sender][_id] = true;

        // Emit an event
        emit Vote(_id, msg.sender);
    }

    // Finalize proposal & transfer funds
    function finalizeProposal(uint256 _id) external onlyInvestor() {
        // Fetch the proposal
        Proposal storage proposal = proposals[_id];

        // Ensure proposal is not already finalized
        require(proposal.finalized == false, "proposal already finalized");

        // Mark as finalized
        proposal.finalized = true;
        // Check that proposal has enough votes
        require(proposal.votes >= quorum, "must reach quorum to finalize proposal");
        // Transfer funds
        // emit event
    }
}
