export function masteryAverage(lastScores: number[], window = 3): number {
  // If no scores, return 0
  if (lastScores.length === 0) return 0;

  // Take the last N scores (default 3)
  const scoresToAverage = lastScores.slice(-window);

  // Calculate average
  return scoresToAverage.reduce((sum, score) => sum + score, 0) / scoresToAverage.length;
}

export function isMastered(
  lastScores: number[], 
  threshold = 0.85, 
  window = 3
): boolean {
  // If no scores, not mastered
  if (lastScores.length === 0) return false;

  // Calculate mastery average
  const average = masteryAverage(lastScores, window);

  // Check if average meets or exceeds threshold
  return average >= threshold;
}
