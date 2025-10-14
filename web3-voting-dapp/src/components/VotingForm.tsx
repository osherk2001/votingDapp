import React, { useState } from 'react';

const VotingForm: React.FC<{ onVote: (candidate: string) => void }> = ({ onVote }) => {
    const [candidate, setCandidate] = useState('');

    const handleVote = (event: React.FormEvent) => {
        event.preventDefault();
        if (candidate) {
            onVote(candidate);
            setCandidate('');
        }
    };

    return (
        <form onSubmit={handleVote}>
            <label>
                Vote for Candidate:
                <input
                    type="text"
                    value={candidate}
                    onChange={(e) => setCandidate(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Vote</button>
        </form>
    );
};

export default VotingForm;