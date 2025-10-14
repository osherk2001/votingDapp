import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import type { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  onVote: (candidateId: number) => void;
  disabled?: boolean;
  isLoading?: boolean;
  matchScore?: number;
}

export default function CandidateCard({
  candidate,
  onVote,
  disabled = false,
  isLoading = false,
  matchScore,
}: CandidateCardProps) {
  const getPositionLabel = (value: number): string => {
    if (value < 33) return 'Left';
    if (value < 67) return 'Center';
    return 'Right';
  };

  const getPositionColor = (value: number): 'primary' | 'secondary' | 'default' => {
    if (value < 33) return 'primary';
    if (value < 67) return 'default';
    return 'secondary';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            {candidate.name}
          </Typography>
          {matchScore !== undefined && (
            <Chip
              label={`${matchScore}% Match`}
              color={matchScore >= 70 ? 'success' : matchScore >= 50 ? 'warning' : 'default'}
              size="small"
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Candidate #{candidate.id}
        </Typography>

        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Economy:</Typography>
              <Chip
                label={`${getPositionLabel(candidate.positions[0])} (${candidate.positions[0]})`}
                color={getPositionColor(candidate.positions[0])}
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Environment:</Typography>
              <Chip
                label={`${getPositionLabel(candidate.positions[1])} (${candidate.positions[1]})`}
                color={getPositionColor(candidate.positions[1])}
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Healthcare:</Typography>
              <Chip
                label={`${getPositionLabel(candidate.positions[2])} (${candidate.positions[2]})`}
                color={getPositionColor(candidate.positions[2])}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onVote(candidate.id)}
          disabled={disabled || isLoading}
        >
          {isLoading ? 'Voting...' : 'Vote for this Candidate'}
        </Button>
      </CardActions>
    </Card>
  );
}
