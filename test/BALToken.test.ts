import { expect } from "chai";
import { ethers } from "hardhat";
import { BALToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BALToken", function () {
  let balToken: BALToken;
  let owner: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const TOKEN_NAME = "BAL Token";
  const TOKEN_SYMBOL = "BAL";
  const MINT_AMOUNT = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, minter, user1, user2] = await ethers.getSigners();

    const BALTokenFactory = await ethers.getContractFactory("BALToken");
    balToken = await BALTokenFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL);
    await balToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token name", async function () {
      expect(await balToken.name()).to.equal(TOKEN_NAME);
    });

    it("Should set the correct token symbol", async function () {
      expect(await balToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should have 18 decimals by default", async function () {
      expect(await balToken.decimals()).to.equal(18);
    });

    it("Should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await balToken.DEFAULT_ADMIN_ROLE();
      expect(await balToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should have zero total supply initially", async function () {
      expect(await balToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    describe("Without MINTER_ROLE", function () {
      it("Should revert when non-minter tries to mint", async function () {
        const MINTER_ROLE = await balToken.MINTER_ROLE();
        
        await expect(
          balToken.connect(user1).mint(user2.address, MINT_AMOUNT)
        ).to.be.revertedWithCustomError(balToken, "AccessControlUnauthorizedAccount")
          .withArgs(user1.address, MINTER_ROLE);
      });

      it("Should revert when owner tries to mint without MINTER_ROLE", async function () {
        const MINTER_ROLE = await balToken.MINTER_ROLE();
        
        await expect(
          balToken.connect(owner).mint(user1.address, MINT_AMOUNT)
        ).to.be.revertedWithCustomError(balToken, "AccessControlUnauthorizedAccount")
          .withArgs(owner.address, MINTER_ROLE);
      });
    });

    describe("With MINTER_ROLE", function () {
      beforeEach(async function () {
        const MINTER_ROLE = await balToken.MINTER_ROLE();
        await balToken.connect(owner).grantRole(MINTER_ROLE, minter.address);
      });

      it("Should allow minter to mint tokens", async function () {
        await balToken.connect(minter).mint(user1.address, MINT_AMOUNT);
        expect(await balToken.balanceOf(user1.address)).to.equal(MINT_AMOUNT);
      });

      it("Should increase total supply when minting", async function () {
        await balToken.connect(minter).mint(user1.address, MINT_AMOUNT);
        expect(await balToken.totalSupply()).to.equal(MINT_AMOUNT);
      });

      it("Should allow minting to multiple addresses", async function () {
        const amount1 = ethers.parseEther("50");
        const amount2 = ethers.parseEther("75");

        await balToken.connect(minter).mint(user1.address, amount1);
        await balToken.connect(minter).mint(user2.address, amount2);

        expect(await balToken.balanceOf(user1.address)).to.equal(amount1);
        expect(await balToken.balanceOf(user2.address)).to.equal(amount2);
        expect(await balToken.totalSupply()).to.equal(amount1 + amount2);
      });

      it("Should allow minting zero tokens", async function () {
        await balToken.connect(minter).mint(user1.address, 0);
        expect(await balToken.balanceOf(user1.address)).to.equal(0);
      });

      it("Should emit Transfer event when minting", async function () {
        await expect(balToken.connect(minter).mint(user1.address, MINT_AMOUNT))
          .to.emit(balToken, "Transfer")
          .withArgs(ethers.ZeroAddress, user1.address, MINT_AMOUNT);
      });
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to grant MINTER_ROLE", async function () {
      const MINTER_ROLE = await balToken.MINTER_ROLE();
      await balToken.connect(owner).grantRole(MINTER_ROLE, minter.address);
      expect(await balToken.hasRole(MINTER_ROLE, minter.address)).to.be.true;
    });

    it("Should allow admin to revoke MINTER_ROLE", async function () {
      const MINTER_ROLE = await balToken.MINTER_ROLE();
      await balToken.connect(owner).grantRole(MINTER_ROLE, minter.address);
      await balToken.connect(owner).revokeRole(MINTER_ROLE, minter.address);
      expect(await balToken.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });

    it("Should not allow non-admin to grant MINTER_ROLE", async function () {
      const MINTER_ROLE = await balToken.MINTER_ROLE();
      const DEFAULT_ADMIN_ROLE = await balToken.DEFAULT_ADMIN_ROLE();
      
      await expect(
        balToken.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.revertedWithCustomError(balToken, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, DEFAULT_ADMIN_ROLE);
    });

    it("Should allow minter to renounce their role", async function () {
      const MINTER_ROLE = await balToken.MINTER_ROLE();
      await balToken.connect(owner).grantRole(MINTER_ROLE, minter.address);
      await balToken.connect(minter).renounceRole(MINTER_ROLE, minter.address);
      expect(await balToken.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });
  });

  describe("ERC20 Functionality", function () {
    beforeEach(async function () {
      const MINTER_ROLE = await balToken.MINTER_ROLE();
      await balToken.connect(owner).grantRole(MINTER_ROLE, minter.address);
      await balToken.connect(minter).mint(user1.address, MINT_AMOUNT);
    });

    it("Should allow token transfers", async function () {
      const transferAmount = ethers.parseEther("10");
      await balToken.connect(user1).transfer(user2.address, transferAmount);
      expect(await balToken.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await balToken.balanceOf(user1.address)).to.equal(MINT_AMOUNT - transferAmount);
    });

    it("Should allow approved transfers", async function () {
      const transferAmount = ethers.parseEther("10");
      await balToken.connect(user1).approve(user2.address, transferAmount);
      await balToken.connect(user2).transferFrom(user1.address, user2.address, transferAmount);
      expect(await balToken.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should track allowances correctly", async function () {
      const approvalAmount = ethers.parseEther("50");
      await balToken.connect(user1).approve(user2.address, approvalAmount);
      expect(await balToken.allowance(user1.address, user2.address)).to.equal(approvalAmount);
    });
  });

  describe("MINTER_ROLE constant", function () {
    it("Should have correct MINTER_ROLE value", async function () {
      const expectedRole = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
      expect(await balToken.MINTER_ROLE()).to.equal(expectedRole);
    });
  });
});
