
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
  // Use local state to track which briefs are "revealed" visually, but data is already there.
  const [revealedBriefs, setRevealedBriefs] = useState<Record<string, boolean>>({});

  const correctCount = responses.filter(r => r.isCorrect).length;
  const attemptedCount = responses.filter(r => r.selectedOption !== null).length;
  const score = (correctCount * 1) - ((attemptedCount - correctCount) * 0.33);

  const toggleBrief = (qId: string) => {
    setRevealedBriefs(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      {/* Score Overview */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 border border-slate-100">
        <div className="bg-slate-900 p-12 text-center text-white">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Simulation Scoreboard</h2>
          <div className="text-7xl font-bold mb-4 font-serif text-white">{score.toFixed(2)}</div>
          <p className="text-slate-400 text-sm font-medium mb-8">Performance weighted by UPSC negative marking rules.</p>
          
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
        
        <div className="p-8 flex justify-center border-t border-slate-50 bg-slate-50/50">
          <button 
            onClick={onRestart}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 shadow-xl transition-all"
          >
            ← Return to Command Center
          </button>
        </div>
      </div>

      <div className="mb-8 border-b border-slate-200 pb-4">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">CONCEPTUAL ANALYSIS</h3>
        <p className="text-slate-500 text-sm font-medium">Intel briefs generated instantly via Vanguard Batch Processing.</p>
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
                    <span className="bg-slate-100 text-slate-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Incomplete</span>
                  ) : isCorrect ? (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Secured</span>
                  ) : (
                    <span className="bg-red-50 text-red-600 border border-red-100 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Compromised</span>
                  )}
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-slate-800 mb-10 leading-relaxed">{q.text}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {q.options.map((opt, oIdx) => {
                  let statusClass = "bg-slate-50 border-slate-100 text-slate-500";
                  if (oIdx === q.correctAnswer) statusClass = "bg-emerald-50 border-emerald-200 text-emerald-900 font-bold shadow-sm";
                  if (oIdx === userIdx && !isCorrect) statusClass = "bg-red-50 border-red-200 text-red-900 font-bold";

                  return (
                    <div key={oIdx} className={`p-6 rounded-2xl border-2 ${statusClass} flex items-center text-sm transition-all`}>
                       <span className={`w-8 h-8 flex items-center justify-center rounded-xl border mr-4 text-[11px] font-black shrink-0 ${oIdx === q.correctAnswer ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-current opacity-40'}`}>
                        {String.fromCharCode(65 + oIdx)}
                       </span>
                       {opt}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col space-y-6">
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-inner">
                  <h5 className="text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                    Immediate Feedback
                  </h5>
                  <p className="text-slate-600 text-base leading-relaxed font-medium">
                    {q.explanation}
                  </p>
                </div>

                {/* Instant reveal brief */}
                {isBriefVisible && brief ? (
                  <div className="animate-fade-in space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Core Intelligence Card */}
                      <div className="bg-slate-900 text-white rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">📑</div>
                        <div className="flex items-center space-x-4 mb-6 relative z-10">
                          <span className="text-3xl">🏛️</span>
                          <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">The Conceptual Blueprint</h5>
                        </div>
                        <p className="text-slate-200 text-base leading-relaxed mb-8 font-medium relative z-10">
                          {brief.corePrinciple}
                        </p>
                        <div className="pt-8 border-t border-white/10 relative z-10">
                          <h6 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">UPSC Trend Context</h6>
                          <p className="text-sm text-indigo-200/80 leading-relaxed italic">{brief.upscContext}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 border-2 border-slate-100 shadow-sm">
                          <div className="flex items-center space-x-4 mb-8">
                            <span className="text-3xl">⚔️</span>
                            <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">The Vanguard Approach</h5>
                          </div>
                          <div className="space-y-6">
                            {brief.strategicApproach.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start space-x-4">
                                <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black shrink-0">{sIdx + 1}</span>
                                <p className="text-slate-700 text-sm font-bold leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-6">
                           <div className="bg-amber-50 rounded-[2.5rem] p-10 border-2 border-amber-100/50 flex-grow shadow-inner">
                              <div className="flex items-center space-x-4 mb-6">
                                <span className="text-3xl">💡</span>
                                <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-700">Memory Hack</h5>
                              </div>
                              <p className="text-amber-900 text-base font-black italic leading-relaxed">
                                "{brief.recallHacks}"
                              </p>
                           </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleBrief(q.id)}
                      className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Collapse Intel Brief
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => toggleBrief(q.id)}
                    className="w-full py-8 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 text-[11px] font-black uppercase tracking-[0.5em] hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center group"
                  >
                    <span className="group-hover:scale-125 group-hover:-rotate-12 transition-transform mb-3 text-4xl">🛡️</span>
                    OPEN MISSION INTEL BRIEF (INSTANT)
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
