/** Deterministic hash for pseudo-random tie-breaks (same input → same output). */
export function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function hashToUnit(input: string): number {
  return (stableHash(input) % 10000) / 10000;
}
