export function scoreQuiz(answers: number[], key: number[]): number {
  // If lengths differ, return 0
  if (answers.length !== key.length) return 0;

  // Count correct answers
  const correctCount = answers.reduce((count, answer, index) => 
    answer === key[index] ? count + 1 : count, 0);

  // Return the score as a fraction of correct answers
  return correctCount / key.length;
}
