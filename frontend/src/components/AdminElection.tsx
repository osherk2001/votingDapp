import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useVotingContract } from '../lib/hooks';
import { useReadContract } from 'wagmi';
import { VOTING_ABI, VOTING_ADDRESS } from '../lib/contracts';

export default function AdminElection() {
  const { startElection, isPending, isConfirming, isSuccess, error } = useVotingContract();

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

  const [sessionId, setSessionId] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ); // Default 7 days

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !startTime || !endTime) return;

    const startTimestamp = BigInt(Math.floor(startTime.getTime() / 1000));
    const endTimestamp = BigInt(Math.floor(endTime.getTime() / 1000));

    startElection(BigInt(sessionId), startTimestamp, endTimestamp);
  };

  const isElectionActive =
    electionWindow &&
    (electionWindow as [bigint, bigint])[0] > 0 &&
    BigInt(Math.floor(Date.now() / 1000)) >= (electionWindow as [bigint, bigint])[0] &&
    BigInt(Math.floor(Date.now() / 1000)) <= (electionWindow as [bigint, bigint])[1];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Election Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Session ID"
              value={currentSessionId?.toString() || '0'}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Election Status"
              value={isElectionActive ? 'Active' : 'Inactive'}
              InputProps={{ readOnly: true }}
              color={isElectionActive ? 'success' : 'warning'}
            />
          </Grid>
        </Grid>

        {electionWindow && (electionWindow as [bigint, bigint])[0] > 0n ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Start Time:{' '}
              {new Date(Number((electionWindow as [bigint, bigint])[0]) * 1000).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              End Time:{' '}
              {new Date(Number((electionWindow as [bigint, bigint])[1]) * 1000).toLocaleString()}
            </Typography>
          </Box>
        ) : null}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Start New Election
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Session ID"
              type="number"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              margin="normal"
              required
              helperText="Use incremental IDs (e.g., 1, 2, 3...)"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Time"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              disabled={isPending || isConfirming || !sessionId || !startTime || !endTime}
              sx={{ mt: 3 }}
            >
              {isPending || isConfirming ? <CircularProgress size={24} /> : 'Start Election'}
            </Button>
          </form>
        </LocalizationProvider>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {error.message}
          </Alert>
        )}
        {isSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Election started successfully!
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
