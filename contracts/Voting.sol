// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// Interface for mintable ERC20 token
interface IERC20Mintable {
    function mint(address to, uint256 amount) external;
}

/**
 * @title Voting
 * @dev Decentralized voting contract with Merkle whitelist, session-based elections, and BAL token rewards
 */
contract Voting is Ownable, ReentrancyGuard {

    // Candidate structure with policy positions
    struct Candidate {
        string name;
        uint8[3] positions; // Policy positions [0-100] for 3 topics
        bool active;
    }

    // State variables
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;
    
    IERC20Mintable public bal;
    uint256 public rewardPerVote;
    
    uint256 public sessionId;
    uint64 public start;
    uint64 public end;
    bytes32 public voterRoot;
    
    // Session-based tracking
    mapping(uint256 => mapping(address => bool)) public voted; // sessionId => voter => hasVoted
    mapping(uint256 => mapping(uint256 => uint256)) public votes; // sessionId => candidateId => voteCount

    // Events
    event CandidateAdded(uint256 indexed id, string name);
    event CandidateUpdated(uint256 indexed id, string name, bool active);
    event RootSet(bytes32 root);
    event ElectionStarted(uint256 indexed sessionId, uint64 start, uint64 end);
    event Voted(uint256 indexed sessionId, address indexed voter, uint256 indexed candidateId);
    event RewardPaid(address indexed voter, uint256 amount);

    // Custom errors
    error NotInWindow();
    error AlreadyVoted();
    error NotWhitelisted();
    error InvalidCandidate();
    error ZeroWindow();

    /**
     * @dev Constructor
     * @param _bal Address of the BAL token contract
     * @param _rewardPerVote Initial reward amount per vote
     */
    constructor(address _bal, uint256 _rewardPerVote) Ownable(msg.sender) {
        bal = IERC20Mintable(_bal);
        rewardPerVote = _rewardPerVote;
    }

    /**
     * @dev Add a new candidate
     * @param name Candidate name
     * @param positions Array of 3 policy positions [0-100]
     * @return id The ID of the newly created candidate
     */
    function addCandidate(string memory name, uint8[3] memory positions) external onlyOwner returns (uint256 id) {
        candidateCount++;
        id = candidateCount;
        
        candidates[id] = Candidate({
            name: name,
            positions: positions,
            active: true
        });
        
        emit CandidateAdded(id, name);
    }

    /**
     * @dev Update an existing candidate
     * @param id Candidate ID
     * @param name New candidate name
     * @param positions New policy positions
     * @param active Whether the candidate is active
     */
    function updateCandidate(
        uint256 id,
        string memory name,
        uint8[3] memory positions,
        bool active
    ) external onlyOwner {
        if (id == 0 || id > candidateCount) revert InvalidCandidate();
        
        candidates[id] = Candidate({
            name: name,
            positions: positions,
            active: active
        });
        
        emit CandidateUpdated(id, name, active);
    }

    /**
     * @dev Set the Merkle root for voter whitelist
     * @param root The Merkle root hash
     */
    function setVoterMerkleRoot(bytes32 root) external onlyOwner {
        voterRoot = root;
        emit RootSet(root);
    }

    /**
     * @dev Start a new election session
     * @param startTs Start timestamp
     * @param endTs End timestamp
     */
    function startElection(uint64 startTs, uint64 endTs) external onlyOwner {
        if (endTs <= startTs) revert ZeroWindow();
        
        sessionId++;
        start = startTs;
        end = endTs;
        
        emit ElectionStarted(sessionId, startTs, endTs);
    }

    /**
     * @dev Set the reward amount per vote
     * @param amount New reward amount
     */
    function setRewardPerVote(uint256 amount) external onlyOwner {
        rewardPerVote = amount;
    }

    /**
     * @dev Cast a vote for a candidate
     * @param candidateId The ID of the candidate to vote for
     * @param merkleProof Merkle proof for voter whitelist verification
     */
    function vote(uint256 candidateId, bytes32[] calldata merkleProof) external nonReentrant {
        // Check if within voting window
        if (block.timestamp < start || block.timestamp > end) revert NotInWindow();
        
        // Check if already voted in this session
        if (voted[sessionId][msg.sender]) revert AlreadyVoted();
        
        // Validate candidate
        if (candidateId == 0 || candidateId > candidateCount) revert InvalidCandidate();
        if (!candidates[candidateId].active) revert InvalidCandidate();
        
        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, voterRoot, leaf)) revert NotWhitelisted();
        
        // Record vote
        votes[sessionId][candidateId]++;
        voted[sessionId][msg.sender] = true;
        
        emit Voted(sessionId, msg.sender, candidateId);
        
        // Mint reward if configured
        if (rewardPerVote > 0) {
            bal.mint(msg.sender, rewardPerVote);
            emit RewardPaid(msg.sender, rewardPerVote);
        }
    }

    /**
     * @dev Get the winner of a specific session
     * @param sid Session ID to query
     * @return winnerId The ID of the winning candidate
     * @return winnerVotes The number of votes the winner received
     */
    function getWinner(uint256 sid) external view returns (uint256 winnerId, uint256 winnerVotes) {
        winnerVotes = 0;
        winnerId = 0;
        
        for (uint256 i = 1; i <= candidateCount; i++) {
            uint256 candidateVotes = votes[sid][i];
            if (candidateVotes > winnerVotes) {
                winnerVotes = candidateVotes;
                winnerId = i;
            }
        }
    }

    /**
     * @dev Get candidate details
     * @param id Candidate ID
     * @return name Candidate name
     * @return positions Policy positions
     * @return active Whether candidate is active
     */
    function getCandidate(uint256 id) external view returns (
        string memory name,
        uint8[3] memory positions,
        bool active
    ) {
        Candidate memory candidate = candidates[id];
        return (candidate.name, candidate.positions, candidate.active);
    }
}
