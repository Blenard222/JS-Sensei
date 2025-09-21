import { describe, it, expect } from 'vitest';
import { scoreQuiz } from '../lib/score';
import { masteryAverage, isMastered } from '../lib/mastery';
import { nextQuestion, Q } from '../lib/nextQuestion';

describe('scoreQuiz', () => {
  it('returns 0 for mismatched answer and key lengths', () => {
    expect(scoreQuiz([1], [1, 2])).toBe(0);
  });

  it('calculates correct score for perfect quiz', () => {
    expect(scoreQuiz([0, 1, 2], [0, 1, 2])).toBe(1);
  });

  it('calculates correct score for partial quiz', () => {
    expect(scoreQuiz([0, 1, 3], [0, 1, 2])).toBe(2/3);
  });

  it('returns 0 for completely incorrect quiz', () => {
    expect(scoreQuiz([3, 3, 3], [0, 1, 2])).toBe(0);
  });
});

describe('masteryAverage', () => {
  it('returns 0 for empty scores', () => {
    expect(masteryAverage([])).toBe(0);
  });

  it('calculates average of last 3 scores by default', () => {
    expect(masteryAverage([0.5, 0.6, 0.7, 0.8])).toBeCloseTo(0.7, 10);
  });

  it('calculates average with custom window', () => {
    expect(masteryAverage([0.5, 0.6, 0.7, 0.8], 2)).toBe(0.75);
  });
});

describe('isMastered', () => {
  it('returns false for empty scores', () => {
    expect(isMastered([])).toBe(false);
  });

  it('returns false for mastery below 0.85', () => {
    expect(isMastered([0.8, 0.7, 0.6])).toBe(false);
  });

  it('returns true for mastery at 0.85', () => {
    expect(isMastered([0.85, 0.85, 0.85])).toBe(true);
  });

  it('returns true for mastery above 0.85', () => {
    expect(isMastered([0.9, 0.9, 0.9])).toBe(true);
  });

  it('uses custom threshold', () => {
    expect(isMastered([0.8, 0.8, 0.8], 0.8)).toBe(true);
  });
});

describe('nextQuestion', () => {
  const candidates: Q[] = [
    { id: 1, topic: 'variables_types' },
    { id: 2, topic: 'arrays_objects' },
    { id: 3, topic: 'loops_conditionals' }
  ];

  it('returns first non-mastered question', () => {
    const masteredIds = new Set([2, 3]);
    expect(nextQuestion(candidates, masteredIds)).toEqual({ id: 1, topic: 'variables_types' });
  });

  it('returns null if all questions are mastered', () => {
    const masteredIds = new Set([1, 2, 3]);
    expect(nextQuestion(candidates, masteredIds)).toBeNull();
  });
});
