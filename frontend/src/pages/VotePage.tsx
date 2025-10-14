import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function VotePage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cast Your Vote
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Voting interface will be implemented in Phase 8
        </Typography>
      </Paper>
    </Box>
  );
}
