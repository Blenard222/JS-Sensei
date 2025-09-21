'use client';

import { useState } from 'react';
import Link from 'next/link';
import questions from '@/data/questions.json';
import { addPoints, beltFor, getPoints } from '@/lib/points';
import { useToast } from '@/app/components/Toast';

export default function Diagnostic() {
  const { push } = useToast();

  // Select one question from each topic
  const diagnosticQuestions = [
    questions.find(q => q.topic === 'variables_types'),
    questions.find(q => q.topic === 'arrays_objects'),
    questions.find(q => q.topic === 'loops_conditionals')
  ].filter(Boolean) as typeof questions;

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(diagnosticQuestions.length).fill(-1)
  );
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionIndex: number, choiceIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = choiceIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateTopicScores = () => {
    const topicScores: Record<string, number> = {
      'variables_types': 0,
      'arrays_objects': 0,
      'loops_conditionals': 0
    };

    diagnosticQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answerIndex) {
        topicScores[question.topic] += 1;
      }
    });

    return topicScores;
  };

  const findWeakestTopic = () => {
    const topicScores = calculateTopicScores();
    const sortedTopics = Object.entries(topicScores)
      .sort((a, b) => a[1] - b[1]);
    
    return {
      weakest: sortedTopics[0][0],
      strongest: sortedTopics[2][0]
    };
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    // Add points for diagnostic
    const pts = await addPoints(10);
    push({ title: 'Nice!', message: '+10 points' });

    // Check for belt change
    const prevBelt = beltFor(getPoints() - 10);
    const newBelt = beltFor(pts);
    
    if (prevBelt !== newBelt) {
      push({ 
        title: 'Belt Upgrade!', 
        message: `You've reached the ${newBelt} belt!` 
      });
    }
  };

  const isSubmitDisabled = selectedAnswers.some(answer => answer === -1);

  const { weakest, strongest } = submitted ? findWeakestTopic() : { weakest: '', strongest: '' };

  return (
    <main className="container-narrow section-tight space-y-4">
      <h1 className="text-2xl font-bold text-center text-gray-900">Quick diagnostic (3 questions)</h1>

      <section className="card space-y-4">
        {diagnosticQuestions.map((question, questionIndex) => (
          <div key={question.id} className="space-y-4">
            <p className="font-semibold text-gray-900">{question.prompt}</p>
            <div className="space-y-2">
              {question.choices.map((choice, choiceIndex) => (
                <label 
                  key={choiceIndex} 
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input 
                    type="radio" 
                    name={`question-${questionIndex}`}
                    className="input-radio"
                    checked={selectedAnswers[questionIndex] === choiceIndex}
                    onChange={() => handleAnswerChange(questionIndex, choiceIndex)}
                    disabled={submitted}
                  />
                  <span className="text-gray-900">{choice}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      {!submitted ? (
        <div className="text-center">
          <button 
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isSubmitDisabled}
          >
            Submit
          </button>
        </div>
      ) : (
        <section className="card space-y-4 text-center">
<p className="text-gray-900">
  {"You're strongest in "}{strongest.replace('_', ' ')}{"; let's focus on "}{weakest.replace('_', ' ')}.
</p>


          <Link 
            href={`/learn?topic=${weakest}`} 
            className="btn btn-primary"
          >
            Go to learn
          </Link>
        </section>
      )}
    </main>
  );
}
