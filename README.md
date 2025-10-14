# Web3 Voting DApp

A production-ready decentralized voting application with BAL token rewards built on Ethereum.

## Features

- **Admin Dashboard**: Manage candidates, voter whitelist (Merkle tree), election timing, and vote rewards
- **Voter Interface**: Manual voting or AI-powered candidate matching based on policy preferences
- **Smart Contracts**: 
  - `BALToken`: ERC20 token with minter role for vote rewards
  - `Voting`: Secure voting with Merkle whitelist, session-based elections, and automatic rewards
- **Security**: OpenZeppelin contracts, reentrancy guards, role-based access control
- **Testing**: Comprehensive unit tests with Hardhat

## Tech Stack

- **Blockchain**: Solidity 0.8.28, OpenZeppelin ^5
- **Development**: Hardhat v3, TypeScript, ESLint, Prettier
- **Frontend**: Vite, React, TypeScript, wagmi, viem, Material-UI
- **Merkle Trees**: merkletreejs + keccak256

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your environment variables:
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_rpc_url_here
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Local Development

```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy contracts
npm run deploy:local
```

### Deploy to Sepolia

```bash
npm run deploy:sepolia
```

## Project Structure

```
.
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment and management scripts
├── test/              # Contract tests
├── frontend/          # React frontend application
├── hardhat.config.ts  # Hardhat configuration
└── tsconfig.json      # TypeScript configuration
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
