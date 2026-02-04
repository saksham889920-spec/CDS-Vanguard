
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, UserResponse, Subject, Topic, SectionType } from '../types';

interface TestEngineProps {
  questions: Question[];
  subject: Subject;
  topic: Topic;
  isKeyLoading: boolean;
  onFinish: (responses: UserResponse[]) => void;
}

const TestEngine: React.FC<TestEngineProps> = ({ questions, subject, topic, isKeyLoading, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});
  
  // Tactical Elimination State: Map of QuestionID -> Array of eliminated option indices
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, number[]>>({});
  
  const getInitialTime = useCallback(() => {
    // Reading Comprehension needs more time for passage reading, but still requires speed.
    // 90 seconds (1.5 mins) is the sweet spot.
    if (topic.id === 'reading-comprehension') return 90;
    
    // Mathematics requires calculation time.
    if (subject.section === SectionType.MATHEMATICS) return 120;
    
    // Standard GK/English questions are rapid fire.
    return 45;
  }, [subject.section, topic.id]);

  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const timerRef = useRef<any>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = useCallback(() => {
    if (isKeyLoading) return;

    if (timerRef.current) clearInterval(timerRef.current);
    const finalResponses: UserResponse[] = questions.map((q) => {
      const selected = selectedOptions[q.id];
      const correctIdx = q.correctAnswer ?? 0;
      return {
        questionId: q.id,
        selectedOption: selected !== undefined ? selected : null,
        isCorrect: selected === correctIdx
      };
    });
    onFinish(finalResponses);
  }, [questions, selectedOptions, onFinish, isKeyLoading]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(getInitialTime());
    } else {
      setIsSubmitModalOpen(true);
    }
  }, [currentIndex, questions.length, getInitialTime]);

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
  const currentEliminations = eliminatedOptions[currentQuestion.id] || [];

  const handleSelectOption = (index: number) => {
    // Prevent selecting if eliminated (optional rule, but good for strictness)
    // if (currentEliminations.includes(index)) return; 
    
    setSelectedOptions(prev => ({ ...prev, [currentQuestion.id]: index }));
  };

  const toggleElimination = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Prevent triggering selection
    setEliminatedOptions(prev => {
      const current = prev[currentQuestion.id] || [];
      const isEliminated = current.includes(index);
      const updated = isEliminated 
        ? current.filter(i => i !== index) 
        : [...current, index];
      return { ...prev, [currentQuestion.id]: updated };
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
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

      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-100 min-h-[400px] flex flex-col">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
              Question {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-slate-400 italic">
               {timeLeft}s limit
            </span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed mb-8 whitespace-pre-wrap">
            {currentQuestion.text}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isEliminated = currentEliminations.includes(idx);
              const isSelected = selectedOptions[currentQuestion.id] === idx;

              return (
                <div key={idx} className="relative group">
                  <button
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center
                      ${isSelected 
                        ? 'border-indigo-600 bg-indigo-50 shadow-md translate-x-1' 
                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
                      ${isEliminated ? 'opacity-40 grayscale' : 'opacity-100'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors
                      ${isSelected 
                        ? 'border-indigo-600 bg-indigo-600 text-white' 
                        : 'border-slate-300 group-hover:border-indigo-400'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-lg ${isSelected ? 'text-indigo-900 font-semibold' : 'text-slate-700'} ${isEliminated ? 'line-through decoration-2 decoration-slate-400' : ''}`}>
                      {option}
                    </span>
                  </button>
                  
                  {/* Tactical Elimination Button */}
                  <button
                    onClick={(e) => toggleElimination(e, idx)}
                    title={isEliminated ? "Restore Option" : "Eliminate Option"}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-all
                      ${isEliminated 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100'}
                    `}
                  >
                    {isEliminated ? '↺' : '✕'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
          <button
            onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center ${currentIndex === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            ← Previous
          </button>
          
          <button
            onClick={nextQuestion}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all flex items-center"
          >
            {currentIndex === questions.length - 1 ? 'Review & Submit' : 'Next Question →'}
          </button>
        </div>
      </div>

      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Deploy Simulation Finish?</h3>
            <p className="text-slate-600 mb-6">You have answered {Object.keys(selectedOptions).length} out of {questions.length} questions.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button 
                onClick={handleFinish}
                disabled={isKeyLoading}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2
                  ${isKeyLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isKeyLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Syncing Key...</span>
                  </>
                ) : (
                  <span>Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestEngine;
