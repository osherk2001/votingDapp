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

    const normalizedAddress = address.toLowerCase();

    // Prefer server-generated proofs to avoid client/server merkle mismatches
    fetch('/data/merkle-proofs.json')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { root: `0x${string}`; voters: { address: string; proof: `0x${string}`[] }[] }) => {
        const entry = data.voters.find((v) => v.address.toLowerCase() === normalizedAddress);
        if (entry && entry.proof?.length) {
          setProof(entry.proof);
          setIsWhitelisted(true);
          return;
        }
        // Fallback to computing a proof locally from whitelist
        return fetch('/data/whitelist.json')
          .then((res) => res.json())
          .then((voters: string[]) => {
            const lower = voters.map((v) => v.toLowerCase());
            if (!lower.includes(normalizedAddress)) {
              setProof([]);
              setIsWhitelisted(false);
              return;
            }
            const leaves = lower.map((addr) => keccak256(encodePacked(['address'], [addr as `0x${string}`])));
            const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
            const leaf = keccak256(encodePacked(['address'], [normalizedAddress as `0x${string}`]));
            const merkleProof = tree.getProof(leaf).map((p) => ('0x' + p.data.toString('hex')) as `0x${string}`);
            setProof(merkleProof);
            setIsWhitelisted(true);
          });
      })
      .catch(() => {
        // As a final fallback, try local whitelist
        fetch('/data/whitelist.json')
          .then((res) => res.json())
          .then((voters: string[]) => {
            const lower = voters.map((v) => v.toLowerCase());
            if (!lower.includes(normalizedAddress)) {
              setProof([]);
              setIsWhitelisted(false);
              return;
            }
            const leaves = lower.map((addr) => keccak256(encodePacked(['address'], [addr as `0x${string}`])));
            const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
            const leaf = keccak256(encodePacked(['address'], [normalizedAddress as `0x${string}`]));
            const merkleProof = tree.getProof(leaf).map((p) => ('0x' + p.data.toString('hex')) as `0x${string}`);
            setProof(merkleProof);
            setIsWhitelisted(true);
          })
          .catch(() => {
            setProof([]);
            setIsWhitelisted(false);
          });
      });
  }, [address]);

  return { proof, isWhitelisted };
}
