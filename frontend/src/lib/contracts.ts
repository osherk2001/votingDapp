import BALTokenABI from './abis/BALToken.json';
import VotingABI from './abis/Voting.json';

export const BAL_TOKEN_ABI = BALTokenABI;
export const VOTING_ABI = VotingABI;

export const BAL_TOKEN_ADDRESS = (import.meta.env.VITE_BAL_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const VOTING_ADDRESS = (import.meta.env.VITE_VOTING_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
