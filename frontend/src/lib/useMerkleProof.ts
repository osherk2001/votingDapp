import { useState, useEffect } from 'react';
import { keccak256, encodePacked } from 'viem';
import { MerkleTree } from 'merkletreejs';

interface MerkleProof {
  proof: `0x${string}`[];
  isWhitelisted: boolean;
}

export function useMerkleProof(address: `0x${string}` | undefined): MerkleProof {
  const [proof, setProof] = useState<`0x${string}`[]>([]);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  useEffect(() => {
    if (!address) {
      setProof([]);
      setIsWhitelisted(false);
      return;
    }

    // Load voters from localStorage (same as AdminVoters component)
    const saved = localStorage.getItem('voters');
    if (!saved) {
      setProof([]);
      setIsWhitelisted(false);
      return;
    }

    const voters: string[] = JSON.parse(saved);
    const normalizedAddress = address.toLowerCase();
    
    if (!voters.includes(normalizedAddress)) {
      setProof([]);
      setIsWhitelisted(false);
      return;
    }

    // Generate Merkle proof
    const leaves = voters.map((addr) =>
      keccak256(encodePacked(['address'], [addr as `0x${string}`]))
    );
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const leaf = keccak256(encodePacked(['address'], [normalizedAddress as `0x${string}`]));
    const merkleProof = tree.getProof(leaf).map((p) => ('0x' + p.data.toString('hex')) as `0x${string}`);

    setProof(merkleProof);
    setIsWhitelisted(true);
  }, [address]);

  return { proof, isWhitelisted };
}
