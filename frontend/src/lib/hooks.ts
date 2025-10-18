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
      functionName: 'setVoterMerkleRoot',
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
  // Use the new getAllCandidates function to fetch all candidates in one call
  const { data } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getAllCandidates',
  });

  if (!data) return [];

  // getAllCandidates returns: (candidateIds[], names[], allPositions[], activeFlags[])
  const [candidateIds, names, allPositions, activeFlags] = data as [
    bigint[],
    string[],
    bigint[],
    boolean[]
  ];

  // Map the flattened arrays back to candidate objects
  const candidates = candidateIds.map((id, index) => {
    // Only return active candidates
    if (!activeFlags[index]) return null;

    return {
      id: Number(id),
      name: names[index],
      positions: [
        Number(allPositions[index * 3]),
        Number(allPositions[index * 3 + 1]),
        Number(allPositions[index * 3 + 2]),
      ] as [number, number, number],
    } as Candidate;
  });

  return candidates.filter((c): c is Candidate => c !== null);
}

export interface CandidateResult extends Candidate {
  votes: number;
  percentage: number;
}

export function useElectionResults(sessionId: bigint, enablePolling = false) {
  // Get winner info
  const { data: winnerData, refetch: refetchWinner } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getWinner',
    args: [sessionId],
    query: {
      refetchInterval: enablePolling ? 5000 : false,
    },
  });

  // Get all candidates
  const allCandidates = useCandidates();

  // Get all votes in a single batch call using the new getAllVotes function
  const { data: allVotesData, refetch: refetchVotes } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getAllVotes',
    args: [sessionId],
    query: {
      refetchInterval: enablePolling ? 5000 : false,
    },
  });

  // Map candidates with their vote counts
  const candidatesWithVotes = allCandidates.map((candidate) => {
    const votesArray = allVotesData as bigint[] | undefined;
    const votes = votesArray && votesArray[candidate.id] 
      ? Number(votesArray[candidate.id]) 
      : 0;
    
    return {
      ...candidate,
      votes,
      percentage: 0, // Will be calculated below
    } as CandidateResult;
  });

  const validCandidates = candidatesWithVotes;

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
    refetch: async () => {
      await refetchWinner();
      await refetchVotes();
    },
  };
}
