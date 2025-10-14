# BAL Voting DApp - Frontend

React + TypeScript + Vite frontend for the BAL Voting DApp with Material-UI, wagmi, and viem.

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with deployed contract addresses
```

## Development

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Structure

```
src/
├── lib/
│   ├── wagmi.ts          # Wagmi/viem config
│   ├── contracts.ts      # Contract addresses & ABIs
│   └── abis/             # Contract ABIs
├── components/
│   └── Layout.tsx        # Main layout with navigation
├── pages/
│   ├── HomePage.tsx      # Landing page
│   ├── VotePage.tsx      # Voting interface
│   ├── AdminPage.tsx     # Admin dashboard
│   └── ResultsPage.tsx   # Results display
└── types/
    └── index.ts          # TypeScript types
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI** - Component library
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching
