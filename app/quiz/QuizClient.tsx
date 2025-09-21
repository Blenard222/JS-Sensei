'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { addPoints, beltFor } from '@/lib/points';
import { useToast } from '@/app/components/Toast';
import questions from '@/data/questions.json';

type QuizQuestion = {
  id: string;
  topic: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  hint: string;
  whyWrong: string;
};

export default function QuizClient() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'variables_types';
  const { push } = useToast();

  const [submitted, setSubmitted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [topicQuestions, setTopicQuestions] = useState<QuizQuestion[]>([]);
  const [key, setKey] = useState<number[]>([]);

  useEffect(() => {
    const filteredQuestions: QuizQuestion[] = questions
      .filter(q => q.topic === topic)
      .map(q => ({
        id: String(q.id),
        topic: q.topic,
        prompt: q.prompt,
        choices: q.choices,
        answerIndex: q.answerIndex,
        hint: q.hint,
        whyWrong: q.whyWrong
      }));

    setTopicQuestions(filteredQuestions);
    setKey(filteredQuestions.map(q => q.answerIndex));

    // Initialize selectedAnswers with -1 for each question
    setSelectedAnswers(new Array(filteredQuestions.length).fill(-1));

    // Read last scores from localStorage
    const storedMastery = localStorage.getItem('mastery');
    const lastScores = storedMastery 
      ? JSON.parse(storedMastery)[topic] || [] 
      : [];
    
    // Ensure lastScores is an array
    const safeLastScores = Array.isArray(lastScores) ? lastScores : [];
    
    // Update localStorage with safe last scores
    const updatedMastery = {
      ...(storedMastery ? JSON.parse(storedMastery) : {}),
      [topic]: safeLastScores
    };
    localStorage.setItem('mastery', JSON.stringify(updatedMastery));
  }, [topic]);

  const handleAnswerSelect = (questionIndex: number, choiceIndex: number) => {
    if (!submitted) {
      const newSelectedAnswers = [...selectedAnswers];
      newSelectedAnswers[questionIndex] = choiceIndex;
      setSelectedAnswers(newSelectedAnswers);
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    // Compute score
    const correctCount = selectedAnswers.reduce((acc, answer, index) => 
      answer === key[index] ? acc + 1 : acc, 0);
    const score = correctCount / topicQuestions.length;
    const percentScore = Math.round(score * 100);

    // Update localStorage with new score
    const storedMastery = JSON.parse(localStorage.getItem('mastery') || '{}');
    const updatedScores = [...(storedMastery[topic] || []), percentScore];
    storedMastery[topic] = updatedScores;
    localStorage.setItem('mastery', JSON.stringify(storedMastery));

    // Add points for quiz completion
    let pts = await addPoints(5);
    push({ title: 'Quiz completed', message: '+5 points' });

    // Perfect score bonus
    if (score === 1) {
      pts = await addPoints(10);
      push({ message: '+10 perfect bonus!' });
    }

    // Optional belt announcement
    push({ message: `Belt: ${beltFor(pts)}` });
  };

  const handleRetryMissed = () => {
    const missedQuestions = topicQuestions.filter((_, index) => 
      selectedAnswers[index] !== key[index]
    );
    
    // If no missed questions, do nothing
    if (missedQuestions.length === 0) return;

    // Reset state for missed questions
    setSubmitted(false);
    setSelectedAnswers(new Array(topicQuestions.length).fill(-1));
  };

  const correctCount = selectedAnswers.reduce((acc, answer, index) => 
    answer === key[index] ? acc + 1 : acc, 0);
  const percentScore = Math.round((correctCount / topicQuestions.length) * 100);

  return (
    <main className="container-narrow section-tight space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Quiz: {topic.replace('_', ' ')}</h1>
        {submitted && (
          <div className="text-gray-900">
            Score: {correctCount} / {topicQuestions.length} ({percentScore}%)
          </div>
        )}
      </header>
      <div className="divider-dojo" />

      <section className="card space-y-4">
        {topicQuestions.map((question, questionIndex) => (
          <div key={questionIndex} className="space-y-2">
            <p className="font-semibold text-gray-900">{question.prompt}</p>
            {question.choices.map((choice: string, choiceIndex: number) => (
              <button
                key={choiceIndex}
                onClick={() => handleAnswerSelect(questionIndex, choiceIndex)}
                className={`btn w-full text-left ${
                  submitted
                    ? choiceIndex === key[questionIndex]
                      ? 'btn-primary'
                      : choiceIndex === selectedAnswers[questionIndex]
                      ? 'btn-ghost text-red-600'
                      : 'btn-ghost'
                    : 'btn-ghost'
                }`}
                disabled={submitted}
              >
                {choice}
              </button>
            ))}
            {submitted && selectedAnswers[questionIndex] !== key[questionIndex] && (
              <p className="text-sm text-gray-600 mt-1">{question.hint}</p>
            )}
          </div>
        ))}

        {!submitted ? (
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary w-full"
            disabled={selectedAnswers.some(answer => answer === -1)}
          >
            Submit Quiz
          </button>
        ) : (
          <div className="flex gap-3 justify-center">
            <button 
              onClick={handleRetryMissed} 
              className="btn btn-ghost"
              disabled={topicQuestions.every((_, index) => selectedAnswers[index] === key[index])}
            >
              Retry Missed
            </button>
            <Link
              href={`/learn?topic=${topic}`}
              className="btn btn-ghost"
            >
              Back to Learn
            </Link>
            <Link
              href={`/flashcards?topic=${topic}`}
              className="btn btn-ghost"
            >
              Use Flashcards
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
