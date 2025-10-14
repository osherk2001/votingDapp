import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useReadContract } from 'wagmi';
import { VOTING_ABI, VOTING_ADDRESS } from '../lib/contracts';
import { useElectionResults } from '../lib/hooks';

export default function ResultsPage() {
  const [selectedSession, setSelectedSession] = useState<string>('current');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Get current session ID
  const { data: currentSessionId } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'sessionId',
  });

  // Get election window
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

  // Determine which session to display
  const sessionIdToDisplay: bigint =
    selectedSession === 'current'
      ? (currentSessionId as bigint | undefined) || 0n
      : BigInt(selectedSession);

  // Fetch results with optional polling
  const { results, totalVotes, winner, refetch } = useElectionResults(
    sessionIdToDisplay,
    autoRefresh
  );

  // Check if election is active
  const isElectionActive = Boolean(
    startTime &&
      endTime &&
      (startTime as bigint) > 0n &&
      BigInt(Math.floor(Date.now() / 1000)) >= (startTime as bigint) &&
      BigInt(Math.floor(Date.now() / 1000)) <= (endTime as bigint)
  );

  // Manual refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Generate session options (last 10 sessions)
  const sessionOptions = Array.from(
    { length: Math.min(Number(currentSessionId || 0), 10) },
    (_, i) => Number(currentSessionId || 0) - i
  );

  const winnerCandidate = winner ? results.find((r) => r.id === winner.id) : null;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Election Results
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Session</InputLabel>
              <Select
                value={selectedSession}
                label="Session"
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                <MenuItem value="current">Current Session ({currentSessionId?.toString() || '0'})</MenuItem>
                {sessionOptions.map((session) => (
                  <MenuItem key={session} value={session.toString()}>
                    Session {session}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              }
              label="Auto-refresh (every 5s)"
            />
            {isElectionActive && (
              <Chip label="Election Active" color="success" size="small" sx={{ ml: 2 }} />
            )}
          </Grid>
        </Grid>

        {startTime && endTime && (startTime as bigint) > 0n ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Start: {new Date(Number(startTime as bigint) * 1000).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              End: {new Date(Number(endTime as bigint) * 1000).toLocaleString()}
            </Typography>
          </Box>
        ) : null}
      </Paper>

      {/* Winner Display */}
      {winnerCandidate && totalVotes > 0 && (
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmojiEventsIcon sx={{ fontSize: 48, mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div">
                  Winner: {winnerCandidate.name}
                </Typography>
                <Typography variant="body1">
                  {winner?.votes} votes ({winnerCandidate.percentage.toFixed(1)}%)
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2">
              Policy Positions: [{winnerCandidate.positions.join(', ')}]
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {totalVotes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Votes
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {results.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Candidates
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {sessionIdToDisplay.toString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Session ID
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Results Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Candidate</TableCell>
              <TableCell>Policy Positions</TableCell>
              <TableCell align="right">Votes</TableCell>
              <TableCell>Vote Share</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No votes recorded yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((candidate, index) => (
                <TableRow
                  key={candidate.id}
                  sx={{
                    backgroundColor: index === 0 && totalVotes > 0 ? 'action.hover' : 'inherit',
                  }}
                >
                  <TableCell>
                    {index === 0 && totalVotes > 0 ? (
                      <Chip
                        icon={<EmojiEventsIcon />}
                        label="1st"
                        color="warning"
                        size="small"
                      />
                    ) : (
                      `${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'normal'}>
                      {candidate.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {candidate.positions.map((pos, i) => (
                        <Chip key={i} label={pos} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'normal'}>
                      {candidate.votes}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={candidate.percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: index === 0 ? 'warning.main' : 'primary.main',
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 45 }}>
                        {candidate.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
