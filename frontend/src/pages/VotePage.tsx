import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAccount, useReadContract, useBlockNumber } from 'wagmi';
import { VOTING_ABI, VOTING_ADDRESS } from '../lib/contracts';
import { useVotingContract } from '../lib/hooks';
import { useCountdown } from '../lib/useCountdown';
import { useMerkleProof } from '../lib/useMerkleProof';
import VotingPanel from '../components/VotingPanel';

export default function VotePage() {
  const { address, isConnected } = useAccount();
  const { vote, isPending, isConfirming, isSuccess, error } = useVotingContract();
  const { proof, isWhitelisted } = useMerkleProof(address);

  const { data: currentSessionId } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'sessionId',
  });

  const { data: startTime } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'start',
  });

  const { data: endTime } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'end',
  });

  const { data: hasVoted, refetch: refetchHasVoted } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'voted',
    args: address && currentSessionId ? [currentSessionId, address] : undefined,
    // Keep the UI responsive: enable only when inputs exist and do a light poll
    query: {
      enabled: Boolean(address && currentSessionId),
      refetchInterval: 4000,
    },
  });

  const countdown = useCountdown(endTime as bigint | undefined);

  const [votingCandidateId, setVotingCandidateId] = useState<number | null>(null);

  // Watch new blocks to keep read state in sync (e.g., hasVoted)
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const now = BigInt(Math.floor(Date.now() / 1000));
  const isElectionActive =
    startTime && endTime && now >= (startTime as bigint) && now <= (endTime as bigint);

  const [voteError, setVoteError] = useState<string | null>(null);
  const handleVote = async (candidateId: number) => {
    setVoteError(null);
    if (!proof || proof.length === 0) {
      setVoteError('You are not whitelisted to vote.');
      return;
    }
    setVotingCandidateId(candidateId);
    try {
      await vote(candidateId, proof);
    } catch (err: any) {
      // Try to decode common contract errors
      let reason = err?.reason || err?.message || 'Transaction reverted.';
      if (err?.data?.message?.includes('NotInWindow')) reason = 'Voting is not currently open.';
      if (err?.data?.message?.includes('AlreadyVoted')) reason = 'You have already voted in this election.';
      if (err?.data?.message?.includes('NotWhitelisted')) reason = 'Your address is not whitelisted to vote.';
      if (err?.data?.message?.includes('InvalidCandidate')) reason = 'Selected candidate is not valid.';
      setVoteError(reason);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setVotingCandidateId(null);
      // Ensure the "has voted" banner appears immediately after a successful vote
      refetchHasVoted?.();
    }
  }, [isSuccess, refetchHasVoted]);

  // On each new block, lightly refetch hasVoted to keep UI consistent
  useEffect(() => {
    if (blockNumber) {
      refetchHasVoted?.();
    }
  }, [blockNumber, refetchHasVoted]);

  if (!isConnected) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Cast Your Vote
        </Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          Please connect your wallet to participate in the election.
        </Alert>
      </Box>
    );
  }

  if (!isWhitelisted) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Cast Your Vote
        </Typography>
        <Alert severity="error" sx={{ mt: 3 }}>
          Your address is not whitelisted to vote in this election. Please contact the
          administrator.
        </Alert>
      </Box>
    );
  }

  if (!isElectionActive) {
    const hasNotStarted = startTime && now < (startTime as bigint);
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Cast Your Vote
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          {hasNotStarted
            ? `The election has not started yet. It will begin on ${new Date(Number(startTime) * 1000).toLocaleString()}.`
            : 'No active election at the moment. Please check back later.'}
        </Alert>
        <Paper sx={{ mt: 2, p: 2, background: '#f9f9f9' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Debug Info:</strong><br />
            startTime: {String(startTime)}<br />
            endTime: {String(endTime)}<br />
            now: {String(now)}<br />
            sessionId: {String(currentSessionId)}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cast Your Vote
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Election Session #{currentSessionId?.toString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Ends: {endTime ? new Date(Number(endTime) * 1000).toLocaleString() : 'Loading...'}
              </Typography>
            </Box>
          </Box>

          <Box>
            {countdown.isExpired ? (
              <Chip label="Election Ended" color="error" />
            ) : (
              <Chip
                label={`${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`}
                color="success"
                icon={<AccessTimeIcon />}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {hasVoted ? (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          You have already voted in this election. Thank you for participating!
        </Alert>
      ) : null}

      {isPending || isConfirming ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Processing your vote for Candidate #{votingCandidateId}...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isPending ? 'Waiting for wallet confirmation...' : 'Waiting for transaction confirmation...'}
          </Typography>
        </Paper>
      ) : null}

      {(error || voteError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {voteError || error?.message}
        </Alert>
      )}

      {isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          🎉 Vote submitted successfully! You will receive BAL tokens as a reward.
        </Alert>
      )}

      {!hasVoted ? (
        <VotingPanel
          onVote={handleVote}
          isLoading={isPending || isConfirming}
          disabled={!!hasVoted || countdown.isExpired}
          hasVoted={!!hasVoted}
        />
      ) : null}
    </Box>
  );
}
