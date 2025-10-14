import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useVotingContract } from '../lib/hooks';
import { keccak256, encodePacked } from 'viem';
import { MerkleTree } from 'merkletreejs';

export default function AdminVoters() {
  const { setVoterRoot, useVoterRoot, isPending, isConfirming, isSuccess, error } =
    useVotingContract();
  const { data: currentRoot } = useVoterRoot();

  const [voters, setVoters] = useState<string[]>([]);
  const [newVoter, setNewVoter] = useState('');
  const [generatedRoot, setGeneratedRoot] = useState<string>('');

  useEffect(() => {
    // Load voters from localStorage
    const saved = localStorage.getItem('voters');
    if (saved) {
      setVoters(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save voters to localStorage
    localStorage.setItem('voters', JSON.stringify(voters));
    // Regenerate Merkle root
    if (voters.length > 0) {
      const leaves = voters.map((addr) =>
        keccak256(encodePacked(['address'], [addr.toLowerCase() as `0x${string}`]))
      );
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      setGeneratedRoot(tree.getRoot().toString('hex'));
    } else {
      setGeneratedRoot('');
    }
  }, [voters]);

  const handleAddVoter = () => {
    const addr = newVoter.trim();
    if (!addr) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      alert('Invalid Ethereum address');
      return;
    }
    if (voters.includes(addr.toLowerCase())) {
      alert('Address already in whitelist');
      return;
    }
    setVoters([...voters, addr.toLowerCase()]);
    setNewVoter('');
  };

  const handleRemoveVoter = (address: string) => {
    setVoters(voters.filter((v) => v !== address));
  };

  const handleSetRoot = () => {
    if (!generatedRoot) return;
    setVoterRoot(('0x' + generatedRoot) as `0x${string}`);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Voter Whitelist Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Voter Address
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Ethereum Address"
            value={newVoter}
            onChange={(e) => setNewVoter(e.target.value)}
            placeholder="0x..."
          />
          <Button variant="contained" onClick={handleAddVoter} sx={{ minWidth: 120 }}>
            Add
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Whitelist ({voters.length} addresses)
        </Typography>
        {voters.length === 0 ? (
          <Typography color="text.secondary">No voters added yet.</Typography>
        ) : (
          <List>
            {voters.map((voter) => (
              <ListItem
                key={voter}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemoveVoter(voter)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={voter} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {generatedRoot && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Merkle Root
          </Typography>
          <TextField
            fullWidth
            value={'0x' + generatedRoot}
            InputProps={{ readOnly: true }}
            margin="normal"
            multiline
            rows={2}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current on-chain root: {currentRoot ? currentRoot.toString() : 'Not set'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleSetRoot}
            disabled={isPending || isConfirming}
            sx={{ mt: 2 }}
          >
            {isPending || isConfirming ? <CircularProgress size={24} /> : 'Set Voter Root'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error: {error.message}
            </Alert>
          )}
          {isSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Voter root updated successfully!
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
}
