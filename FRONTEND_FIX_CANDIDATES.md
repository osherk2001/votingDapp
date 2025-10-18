# Frontend Fix - Candidates Display Issue

## Problem
Candidates were not displaying on the web interface due to incorrect data parsing from the smart contract.

## Root Cause
The `getCandidate` function in the Voting smart contract returns:
```solidity
(string memory name, uint8[3] memory positions, bool active)
```

But the frontend code was expecting:
```javascript
[candidateId, name, positions]
```

## Solution Applied

### 1. Fixed `useCandidates` hook (hooks.ts)
**Before:**
```typescript
const [candidateId, name, positions] = data as [bigint, string, [bigint, bigint, bigint]];
return {
  id: Number(candidateId),
  name,
  positions: [...]
}
```

**After:**
```typescript
const [name, positions, active] = data as [string, [bigint, bigint, bigint], boolean];
if (!active) return null; // Skip inactive candidates
return {
  id: id, // Use the loop index as ID
  name,
  positions: [...]
}
```

### 2. Fixed `useElectionResults` hook (hooks.ts)
Applied the same fix to the election results function to ensure results page works correctly.

### 3. Fixed ABI imports (contracts.ts)
**Before:**
```typescript
export const VOTING_ABI = VotingABI;
```

**After:**
```typescript
export const VOTING_ABI = VotingABIJson.abi;
```

This extracts only the ABI array from the JSON artifact, fixing TypeScript type errors.

## Result
✅ Candidates now display correctly on the Vote page
✅ Only active candidates are shown
✅ Election results page will work correctly
✅ TypeScript type errors resolved

## Testing
1. Navigate to http://localhost:3000
2. Go to the Vote page
3. You should see 4 candidates:
   - Alice Johnson (positions: 75, 60, 80)
   - Bob Smith (positions: 50, 70, 55)
   - Carol Williams (positions: 90, 85, 75)
   - David Brown (positions: 40, 50, 65)

## Date Fixed
October 18, 2025
