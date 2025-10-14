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

  const startElection = (startTime: bigint, endTime: bigint) => {
    writeContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'startElection',
      args: [startTime, endTime],
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

export interface CandidateResult extends Candidate {
  votes: number;
  percentage: number;
}

export function useElectionResults(sessionId: bigint, enablePolling = false) {
  // Get candidate count
  const { data: count } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'candidateCount',
  });

  const candidateIds = Array.from({ length: Number(count || 0) }, (_, i) => i + 1);

  // Get winner info
  const { data: winnerData, refetch: refetchWinner } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getWinner',
    args: [sessionId],
    query: {
      refetchInterval: enablePolling ? 5000 : false, // Poll every 5 seconds if enabled
    },
  });

  // Get all candidates with their votes
  const candidatesWithVotes = candidateIds.map((id) => {
    const { data: candidateData } = useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'getCandidate',
      args: [BigInt(id)],
      query: {
        refetchInterval: enablePolling ? 5000 : false,
      },
    });

    const { data: voteCount } = useReadContract({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'votes',
      args: [sessionId, BigInt(id)],
      query: {
        refetchInterval: enablePolling ? 5000 : false,
      },
    });

    if (!candidateData) return null;

    const [candidateId, name, positions] = candidateData as [bigint, string, [bigint, bigint, bigint]];
    const votes = Number(voteCount || 0n);

    return {
      id: Number(candidateId),
      name,
      positions: [Number(positions[0]), Number(positions[1]), Number(positions[2])] as [
        number,
        number,
        number
      ],
      votes,
      percentage: 0, // Will calculate after we have total
    } as CandidateResult;
  });

  const validCandidates = candidatesWithVotes.filter((c): c is CandidateResult => c !== null);

  // Calculate total votes and percentages
  const totalVotes = validCandidates.reduce((sum, c) => sum + c.votes, 0);
  const results = validCandidates.map((c) => ({
    ...c,
    percentage: totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0,
  }));

  // Sort by votes descending
  results.sort((a, b) => b.votes - a.votes);

  const winner = winnerData
    ? {
        id: Number((winnerData as [bigint, bigint])[0]),
        votes: Number((winnerData as [bigint, bigint])[1]),
      }
    : null;

  return {
    results,
    totalVotes,
    winner,
    refetch: refetchWinner,
  };
}
