export type Q = { id: number; topic: string };

export function nextQuestion(candidates: Q[], masteredIds: Set<number>): Q | null {
  // Find the first candidate not in masteredIds
  const nextQ = candidates.find(candidate => !masteredIds.has(candidate.id));

  // Return the first non-mastered question, or null if all are mastered
  return nextQ || null;
}
