// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BALToken
 * @dev ERC20 token with minting capability restricted to MINTER_ROLE
 * Used as a reward token for voting in the elections DApp
 */
contract BALToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Constructor that gives DEFAULT_ADMIN_ROLE to the contract deployer
     * @param name The name of the token
     * @param symbol The symbol of the token (should be "BAL")
     */
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Mints new tokens to the specified address
     * Can only be called by addresses with MINTER_ROLE
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
