export interface Candidate {
    id: number;
    name: string;
    voteCount: number;
}

export interface Voting {
    candidates: Candidate[];
    totalVotes: number;
    hasEnded: boolean;
}

export interface VoteResponse {
    success: boolean;
    message: string;
}