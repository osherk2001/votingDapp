# 🗳️ Web3 Voting DApp

A production-ready decentralized voting application with BAL token rewards built on Ethereum.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-v2.19-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-v5.0-purple)](https://openzeppelin.com/)
[![Tests](https://img.shields.io/badge/Tests-65%20passing-green)](./test)

## 🎯 Features

### Admin Dashboard
- ✅ Manage candidates with 3-topic policy positions
- ✅ Upload voter whitelist (CSV/JSON → Merkle tree)
- ✅ Set election window (start/end timestamps)
- ✅ Configure BAL token rewards per vote

### Voter Interface
- ✅ **Manual voting** - Browse candidates and select your choice
- ✅ **AI-powered matching** - 3 sliders for policy preferences → auto-match to best candidate
- ✅ Automatic BAL token rewards on successful vote
- ✅ View real-time results and leaderboard

### Smart Contracts
- **`BALToken.sol`** - ERC20 token with role-based minting
- **`Voting.sol`** - Session-based elections with Merkle whitelist verification

### Security
- OpenZeppelin v5 contracts (ERC20, AccessControl, Ownable)
- ReentrancyGuard on vote function
- Merkle proof verification for voter whitelist
- Custom errors for gas optimization
- Comprehensive test coverage (65 tests)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **MetaMask** or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/osherk2001/votingDapp.git
cd votingDapp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configuration

Edit `.env` with your settings:

```env
# Required for deployment
PRIVATE_KEY=your_wallet_private_key_without_0x
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Set after deployment
BAL_TOKEN_ADDRESS=
VOTING_ADDRESS=

# Optional: Election schedule
ELECTION_START=2024-01-01T00:00:00Z
ELECTION_END=2024-01-08T00:00:00Z
```

## 📝 Development Workflow

### 1. Compile Contracts

```bash
npm run compile
```

**Output:**
```
Compiled 5 Solidity files successfully
Generated 40 TypeScript typings
```

### 2. Run Tests

```bash
npm test
```

**Expected:**
```
65 passing (3s)

BALToken (20 tests)
  ✔ Deployment, minting, role management
  
Voting (45 tests)
  ✔ Candidate management
  ✔ Merkle root setup
  ✔ Election lifecycle
  ✔ Voting flow with rewards
  ✔ Session isolation
```

### 3. Deploy Locally

**Terminal 1 - Start local node:**
```bash
npm run node
```

**Terminal 2 - Deploy:**
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Save the output addresses to your `.env`:
```env
BAL_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VOTING_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 4. Setup Election

**Grant minting permission:**
```bash
npx hardhat run scripts/grantMinter.ts --network localhost
```

**Generate voter whitelist:**
```bash
# Edit data/whitelist.json with voter addresses
npx hardhat run scripts/merkle/generate.ts

# Set Merkle root in contract
npx hardhat run scripts/setRoot.ts --network localhost
```

**Add candidates:**
```bash
# Edit data/candidates.json
npx hardhat run scripts/addCandidates.ts --network localhost
```

**Start election:**
```bash
npx hardhat run scripts/startElection.ts --network localhost
```

### 5. View Results

```bash
npx hardhat run scripts/results.ts --network localhost
```

## 🌐 Deploy to Sepolia Testnet

### Setup

1. Get Sepolia ETH from faucet: [sepoliafaucet.com](https://sepoliafaucet.com/)
2. Get Infura/Alchemy RPC URL
3. Update `.env` with your `PRIVATE_KEY` and `SEPOLIA_RPC_URL`

### Deploy

```bash
# Deploy contracts
npx hardhat run scripts/deploy.ts --network sepolia

# Grant MINTER_ROLE
npx hardhat run scripts/grantMinter.ts --network sepolia

# Setup election
npx hardhat run scripts/merkle/generate.ts
npx hardhat run scripts/setRoot.ts --network sepolia
npx hardhat run scripts/addCandidates.ts --network sepolia
npx hardhat run scripts/startElection.ts --network sepolia
```

## 📁 Project Structure

```
.
├── contracts/              # Smart contracts
│   ├── BALToken.sol       # ERC20 reward token
│   └── Voting.sol         # Main voting contract
│
├── scripts/               # Deployment & management
│   ├── deploy.ts         # Deploy both contracts
│   ├── grantMinter.ts    # Grant MINTER_ROLE
│   ├── addCandidates.ts  # Add candidates from JSON
│   ├── setRoot.ts        # Set voter Merkle root
│   ├── startElection.ts  # Start election session
│   ├── results.ts        # View results
│   └── merkle/
│       └── generate.ts   # Generate Merkle tree
│
├── test/                  # Contract tests
│   ├── BALToken.test.ts  # 20 tests
│   └── Voting.test.ts    # 45 tests
│
├── data/                  # Auto-generated data
│   ├── candidates.json   # Candidate list
│   ├── whitelist.json    # Voter addresses
│   └── merkle-proofs.json # Merkle proofs
│
├── hardhat.config.ts      # Hardhat configuration
├── tsconfig.json          # TypeScript configuration
└── .env.example           # Environment template
```

## 🔐 Smart Contracts

### BALToken.sol

**ERC20 token with role-based minting**

```solidity
contract BALToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE);
}
```

**Features:**
- Standard ERC20 (transfer, approve, allowance)
- `MINTER_ROLE` for controlled minting
- `DEFAULT_ADMIN_ROLE` for role management

### Voting.sol

**Session-based voting with Merkle whitelist**

```solidity
contract Voting is Ownable, ReentrancyGuard {
    // Candidate with 3 policy positions [0-100]
    struct Candidate {
        string name;
        uint8[3] positions;
        bool active;
    }
    
    // Vote with Merkle proof verification
    function vote(uint256 candidateId, bytes32[] calldata merkleProof) 
        external 
        nonReentrant;
}
```

**Features:**
- Session-based elections (multiple rounds)
- Merkle proof voter verification
- Candidate policy positions (3 topics, 0-100 scale)
- Automatic BAL token rewards
- One vote per session per address
- Time-window enforcement

## 🧪 Testing

**Run full test suite:**
```bash
npm test
```

**Run specific test file:**
```bash
npx hardhat test test/BALToken.test.ts
npx hardhat test test/Voting.test.ts
```

**Test Coverage:**
- ✅ Contract deployment and initialization
- ✅ Role-based access control
- ✅ Candidate management (add/update/deactivate)
- ✅ Merkle root setup
- ✅ Election lifecycle (start/end validation)
- ✅ Voting flow (valid/invalid scenarios)
- ✅ Double-vote prevention
- ✅ Time window enforcement
- ✅ Merkle proof verification
- ✅ BAL token reward minting
- ✅ Session isolation
- ✅ Winner calculation

## 📊 Data Files

### candidates.json

```json
[
  {
    "name": "Alice Johnson",
    "positions": [30, 60, 90]
  },
  {
    "name": "Bob Smith",
    "positions": [70, 40, 20]
  }
]
```

**Positions:** `[Economy, Healthcare, Environment]` - values 0-100

### whitelist.json

```json
[
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
]
```

**Important:** Merkle leaves use lowercase addresses:
```
leaf = keccak256(abi.encodePacked(address.toLowerCase()))
```

## 🎨 Auto-Match Algorithm

Voters set 3 policy preference sliders [0-100]. The system calculates:

```typescript
// Squared normalized distance
distance = (Δ1² + Δ2² + Δ3²) / (3 × 100²)

// Match score
score = round(100 × (1 - distance))

// Select candidate with highest score (tie → lowest ID)
```

**Example:**
- Voter: `[50, 80, 30]`
- Candidate A: `[30, 60, 90]` → Score: 72
- Candidate B: `[50, 80, 35]` → Score: 98 ✅ **Best match**

## 🛠️ Scripts Reference

| Script | Purpose | Network Required |
|--------|---------|------------------|
| `deploy.ts` | Deploy BALToken & Voting | ✅ |
| `grantMinter.ts` | Grant MINTER_ROLE to Voting | ✅ |
| `merkle/generate.ts` | Generate Merkle tree & proofs | ❌ (local) |
| `setRoot.ts` | Set voter Merkle root | ✅ |
| `addCandidates.ts` | Add candidates from JSON | ✅ |
| `startElection.ts` | Start election session | ✅ |
| `results.ts` | View election results | ✅ |

## 🔧 Configuration

### hardhat.config.ts

```typescript
{
  solidity: "0.8.28",
  networks: {
    hardhat: { chainId: 31337 },
    localhost: { url: "http://127.0.0.1:8545" },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
}
```

### tsconfig.json

- Strict TypeScript mode enabled
- No implicit `any`
- Comprehensive type checking

## 🚨 Troubleshooting

**Issue: "Cannot connect to network localhost"**
```bash
# Start Hardhat node in separate terminal
npm run node
```

**Issue: "Missing contract addresses"**
```bash
# Set in .env after deployment
BAL_TOKEN_ADDRESS=0x...
VOTING_ADDRESS=0x...
```

**Issue: "Transaction reverted: NotWhitelisted"**
```bash
# Regenerate Merkle proofs and set root
npx hardhat run scripts/merkle/generate.ts
npx hardhat run scripts/setRoot.ts --network localhost
```

**Issue: "NotInWindow error"**
- Check election start/end times match current timestamp
- Verify with `results.ts` script

## 📜 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- **Repository:** [github.com/osherk2001/votingDapp](https://github.com/osherk2001/votingDapp)
- **Hardhat:** [hardhat.org](https://hardhat.org/)
- **OpenZeppelin:** [openzeppelin.com](https://openzeppelin.com/)
- **Sepolia Faucet:** [sepoliafaucet.com](https://sepoliafaucet.com/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review test files for usage examples

---

**Built with ❤️ using Hardhat, OpenZeppelin, and TypeScript**
