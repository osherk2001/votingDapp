# Web3 Voting DApp

This project is a decentralized voting application built using Web3 technologies. It allows users to create and participate in voting events securely and transparently on the blockchain.

## Project Structure

- **contracts/**: Contains the smart contracts for the voting system.
  - **Voting.sol**: The implementation of the Voting contract.
  
- **src/**: The source code for the frontend application.
  - **index.ts**: The entry point for the application.
  - **components/**: Contains React components.
    - **VotingForm.tsx**: The component for users to cast their votes.
  - **types/**: TypeScript types and interfaces.
    - **index.ts**: Definitions for types used throughout the application.
  
- **test/**: Contains unit tests for the smart contracts.
  - **Voting.test.ts**: Tests for the Voting contract functionalities.

- **hardhat.config.ts**: Configuration file for Hardhat, specifying Solidity version and network settings.

- **package.json**: Lists dependencies and scripts for the project.

- **tsconfig.json**: TypeScript configuration file.

- **README.md**: Documentation for the project.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd web3-voting-dapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

1. Compile the smart contracts:
   ```
   npx hardhat compile
   ```

2. Start the development server (if applicable):
   ```
   npm start
   ```

### Testing

To run the unit tests for the Voting contract, use:
```
npx hardhat test
```

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

### License

This project is licensed under the MIT License. See the LICENSE file for details.