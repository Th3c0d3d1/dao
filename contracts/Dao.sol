//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {

    // ----------------------------------------
    // Variables
    // ----------------------------------------

    // dao creator
    address owner;
    Token public token;
    uint256 public wlVotingStartTime;
    uint256 public votingStartTime;
    uint256 public votingEndTime;

    // quorum - amount of votes needed to pass proposal
    uint256 public quorum;

    // ----------------------------------------
    // Structs
    // ----------------------------------------

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

    // ----------------------------------------
    // Mappings
    // ----------------------------------------

    // Mapping the proposals using the struct
    mapping(uint256 => Proposal) public proposals;

    // Whitelist of investors
    mapping(address => bool) public whitelist;

    // Mapping to track votes by option
    // Options: 1 = LP Burn, 2 = LP Rewards
    mapping(uint8 => uint256) public votes;
    
    // Mapping to track votes by investor
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    // Mapping to track ownership start date
    mapping(address => uint256) public ownershipStart;

    // ----------------------------------------
    // Events
    // ----------------------------------------

    event Propose(
        uint id,
        uint256 amount,
        address recipient,
        address creator
    );

    event addedToWhitelist(address indexed account);
    event removeFromWhitelist(address indexed account);
    event Vote(uint id, uint option, address investor);
    event VotingEndedEarly();
    event Finalize(uint256 id);

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

    modifier onlyOwner() {
    require(msg.sender == owner, 'caller must be owner');
    _;
    }

    // Add accounts to whitelist
    function add(address _address) public onlyOwner returns (bool success)
    {
        whitelist[_address] = true;
        emit addedToWhitelist(_address);
        return true;
    }

    // Remove accounts from whitelist
    function remove(address _address) public onlyOwner {
        whitelist[_address] = false;
        emit removeFromWhitelist(_address);
    }

    // Get whitelist
    function getWhitelist() public view returns (address[] memory) {
        uint256 count = 0;
        address[] memory tempList = new address[](count);
        for (uint256 i = 0; i < tempList.length; i++) {
            if (whitelist[tempList[i]]) {
                count++;
            }
        }
        address[] memory whitelistedAddresses = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < tempList.length; i++) {
            if (whitelist[tempList[i]]) {
                whitelistedAddresses[index] = tempList[i];
                index++;
            }
        }
        return whitelistedAddresses;
    }

    // Check to see if address is whitelisted 
    function isWhitelisted(address _address) public view returns(bool) {
        return whitelist[_address];
    }

    function startVoting() external onlyOwner {
        wlVotingStartTime = block.timestamp;
        votingStartTime = block.timestamp + 2 days;
        votingEndTime = votingStartTime + 5 days;
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

    // Calculate weight of vote
    function calculateWeight(address id) public view returns (uint256) {
        uint256 balance = token.balanceOf(id);
        uint256 ownershipDuration = block.timestamp - ownershipStart[id];
        uint256 multiplier = 100;

        // Bring holding duration from token
        if (ownershipDuration >= 365 days) multiplier += 50; // +0.5
        else if (ownershipDuration >= 182 days) multiplier += 33; // +0.33
        else if (ownershipDuration >= 91 days) multiplier += 22; // +0.22
        else if (ownershipDuration >= 30 days) multiplier += 11; // +0.11

        return (balance * multiplier) / 100;
    }

    // Vote on proposal
    function vote(uint256 _id, uint8 option, uint256 weight) external onlyInvestor() {

        // Check if investor is whitelisted
        if (isWhitelisted(msg.sender) == true ){

            // Check if whitelist voting has started
            require(block.timestamp >= wlVotingStartTime, "Whitelist voting has not started yet");
        } else {

            // Check if voting has started
            require(block.timestamp >= votingStartTime, "Voting has not started yet");
        }

        // Fetch proposal from mapping by id
        // Give type of variable
        // Telling solidity to read from storage (struct)
        Proposal storage proposal = proposals[_id];

        // Check if voting has ended
        require(block.timestamp <= votingEndTime, "Voting has ended");

        // Verify selected option is valid
        require(option >= 1 && option <= 2, "Invalid option");

        // Verify user is whitelisted
        require(isWhitelisted(msg.sender), 'User must be whitelisted');

        // Don't let investors vote twice
        require(!hasVoted[msg.sender][_id], "User has already voted");

        // update votes by token balance
        proposal.votes += token.balanceOf(msg.sender);

        // Calculate weight of vote
        weight = calculateWeight(msg.sender);
        votes[option] += weight;

        // Track that user voted
        // Check investor by id to verify vote submission
        hasVoted[msg.sender][_id] = true;

        // Emit an event
        emit Vote(_id, option, msg.sender);
    }

    // End voting early
    function endVotingEarly() external onlyOwner {
        votingEndTime = block.timestamp;
        emit VotingEndedEarly();
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

        // Check that contract has enough ether
        require(address(this).balance >= proposal.amount);

        // Transfer funds simple method
        // Security issues; will not know transfer has occured
        // proposal.recipient.transfer(proposal.amount);

        // Transfer funds preferred method
        // Send a msg to the recipient(address)
        // meta data can be sent (value)
        // gets return values (bool, bytes data)
        (bool sent, ) = proposal.recipient.call{ value: proposal.amount}("");

        // verifies funds are sent
        require(sent);

        // emit event
        emit Finalize(_id);
    }
}
