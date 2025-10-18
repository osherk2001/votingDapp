import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import { useAccount } from 'wagmi';
import AdminCandidates from '../components/AdminCandidates';
import AdminVoters from '../components/AdminVoters';
import AdminElection from '../components/AdminElection';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const { isConnected } = useAccount();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };


    const [error, setError] = useState<string | null>(null);

    // Error boundary wrapper
    try {
      if (!isConnected) {
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Admin Dashboard
            </Typography>
            <Alert severity="warning" sx={{ mt: 3 }}>
              Please connect your wallet to access the admin panel.
            </Alert>
          </Box>
        );
      }

      return (
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Candidates" />
              <Tab label="Voters" />
              <Tab label="Election" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <AdminCandidates />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <AdminVoters />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <AdminElection />
          </TabPanel>
        </Box>
      );
    } catch (e) {
      return (
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Alert severity="error" sx={{ mt: 3 }}>
            Error loading admin page: {String(e)}
          </Alert>
          <Paper sx={{ mt: 2, p: 2, background: '#f9f9f9' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Debug Info:</strong><br />
              tabValue: {String(tabValue)}<br />
              isConnected: {String(isConnected)}
            </Typography>
          </Paper>
        </Box>
      );
    }
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Candidates" />
          <Tab label="Voters" />
          <Tab label="Election" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AdminCandidates />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AdminVoters />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <AdminElection />
      </TabPanel>
    </Box>
  );
}
