import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import PsychologyIcon from '@mui/icons-material/Psychology';
import type { Candidate, AutoMatchResult } from '../types';
import CandidateCard from './CandidateCard';

interface AutoMatchProps {
  candidates: Candidate[];
  onVote: (candidateId: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function AutoMatch({ candidates, onVote, isLoading, disabled }: AutoMatchProps) {
  const [position1, setPosition1] = useState(50);
  const [position2, setPosition2] = useState(50);
  const [position3, setPosition3] = useState(50);
  const [matches, setMatches] = useState<AutoMatchResult[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  const calculateMatches = () => {
    if (candidates.length === 0) return;

    const voterPositions: [number, number, number] = [position1, position2, position3];

    const results: AutoMatchResult[] = candidates.map((candidate) => {
      // Calculate distance using Euclidean distance in 3D space
      const diff1 = voterPositions[0] - candidate.positions[0];
      const diff2 = voterPositions[1] - candidate.positions[1];
      const diff3 = voterPositions[2] - candidate.positions[2];

      const distance = Math.sqrt(diff1 ** 2 + diff2 ** 2 + diff3 ** 2);
      const maxDistance = Math.sqrt(3 * 100 ** 2); // Maximum possible distance
      const matchScore = Math.round(100 * (1 - distance / maxDistance));

      return {
        candidateId: candidate.id,
        name: candidate.name,
        matchScore,
        positions: candidate.positions,
      };
    });

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);
    setMatches(results);
    setHasCalculated(true);
  };

  const handleReset = () => {
    setPosition1(50);
    setPosition2(50);
    setPosition3(50);
    setMatches([]);
    setHasCalculated(false);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">AI-Powered Candidate Matching</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Answer these questions to find your ideal candidate using our AI matching algorithm.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography gutterBottom>
              <strong>1. Economy:</strong> What is your stance on economic policies?
            </Typography>
            <Slider
              value={position1}
              onChange={(_, v) => setPosition1(v as number)}
              min={0}
              max={100}
              marks={[
                { value: 0, label: 'Left (0)' },
                { value: 50, label: 'Center (50)' },
                { value: 100, label: 'Right (100)' },
              ]}
              valueLabelDisplay="on"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>
              <strong>2. Environment:</strong> How important is environmental protection?
            </Typography>
            <Slider
              value={position2}
              onChange={(_, v) => setPosition2(v as number)}
              min={0}
              max={100}
              marks={[
                { value: 0, label: 'Left (0)' },
                { value: 50, label: 'Center (50)' },
                { value: 100, label: 'Right (100)' },
              ]}
              valueLabelDisplay="on"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>
              <strong>3. Healthcare:</strong> What is your preferred healthcare system?
            </Typography>
            <Slider
              value={position3}
              onChange={(_, v) => setPosition3(v as number)}
              min={0}
              max={100}
              marks={[
                { value: 0, label: 'Left (0)' },
                { value: 50, label: 'Center (50)' },
                { value: 100, label: 'Right (100)' },
              ]}
              valueLabelDisplay="on"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="contained" onClick={calculateMatches} disabled={candidates.length === 0}>
            Calculate Matches
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Paper>

      {hasCalculated && matches.length > 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Based on your answers, here are your top candidate matches:
          </Alert>

          <Grid container spacing={3}>
            {matches.map((match) => {
              const candidate = candidates.find((c) => c.id === match.candidateId);
              if (!candidate) return null;

              return (
                <Grid item xs={12} md={6} key={candidate.id}>
                  <CandidateCard
                    candidate={candidate}
                    onVote={onVote}
                    disabled={disabled}
                    isLoading={isLoading}
                    matchScore={match.matchScore}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {hasCalculated && matches.length === 0 && (
        <Alert severity="warning">No candidates available for matching.</Alert>
      )}
    </Box>
  );
}
