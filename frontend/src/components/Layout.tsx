import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🗳️ BAL Voting DApp
          </Typography>
          
          <Tabs value={location.pathname} onChange={handleTabChange} textColor="inherit" sx={{ mr: 2 }}>
            <Tab label="Home" value="/" />
            <Tab label="Vote" value="/vote" />
            <Tab label="Results" value="/results" />
            <Tab label="Admin" value="/admin" />
          </Tabs>

          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Typography>
              <Button color="inherit" variant="outlined" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </Box>
          ) : (
            <Button color="inherit" variant="outlined" onClick={handleConnect}>
              Connect Wallet
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
