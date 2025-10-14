import { expect } from "chai";
import { ethers } from "hardhat";
import { Voting, BALToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MerkleTree } from "merkletreejs";

describe("Voting", function () {
  let voting: Voting;
  let balToken: BALToken;
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let voter3: HardhatEthersSigner;
  let nonWhitelisted: HardhatEthersSigner;

  let merkleTree: MerkleTree;
  let merkleRoot: string;
  let voter1Proof: string[];
  let voter2Proof: string[];
  let voter3Proof: string[];

  const REWARD_PER_VOTE = ethers.parseEther("10");
  const CANDIDATE_1_NAME = "Alice";
  const CANDIDATE_1_POSITIONS: [number, number, number] = [30, 60, 90];
  const CANDIDATE_2_NAME = "Bob";
  const CANDIDATE_2_POSITIONS: [number, number, number] = [70, 40, 20];

  // Helper function to create Merkle tree and proofs
  function createMerkleTree(addresses: string[]): {
    tree: MerkleTree;
    root: string;
    proofs: Map<string, string[]>;
  } {
    // Create leaves from lowercase addresses using ethers keccak256
    const leaves = addresses.map((addr) =>
      ethers.keccak256(ethers.solidityPacked(["address"], [addr.toLowerCase()]))
    );

    const tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    const proofs = new Map<string, string[]>();
    addresses.forEach((addr) => {
      const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [addr.toLowerCase()]));
      const proof = tree.getHexProof(leaf);
      proofs.set(addr.toLowerCase(), proof);
    });

    return { tree, root, proofs };
  }

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, nonWhitelisted] = await ethers.getSigners();

    // Deploy BALToken
    const BALTokenFactory = await ethers.getContractFactory("BALToken");
    balToken = await BALTokenFactory.deploy("BAL Token", "BAL");
    await balToken.waitForDeployment();

    // Deploy Voting contract
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy(await balToken.getAddress(), REWARD_PER_VOTE);
    await voting.waitForDeployment();

    // Grant MINTER_ROLE to Voting contract
    const MINTER_ROLE = await balToken.MINTER_ROLE();
    await balToken.grantRole(MINTER_ROLE, await voting.getAddress());

    // Create Merkle tree with whitelisted voters
    const whitelisted = [voter1.address, voter2.address, voter3.address];
    const { root, proofs } = createMerkleTree(whitelisted);
    merkleRoot = root;
    voter1Proof = proofs.get(voter1.address.toLowerCase()) || [];
    voter2Proof = proofs.get(voter2.address.toLowerCase()) || [];
    voter3Proof = proofs.get(voter3.address.toLowerCase()) || [];
  });

  describe("Deployment", function () {
    it("Should set the correct BAL token address", async function () {
      expect(await voting.bal()).to.equal(await balToken.getAddress());
    });

    it("Should set the correct reward per vote", async function () {
      expect(await voting.rewardPerVote()).to.equal(REWARD_PER_VOTE);
    });

    it("Should set owner as deployer", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should initialize sessionId as 0", async function () {
      expect(await voting.sessionId()).to.equal(0);
    });

    it("Should initialize candidateCount as 0", async function () {
      expect(await voting.candidateCount()).to.equal(0);
    });
  });

  describe("Candidate Management", function () {
    describe("addCandidate", function () {
    it("Should allow owner to add a candidate", async function () {
      await voting.addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS);
      expect(await voting.candidateCount()).to.equal(1);

      const [name, positions, active] = await voting.getCandidate(1);
      expect(name).to.equal(CANDIDATE_1_NAME);
      expect(positions[0]).to.equal(CANDIDATE_1_POSITIONS[0]);
      expect(positions[1]).to.equal(CANDIDATE_1_POSITIONS[1]);
      expect(positions[2]).to.equal(CANDIDATE_1_POSITIONS[2]);
      expect(active).to.be.true;
    });      it("Should emit CandidateAdded event", async function () {
        await expect(voting.addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS))
          .to.emit(voting, "CandidateAdded")
          .withArgs(1, CANDIDATE_1_NAME);
      });

      it("Should increment candidate IDs correctly", async function () {
        await voting.addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS);
        await voting.addCandidate(CANDIDATE_2_NAME, CANDIDATE_2_POSITIONS);
        expect(await voting.candidateCount()).to.equal(2);
      });

      it("Should revert if non-owner tries to add candidate", async function () {
        await expect(
          voting.connect(voter1).addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS)
        ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
          .withArgs(voter1.address);
      });

      it("Should use getCandidate helper to retrieve candidate", async function () {
        await voting.addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS);
        const [name, positions, active] = await voting.getCandidate(1);
        expect(name).to.equal(CANDIDATE_1_NAME);
        expect(positions[0]).to.equal(CANDIDATE_1_POSITIONS[0]);
        expect(positions[1]).to.equal(CANDIDATE_1_POSITIONS[1]);
        expect(positions[2]).to.equal(CANDIDATE_1_POSITIONS[2]);
        expect(active).to.be.true;
      });
    });

    describe("updateCandidate", function () {
      beforeEach(async function () {
        await voting.addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS);
      });

      it("Should allow owner to update candidate", async function () {
        const newPositions: [number, number, number] = [10, 20, 30];
        await voting.updateCandidate(1, "Alice Updated", newPositions, false);

        const [name, positions, active] = await voting.getCandidate(1);
        expect(name).to.equal("Alice Updated");
        expect(positions[0]).to.equal(newPositions[0]);
        expect(active).to.be.false;
      });

      it("Should emit CandidateUpdated event", async function () {
        await expect(voting.updateCandidate(1, "Alice Updated", CANDIDATE_1_POSITIONS, false))
          .to.emit(voting, "CandidateUpdated")
          .withArgs(1, "Alice Updated", false);
      });

      it("Should revert for invalid candidate ID (0)", async function () {
        await expect(
          voting.updateCandidate(0, "Invalid", CANDIDATE_1_POSITIONS, true)
        ).to.be.revertedWithCustomError(voting, "InvalidCandidate");
      });

      it("Should revert for non-existent candidate ID", async function () {
        await expect(
          voting.updateCandidate(999, "Invalid", CANDIDATE_1_POSITIONS, true)
        ).to.be.revertedWithCustomError(voting, "InvalidCandidate");
      });

      it("Should revert if non-owner tries to update", async function () {
        await expect(
          voting.connect(voter1).updateCandidate(1, "Hacked", CANDIDATE_1_POSITIONS, true)
        ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
      });
    });
  });

  describe("Merkle Root Management", function () {
    it("Should allow owner to set voter Merkle root", async function () {
      await voting.setVoterMerkleRoot(merkleRoot);
      expect(await voting.voterRoot()).to.equal(merkleRoot);
    });

    it("Should emit RootSet event", async function () {
      await expect(voting.setVoterMerkleRoot(merkleRoot))
        .to.emit(voting, "RootSet")
        .withArgs(merkleRoot);
    });

    it("Should revert if non-owner tries to set root", async function () {
      await expect(
        voting.connect(voter1).setVoterMerkleRoot(merkleRoot)
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Election Management", function () {
    describe("startElection", function () {
      it("Should start a new election with valid timestamps", async function () {
        const now = BigInt(Math.floor(Date.now() / 1000));
        const startTime = now + 100n;
        const endTime = now + 3600n;

        await voting.startElection(startTime, endTime);

        expect(await voting.sessionId()).to.equal(1);
        expect(await voting.start()).to.equal(startTime);
        expect(await voting.end()).to.equal(endTime);
      });

      it("Should increment sessionId on each start", async function () {
        const now = BigInt(Math.floor(Date.now() / 1000));
        
        await voting.startElection(now + 100n, now + 200n);
        expect(await voting.sessionId()).to.equal(1);

        await voting.startElection(now + 300n, now + 400n);
        expect(await voting.sessionId()).to.equal(2);
      });

      it("Should emit ElectionStarted event", async function () {
        const now = BigInt(Math.floor(Date.now() / 1000));
        const startTime = now + 100n;
        const endTime = now + 3600n;

        await expect(voting.startElection(startTime, endTime))
          .to.emit(voting, "ElectionStarted")
          .withArgs(1, startTime, endTime);
      });

      it("Should revert if end time <= start time", async function () {
        const now = BigInt(Math.floor(Date.now() / 1000));
        await expect(
          voting.startElection(now + 100n, now + 100n)
        ).to.be.revertedWithCustomError(voting, "ZeroWindow");

        await expect(
          voting.startElection(now + 200n, now + 100n)
        ).to.be.revertedWithCustomError(voting, "ZeroWindow");
      });

      it("Should revert if non-owner tries to start election", async function () {
        const now = BigInt(Math.floor(Date.now() / 1000));
        await expect(
          voting.connect(voter1).startElection(now + 100n, now + 200n)
        ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
      });
    });

    describe("setRewardPerVote", function () {
      it("Should allow owner to update reward", async function () {
        const newReward = ethers.parseEther("20");
        await voting.setRewardPerVote(newReward);
        expect(await voting.rewardPerVote()).to.equal(newReward);
      });

      it("Should allow setting reward to zero", async function () {
        await voting.setRewardPerVote(0);
        expect(await voting.rewardPerVote()).to.equal(0);
      });

      it("Should revert if non-owner tries to set reward", async function () {
        await expect(
          voting.connect(voter1).setRewardPerVote(ethers.parseEther("50"))
        ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
      });
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      // Add candidates
      await voting.addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS);
      await voting.addCandidate(CANDIDATE_2_NAME, CANDIDATE_2_POSITIONS);

      // Set Merkle root
      await voting.setVoterMerkleRoot(merkleRoot);

      // Start election (current time to 1 hour from now)
      const now = BigInt(Math.floor(Date.now() / 1000));
      await voting.startElection(now - 10n, now + 3600n);
    });

    it("Should allow whitelisted voter to vote", async function () {
      await voting.connect(voter1).vote(1, voter1Proof);
      expect(await voting.voted(1, voter1.address)).to.be.true;
      expect(await voting.votes(1, 1)).to.equal(1);
    });

    it("Should emit Voted event", async function () {
      await expect(voting.connect(voter1).vote(1, voter1Proof))
        .to.emit(voting, "Voted")
        .withArgs(1, voter1.address, 1);
    });

    it("Should mint BAL tokens as reward", async function () {
      const balanceBefore = await balToken.balanceOf(voter1.address);
      await voting.connect(voter1).vote(1, voter1Proof);
      const balanceAfter = await balToken.balanceOf(voter1.address);

      expect(balanceAfter - balanceBefore).to.equal(REWARD_PER_VOTE);
    });

    it("Should emit RewardPaid event", async function () {
      await expect(voting.connect(voter1).vote(1, voter1Proof))
        .to.emit(voting, "RewardPaid")
        .withArgs(voter1.address, REWARD_PER_VOTE);
    });

    it("Should not mint tokens if rewardPerVote is 0", async function () {
      await voting.setRewardPerVote(0);
      
      const balanceBefore = await balToken.balanceOf(voter1.address);
      await voting.connect(voter1).vote(1, voter1Proof);
      const balanceAfter = await balToken.balanceOf(voter1.address);

      expect(balanceAfter).to.equal(balanceBefore);
    });

    it("Should allow multiple voters to vote for different candidates", async function () {
      await voting.connect(voter1).vote(1, voter1Proof);
      await voting.connect(voter2).vote(2, voter2Proof);
      await voting.connect(voter3).vote(1, voter3Proof);

      expect(await voting.votes(1, 1)).to.equal(2);
      expect(await voting.votes(1, 2)).to.equal(1);
    });

    it("Should revert if voter tries to vote twice", async function () {
      await voting.connect(voter1).vote(1, voter1Proof);
      
      await expect(
        voting.connect(voter1).vote(2, voter1Proof)
      ).to.be.revertedWithCustomError(voting, "AlreadyVoted");
    });

    it("Should revert if voting before start time", async function () {
      const future = BigInt(Math.floor(Date.now() / 1000)) + 10000n;
      await voting.startElection(future, future + 3600n);

      await expect(
        voting.connect(voter1).vote(1, voter1Proof)
      ).to.be.revertedWithCustomError(voting, "NotInWindow");
    });

    it("Should revert if voting after end time", async function () {
      const past = BigInt(Math.floor(Date.now() / 1000)) - 7200n;
      await voting.startElection(past, past + 3600n);

      await expect(
        voting.connect(voter1).vote(1, voter1Proof)
      ).to.be.revertedWithCustomError(voting, "NotInWindow");
    });

    it("Should revert for invalid candidate ID (0)", async function () {
      await expect(
        voting.connect(voter1).vote(0, voter1Proof)
      ).to.be.revertedWithCustomError(voting, "InvalidCandidate");
    });

    it("Should revert for non-existent candidate", async function () {
      await expect(
        voting.connect(voter1).vote(999, voter1Proof)
      ).to.be.revertedWithCustomError(voting, "InvalidCandidate");
    });

    it("Should revert for inactive candidate", async function () {
      await voting.updateCandidate(1, CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS, false);
      
      await expect(
        voting.connect(voter1).vote(1, voter1Proof)
      ).to.be.revertedWithCustomError(voting, "InvalidCandidate");
    });

    it("Should revert for non-whitelisted voter", async function () {
      await expect(
        voting.connect(nonWhitelisted).vote(1, [])
      ).to.be.revertedWithCustomError(voting, "NotWhitelisted");
    });

    it("Should revert with invalid Merkle proof", async function () {
      const invalidProof = voter2Proof; // Using voter2's proof for voter1
      
      await expect(
        voting.connect(voter1).vote(1, invalidProof)
      ).to.be.revertedWithCustomError(voting, "NotWhitelisted");
    });
  });

  describe("Session Isolation", function () {
    beforeEach(async function () {
      await voting.addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS);
      await voting.setVoterMerkleRoot(merkleRoot);
    });

    it("Should allow voting again in a new session", async function () {
      // Session 1
      const now = BigInt(Math.floor(Date.now() / 1000));
      await voting.startElection(now - 10n, now + 3600n);
      await voting.connect(voter1).vote(1, voter1Proof);

      expect(await voting.voted(1, voter1.address)).to.be.true;
      expect(await voting.votes(1, 1)).to.equal(1);

      // Session 2 - set far in future to ensure different time window
      const future = now + 7200n;
      await voting.startElection(future, future + 3600n);
      expect(await voting.voted(2, voter1.address)).to.be.false;
      expect(await voting.sessionId()).to.equal(2);
      
      // Vote counts are isolated per session
      expect(await voting.votes(2, 1)).to.equal(0);
    });

    it("Should maintain separate vote counts per session", async function () {
      const now = BigInt(Math.floor(Date.now() / 1000));
      
      // Session 1
      await voting.startElection(now - 10n, now + 3600n);
      await voting.connect(voter1).vote(1, voter1Proof);
      expect(await voting.votes(1, 1)).to.equal(1);

      // Session 2 - verify separate counting
      const future = now + 7200n;
      await voting.startElection(future, future + 3600n);
      expect(await voting.votes(2, 1)).to.equal(0); // No votes in session 2 yet
      expect(await voting.votes(1, 1)).to.equal(1); // Session 1 votes preserved
    });
  });

  describe("getWinner", function () {
    beforeEach(async function () {
      await voting.addCandidate(CANDIDATE_1_NAME, CANDIDATE_1_POSITIONS);
      await voting.addCandidate(CANDIDATE_2_NAME, CANDIDATE_2_POSITIONS);
      await voting.setVoterMerkleRoot(merkleRoot);

      const now = BigInt(Math.floor(Date.now() / 1000));
      await voting.startElection(now - 10n, now + 3600n);
    });

    it("Should return correct winner", async function () {
      await voting.connect(voter1).vote(1, voter1Proof);
      await voting.connect(voter2).vote(1, voter2Proof);
      await voting.connect(voter3).vote(2, voter3Proof);

      const [winnerId, winnerVotes] = await voting.getWinner(1);
      expect(winnerId).to.equal(1);
      expect(winnerVotes).to.equal(2);
    });

    it("Should return 0 for winner when no votes cast", async function () {
      const [winnerId, winnerVotes] = await voting.getWinner(1);
      expect(winnerId).to.equal(0);
      expect(winnerVotes).to.equal(0);
    });

    it("Should handle ties (returns first candidate with max votes)", async function () {
      await voting.connect(voter1).vote(1, voter1Proof);
      await voting.connect(voter2).vote(2, voter2Proof);

      const [winnerId, winnerVotes] = await voting.getWinner(1);
      expect(winnerId).to.equal(1); // First candidate with max votes
      expect(winnerVotes).to.equal(1);
    });
  });
});
