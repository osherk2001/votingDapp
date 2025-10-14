import { ethers } from "hardhat";
import { expect } from "chai";

describe("Voting Contract", function () {
    let Voting;
    let voting;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        Voting = await ethers.getContractFactory("Voting");
        [owner, addr1, addr2] = await ethers.getSigners();
        voting = await Voting.deploy();
        await voting.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await voting.owner()).to.equal(owner.address);
        });
    });

    describe("Voting", function () {
        it("Should allow users to cast votes", async function () {
            await voting.addCandidate("Alice");
            await voting.connect(addr1).vote(0);
            expect(await voting.getVotes(0)).to.equal(1);
        });

        it("Should not allow double voting", async function () {
            await voting.addCandidate("Bob");
            await voting.connect(addr1).vote(1);
            await expect(voting.connect(addr1).vote(1)).to.be.revertedWith("You have already voted");
        });

        it("Should return the correct winner", async function () {
            await voting.addCandidate("Charlie");
            await voting.addCandidate("Dave");
            await voting.connect(addr1).vote(0);
            await voting.connect(addr2).vote(1);
            expect(await voting.getWinner()).to.equal("Dave");
        });
    });
});