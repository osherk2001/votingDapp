export interface Candidate {
  id: number;
  name: string;
  positions: [number, number, number];
}

export interface ElectionInfo {
  sessionId: bigint;
  startTime: bigint;
  endTime: bigint;
  isActive: boolean;
}

export interface VoterPosition {
  issue1: number;
  issue2: number;
  issue3: number;
}

export interface AutoMatchResult {
  candidateId: number;
  name: string;
  matchScore: number;
  positions: [number, number, number];
}
