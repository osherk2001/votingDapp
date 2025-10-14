# Frontend Contract Function Mapping Issues

## Problem
The frontend is calling functions that don't exist in the Voting contract:
1. `electionWindow()` - doesn't exist
2. `currentSessionId` as a function (should use `sessionId`)

## Contract State Variables (Solidity)
```solidity
uint256 public sessionId;       // Current session ID
uint64 public start;            // Election start time
uint64 public end;              // Election end time
bytes32 public voterRoot;       // Merkle root
```

## Frontend Usage (Current - INCORRECT)
```typescript
// ❌ WRONG - these functions don't exist
functionName: 'electionWindow'      // Returns [start, end]
functionName: 'currentSessionId'    // Returns sessionId
```

## Fix Options

### Option 1: Update Frontend (RECOMMENDED)
Change frontend to read separate state variables:

```typescript
// Read sessionId
const { data: sessionId } = useReadContract({
  address: VOTING_ADDRESS,
  abi: VOTING_ABI,
  functionName: 'sessionId',  // ✅ Correct
});

// Read start time
const { data: startTime } = useReadContract({
  address: VOTING_ADDRESS,
  abi: VOTING_ABI,
  functionName: 'start',  // ✅ Correct
});

// Read end time
const { data: endTime } = useReadContract({
  address: VOTING_ADDRESS,
  abi: VOTING_ABI,
  functionName: 'end',  // ✅ Correct
});
```

### Option 2: Add Helper Functions to Contract (Not Recommended - requires redeployment)
```solidity
function electionWindow() external view returns (uint64, uint64) {
    return (start, end);
}
```

## All Required Fixes

### Files to Update:
1. `frontend/src/components/AdminElection.tsx` - lines 20-29
2. `frontend/src/pages/VotePage.tsx` - lines 22-31
3. `frontend/src/pages/ResultsPage.tsx` - lines 32-42

### Changes Needed:
Replace:
```typescript
functionName: 'currentSessionId' → functionName: 'sessionId'
functionName: 'electionWindow'   → Read 'start' and 'end' separately
```
