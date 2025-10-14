import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useState } from 'react';
import { useCandidates } from '../lib/hooks';
import CandidateCard from './CandidateCard';
import AutoMatch from './AutoMatch';

interface VotingPanelProps {
  onVote: (candidateId: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
  hasVoted?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voting-tabpanel-${index}`}
      aria-labelledby={`voting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function VotingPanel({ onVote, isLoading, disabled, hasVoted }: VotingPanelProps) {
  const [tabValue, setTabValue] = useState(0);
  const candidates = useCandidates();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (hasVoted) {
    return (
      <Alert severity="success" sx={{ mb: 3 }}>
        ✅ You have already voted in this election. Thank you for participating!
      </Alert>
    );
  }

  if (candidates.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading candidates...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Manual Voting" />
            <Tab label="AI-Powered Match" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Browse All Candidates
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Review each candidate's positions and vote for your preferred choice.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              {candidates.map((candidate) => (
                <Grid item xs={12} md={6} lg={4} key={candidate.id}>
                  <CandidateCard
                    candidate={candidate}
                    onVote={onVote}
                    disabled={disabled}
                    isLoading={isLoading}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <AutoMatch
              candidates={candidates}
              onVote={onVote}
              isLoading={isLoading}
              disabled={disabled}
            />
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
