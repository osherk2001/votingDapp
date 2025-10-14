import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';
import { useVotingContract, useCandidates } from '../lib/hooks';

export default function AdminCandidates() {
  const { addCandidate, isPending, isConfirming, isSuccess, error } = useVotingContract();
  const candidates = useCandidates();

  const [name, setName] = useState('');
  const [position1, setPosition1] = useState(50);
  const [position2, setPosition2] = useState(50);
  const [position3, setPosition3] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCandidate(name, [position1, position2, position3]);
  };

  const handleReset = () => {
    setName('');
    setPosition1(50);
    setPosition2(50);
    setPosition3(50);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Candidate Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Candidate
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Candidate Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Issue 1: Economy (0-100)</Typography>
              <Slider
                value={position1}
                onChange={(_, v) => setPosition1(v as number)}
                min={0}
                max={100}
                marks={[
                  { value: 0, label: 'Left' },
                  { value: 50, label: 'Center' },
                  { value: 100, label: 'Right' },
                ]}
                valueLabelDisplay="on"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Issue 2: Environment (0-100)</Typography>
              <Slider
                value={position2}
                onChange={(_, v) => setPosition2(v as number)}
                min={0}
                max={100}
                marks={[
                  { value: 0, label: 'Left' },
                  { value: 50, label: 'Center' },
                  { value: 100, label: 'Right' },
                ]}
                valueLabelDisplay="on"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Issue 3: Healthcare (0-100)</Typography>
              <Slider
                value={position3}
                onChange={(_, v) => setPosition3(v as number)}
                min={0}
                max={100}
                marks={[
                  { value: 0, label: 'Left' },
                  { value: 50, label: 'Center' },
                  { value: 100, label: 'Right' },
                ]}
                valueLabelDisplay="on"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button type="submit" variant="contained" disabled={isPending || isConfirming || !name}>
              {isPending || isConfirming ? <CircularProgress size={24} /> : 'Add Candidate'}
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {error.message}
          </Alert>
        )}
        {isSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Candidate added successfully!
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Candidates ({candidates.length})
        </Typography>
        {candidates.length === 0 ? (
          <Typography color="text.secondary">No candidates added yet.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Economy</TableCell>
                  <TableCell align="center">Environment</TableCell>
                  <TableCell align="center">Healthcare</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>{candidate.id}</TableCell>
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell align="center">{candidate.positions[0]}</TableCell>
                    <TableCell align="center">{candidate.positions[1]}</TableCell>
                    <TableCell align="center">{candidate.positions[2]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
