import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to BAL Voting DApp
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" paragraph>
        Decentralized voting platform with AI-powered candidate matching
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, mt: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Paper sx={{ p: 3, maxWidth: 300, textAlign: 'center' }}>
          <HowToVoteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Cast Your Vote
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Vote manually or use AI-powered matching to find your ideal candidate
          </Typography>
          <Button variant="contained" fullWidth onClick={() => navigate('/vote')}>
            Go to Voting
          </Button>
        </Paper>

        <Paper sx={{ p: 3, maxWidth: 300, textAlign: 'center' }}>
          <LeaderboardIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            View Results
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            See live election results and candidate rankings
          </Typography>
          <Button variant="contained" fullWidth onClick={() => navigate('/results')}>
            View Results
          </Button>
        </Paper>

        <Paper sx={{ p: 3, maxWidth: 300, textAlign: 'center' }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage candidates, voters, and election settings
          </Typography>
          <Button variant="outlined" fullWidth onClick={() => navigate('/admin')}>
            Admin Dashboard
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
