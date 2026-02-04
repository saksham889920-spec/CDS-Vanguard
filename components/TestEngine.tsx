
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, UserResponse, Subject, Topic, SectionType } from '../types';

interface TestEngineProps {
  questions: Question[];
  subject: Subject;
  topic: Topic;
  onFinish: (responses: UserResponse[]) => void;
}

const TestEngine: React.FC<TestEngineProps> = ({ questions, subject, topic, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});
  
  // English & GK: 45s per question. Maths: 120s per question.
  const getInitialTime = useCallback(() => {
    return subject.section === SectionType.MATHEMATICS ? 120 : 45;
  }, [subject.section]);

  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const finalResponses: UserResponse[] = questions.map((q) => {
      const selected = selectedOptions[q.id];
      return {
        questionId: q.id,
        selectedOption: selected !== undefined ? selected : null,
        isCorrect: selected === q.correctAnswer
      };
    });
    onFinish(finalResponses);
  }, [questions, selectedOptions, onFinish]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(getInitialTime()); // Reset timer for new question
    } else {
      handleFinish();
    }
  }, [currentIndex, questions.length, getInitialTime, handleFinish]);

  // Main per-question timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      nextQuestion();
      return;
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, nextQuestion]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    setSelectedOptions(prev => ({ ...prev, [currentQuestion.id]: index }));
  };

  const handleManualNext = () => {
    if (currentIndex < questions.length - 1) {
      nextQuestion();
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Note: We typically don't reset timer when going back in per-question model
      // but to be fair to the user, we'll reset it to allow re-evaluation
      setTimeLeft(getInitialTime());
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-100 flex justify-between items-center sticky top-4 z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{subject.name}</h2>
          <p className="text-sm text-slate-500 font-medium">{topic.name} • {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Time Remaining</span>
          <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${timeLeft < 10 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-700'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-100 min-h-[400px] flex flex-col">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
              Question {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-slate-400 italic">
              {subject.section === SectionType.MATHEMATICS ? '120s limit' : '45s limit'}
            </span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed mb-8 whitespace-pre-wrap">
            {currentQuestion.text}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group
                  ${selectedOptions[currentQuestion.id] === idx 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md translate-x-1' 
                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors
                  ${selectedOptions[currentQuestion.id] === idx 
                    ? 'border-indigo-600 bg-indigo-600 text-white' 
                    : 'border-slate-300 group-hover:border-indigo-400'}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={`text-lg ${selectedOptions[currentQuestion.id] === idx ? 'text-indigo-900 font-semibold' : 'text-slate-700'}`}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center ${currentIndex === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            ← Previous
          </button>
          
          <button
            onClick={handleManualNext}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all flex items-center"
          >
            {currentIndex === questions.length - 1 ? 'Review & Submit' : 'Next Question →'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to submit?</h3>
            <p className="text-slate-600 mb-6">You have answered {Object.keys(selectedOptions).length} out of {questions.length} questions. Are you sure you want to finish the test?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button 
                onClick={handleFinish}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestEngine;
