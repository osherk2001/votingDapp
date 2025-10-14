import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTING_ABI, VOTING_ADDRESS } from '../lib/contracts';
import type { Candidate } from '../types';

export function useVotingContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read functions
  const useCandidateCount = () =>
    useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'candidateCount',
    });

  const useCandidate = (id: number) =>
    useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'getCandidate',
      args: [BigInt(id)],
    });

  const useElectionInfo = () =>
    useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'currentSessionId',
    });

  const useVoterRoot = () =>
    useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'voterRoot',
    });

  const useHasVoted = (sessionId: bigint, voter: `0x${string}`) =>
    useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'voted',
      args: [sessionId, voter],
    });

  const useVoteCount = (sessionId: bigint, candidateId: number) =>
    useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'votes',
      args: [sessionId, BigInt(candidateId)],
    });

  // Write functions
  const addCandidate = (name: string, positions: [number, number, number]) => {
    writeContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'addCandidate',
      args: [name, positions],
    });
  };

  const setVoterRoot = (root: `0x${string}`) => {
    writeContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'setVoterRoot',
      args: [root],
    });
  };

  const startElection = (sessionId: bigint, startTime: bigint, endTime: bigint) => {
    writeContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'startElection',
      args: [sessionId, startTime, endTime],
    });
  };

  const vote = (candidateId: number, proof: `0x${string}`[]) => {
    writeContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'vote',
      args: [BigInt(candidateId), proof],
    });
  };

  return {
    // Hooks
    useCandidateCount,
    useCandidate,
    useElectionInfo,
    useVoterRoot,
    useHasVoted,
    useVoteCount,
    // Actions
    addCandidate,
    setVoterRoot,
    startElection,
    vote,
    // Transaction state
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useCandidates() {
  const { data: count } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'candidateCount',
  });

  const candidateIds = Array.from({ length: Number(count || 0) }, (_, i) => i + 1);

  const candidates = candidateIds.map((id) => {
    const { data } = useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'getCandidate',
      args: [BigInt(id)],
    });

    if (!data) return null;

    const [candidateId, name, positions] = data as [bigint, string, [bigint, bigint, bigint]];
    return {
      id: Number(candidateId),
      name,
      positions: [Number(positions[0]), Number(positions[1]), Number(positions[2])] as [
        number,
        number,
        number
      ],
    } as Candidate;
  });

  return candidates.filter((c): c is Candidate => c !== null);
}
