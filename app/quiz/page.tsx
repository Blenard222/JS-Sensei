'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import questions from '@/data/questions.json';
import { addPoints, beltFor, getPoints } from '@/lib/points';
import { useToast } from '@/app/components/Toast';

export default function QuizPage() {
  const { push } = useToast();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'variables_types';

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [lastScores, setLastScores] = useState<number[]>([]);

  // Defensive initialization of lastScores
  useEffect(() => {
    try {
      const storedMastery = localStorage.getItem('mastery');
      const parsedMastery = storedMastery ? JSON.parse(storedMastery) : {};
      const topicScores = parsedMastery[topic];
      
      // Ensure topicScores is an array, otherwise default to empty array
      setLastScores(Array.isArray(topicScores) ? topicScores : []);
    } catch {
      setLastScores([]);
    }
  }, [topic]);

  // Filter questions for the current topic
  const topicQuestions = questions.filter(q => q.topic === topic);
  const key = topicQuestions.map(q => q.answerIndex);

  const handleAnswerSelect = (questionIndex: number, choiceIndex: number) => {
    if (submitted) return;

    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = choiceIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    // Calculate score and update localStorage
    const correctCount = selectedAnswers.filter((answer, index) => answer === key[index]).length;
    const score = correctCount / topicQuestions.length;

    try {
      const storedMastery = localStorage.getItem('mastery');
      const parsedMastery = storedMastery ? JSON.parse(storedMastery) : {};
      
      // Store the new score for this topic
      parsedMastery[topic] = selectedAnswers;
      localStorage.setItem('mastery', JSON.stringify(parsedMastery));

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
    } catch {
      console.error('Failed to update mastery in localStorage');
    }
  };

  const handleRetryMissed = () => {
    const missedIndices = selectedAnswers.reduce((acc, answer, index) => {
      if (answer !== key[index]) acc.push(index);
      return acc;
    }, [] as number[]);

    const missedQuestions = missedIndices.map(index => topicQuestions[index]);
    
    // Reset state for missed questions
    setSelectedAnswers(new Array(missedQuestions.length).fill(-1));
    setSubmitted(false);
  };

  const correctCount = submitted ? selectedAnswers.filter((answer, index) => answer === key[index]).length : 0;
  const percentScore = submitted ? Math.round((correctCount / topicQuestions.length) * 100) : 0;

  // Check mastery
  // const isMasteryAchieved = isMastered(lastScores); // This line was removed as per the new_code

  // Determine which questions were wrong
  const wrongQuestions = submitted 
    ? topicQuestions.filter((_, index) => selectedAnswers[index] !== key[index])
    : [];

  const isSubmitDisabled = selectedAnswers.some(answer => answer === -1);

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
          <div key={question.id} className="space-y-2">
            <label className="text-gray-900 font-semibold">{question.prompt}</label>
            <div className="grid grid-cols-2 gap-3">
              {question.choices.map((choice, choiceIndex) => (
                <button
                  key={choiceIndex}
                  className={`btn w-full ${
                    submitted
                      ? choiceIndex === key[questionIndex]
                        ? 'btn-primary'
                        : selectedAnswers[questionIndex] === choiceIndex
                        ? 'btn-ghost text-red-600'
                        : 'btn-ghost opacity-50'
                      : selectedAnswers[questionIndex] === choiceIndex
                      ? 'btn-primary'
                      : 'btn-ghost'
                  }`}
                  onClick={() => handleAnswerSelect(questionIndex, choiceIndex)}
                  disabled={submitted}
                >
                  {choice}
                </button>
              ))}
              {submitted && selectedAnswers[questionIndex] !== key[questionIndex] && (
                <p className="text-sm text-gray-600 mt-1">{question.hint}</p>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-3 justify-center">
          {!submitted ? (
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={selectedAnswers.some(answer => answer === undefined)}
            >
              Submit
            </button>
          ) : (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedAnswers(new Array(topicQuestions.length).fill(-1));
                  setSubmitted(false);
                }}
              >
                Retry All
              </button>
              {selectedAnswers.some((answer, index) => answer !== key[index]) && (
                <button 
                  className="btn btn-ghost"
                  onClick={handleRetryMissed}
                >
                  Retry Missed
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <div className="text-center flex justify-center gap-3">
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
    </main>
  );
}
