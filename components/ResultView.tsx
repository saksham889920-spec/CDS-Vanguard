
import React, { useState } from 'react';
import { Question, UserResponse, Subject, Topic } from '../types';

interface ResultViewProps {
  questions: Question[];
  responses: UserResponse[];
  subject: Subject;
  topic: Topic;
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ questions, responses, subject, topic, onRestart }) => {
  const [revealedBriefs, setRevealedBriefs] = useState<Record<string, boolean>>({});

  const correctCount = responses.filter(r => r.isCorrect).length;
  const attemptedCount = responses.filter(r => r.selectedOption !== null).length;
  const score = (correctCount * 1) - ((attemptedCount - correctCount) * 0.33);

  const toggleBrief = (qId: string) => {
    setRevealedBriefs(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 border border-slate-100">
        <div className="bg-slate-900 p-12 text-center text-white">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Simulation Scoreboard</h2>
          <div className="text-7xl font-bold mb-4 font-serif text-white">{score.toFixed(2)}</div>
          <p className="text-slate-400 text-sm font-medium mb-8">UPSC Standard Negative Marking (1/3rd penalty)</p>
          
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Correct</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-black text-red-400">{attemptedCount - correctCount}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Wrong</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-black text-slate-400">{questions.length - attemptedCount}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skipped</div>
            </div>
          </div>
        </div>
        
        <div className="p-8 flex justify-center bg-slate-50/50">
          <button onClick={onRestart} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 shadow-xl transition-all">
            ← Return to Command Center
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {questions.map((q, idx) => {
          const userResp = responses.find(r => r.questionId === q.id);
          const isCorrect = userResp?.isCorrect;
          const userIdx = userResp?.selectedOption;
          const isBriefVisible = revealedBriefs[q.id];
          const brief = q.intelBrief;

          return (
            <div key={q.id} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm transition-all hover:shadow-lg">
              <div className="flex items-start justify-between mb-8">
                <span className="text-slate-200 font-black mr-4 text-4xl">#{idx + 1}</span>
                <div className="flex space-x-2">
                  {userIdx === null ? (
                    <span className="bg-slate-100 text-slate-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Skipped</span>
                  ) : isCorrect ? (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Secured</span>
                  ) : (
                    <span className="bg-red-50 text-red-600 border border-red-100 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Failed</span>
                  )}
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">{q.text}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {q.options.map((opt, oIdx) => {
                  let statusClass = "bg-slate-50 border-slate-100 text-slate-500";
                  if (oIdx === q.correctAnswer) statusClass = "bg-emerald-50 border-emerald-200 text-emerald-900 font-bold shadow-sm";
                  if (oIdx === userIdx && !isCorrect) statusClass = "bg-red-50 border-red-200 text-red-900 font-bold";

                  return (
                    <div key={oIdx} className={`p-5 rounded-2xl border-2 ${statusClass} flex items-center text-sm`}>
                       <span className={`w-7 h-7 flex items-center justify-center rounded-lg border mr-3 text-[10px] font-black ${oIdx === q.correctAnswer ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-current opacity-40'}`}>
                        {String.fromCharCode(65 + oIdx)}
                       </span>
                       {opt}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h5 className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400">Explanation</h5>
                  <p className="text-slate-600 text-sm leading-relaxed">{q.explanation}</p>
                </div>

                {isBriefVisible && brief ? (
                  <div className="animate-fade-in space-y-4 pt-4 border-t border-slate-100">
                    <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">🏛️</span>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Mission Intel</h5>
                      </div>
                      <p className="text-slate-200 text-sm mb-6 font-medium">{brief.corePrinciple}</p>
                      <div className="pt-4 border-t border-white/10 text-xs text-slate-400 italic">
                        UPSC Context: {brief.upscContext}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border-2 border-slate-100 rounded-3xl p-8">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center">
                          <span className="mr-2">⚔️</span> Tactics
                        </h5>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{brief.strategicApproach}</p>
                      </div>
                      <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-8">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-4 flex items-center">
                          <span className="mr-2">💡</span> Recall
                        </h5>
                        <p className="text-amber-900 text-sm font-bold italic">"{brief.recallHacks}"</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => toggleBrief(q.id)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all">
                    Expand Mission Brief
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultView;
