import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAccount, useReadContract } from 'wagmi';
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
    functionName: 'currentSessionId',
  });

  const { data: electionWindow } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'electionWindow',
  });

  const { data: hasVoted } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'voted',
    args: address && currentSessionId ? [currentSessionId, address] : undefined,
  });

  const endTime = electionWindow ? (electionWindow as [bigint, bigint])[1] : undefined;
  const startTime = electionWindow ? (electionWindow as [bigint, bigint])[0] : undefined;
  const countdown = useCountdown(endTime);

  const [votingCandidateId, setVotingCandidateId] = useState<number | null>(null);

  const now = BigInt(Math.floor(Date.now() / 1000));
  const isElectionActive =
    startTime && endTime && now >= startTime && now <= endTime;

  const handleVote = (candidateId: number) => {
    if (!proof || proof.length === 0) {
      alert('You are not whitelisted to vote.');
      return;
    }
    setVotingCandidateId(candidateId);
    vote(candidateId, proof);
  };

  useEffect(() => {
    if (isSuccess) {
      setVotingCandidateId(null);
    }
  }, [isSuccess]);

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
    const hasNotStarted = startTime && now < startTime;
    
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error.message}
        </Alert>
      )}

      {isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          🎉 Vote submitted successfully! You will receive BAL tokens as a reward.
        </Alert>
      )}

      <VotingPanel
        onVote={handleVote}
        isLoading={isPending || isConfirming}
        disabled={!!hasVoted || countdown.isExpired}
        hasVoted={!!hasVoted}
      />
    </Box>
  );
}
