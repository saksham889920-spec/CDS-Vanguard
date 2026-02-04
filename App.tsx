
import React, { useState, useMemo } from 'react';
import { SYLLABUS } from './constants.ts';
import { Subject, Topic, Question, UserResponse, SectionType, Category } from './types.ts';
import { generateQuestions } from './geminiService.ts';
import TestEngine from './components/TestEngine.tsx';
import ResultView from './components/ResultView.tsx';

type AppState = 'HOME' | 'GK_SUBJECT_SELECTION' | 'CATEGORY_SELECTION' | 'TOPIC_SELECTION' | 'LOADING' | 'EXAM' | 'RESULTS' | 'ERROR';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const englishSubject = useMemo(() => SYLLABUS.find(s => s.id === 'english'), []);
  const mathsSubject = useMemo(() => SYLLABUS.find(s => s.id === 'maths'), []);
  const gkSubjects = useMemo(() => SYLLABUS.filter(s => s.section === SectionType.GK), []);

  const startExam = async (subject: Subject, topic: Topic) => {
    setState('LOADING');
    setError(null);
    try {
      // PHASE 1: Parallel Sprint (Questions + Options + CorrectAnswer)
      // Uses 2x Concurrent Workers for max speed.
      const generated = await generateQuestions(subject.section, subject.name, topic.id, topic.name);
      setQuestions(generated);
      setSelectedTopic(topic);
      setState('EXAM');
      
      // NOTE: Explanations are now fetched strictly on-demand in the Results view.
      // This eliminates the Phase 2 background wait time entirely.
      
    } catch (err) {
      console.error(err);
      setError("Vault fallback activated.");
      setState('ERROR');
    }
  };

  const handleFinishTest = (finalResponses: UserResponse[]) => {
    setResponses(finalResponses);
    setState('RESULTS');
  };

  const reset = () => {
    setState('HOME');
    setSelectedSubject(null);
    setSelectedCategory(null);
    setSelectedTopic(null);
    setQuestions([]);
    setResponses([]);
  };

  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-serif font-black text-slate-900 mb-4 tracking-tighter uppercase">
          CDS VANGUARD
        </h1>
        <div className="w-24 h-1.5 bg-slate-900 mx-auto rounded-full mb-4"></div>
        <p className="text-slate-400 font-black tracking-[0.6em] uppercase text-[10px]">UPSC Tactical Command</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { sub: englishSubject, label: 'English', desc: '120 Question Simulation', color: 'indigo', icon: '📚' },
          { sub: mathsSubject, label: 'Maths', desc: '100 Question Simulation', color: 'blue', icon: '📐' },
          { sub: null, label: 'GK Suite', desc: 'General Knowledge Suite', color: 'emerald', icon: '🌍' }
        ].map((item, i) => (
          <div 
            key={i}
            onClick={() => {
              if (item.sub) {
                setSelectedSubject(item.sub);
                setState('TOPIC_SELECTION');
              } else {
                setState('GK_SUBJECT_SELECTION');
              }
            }}
            className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-6xl mb-8 group-hover:scale-110 transition-transform shadow-inner">
              {item.icon}
            </div>
            <h3 className="text-3xl font-black text-slate-900 uppercase">{item.label}</h3>
            <p className="text-slate-400 text-[10px] font-black mt-3 tracking-widest uppercase">{item.desc}</p>
            <div className="mt-10 px-12 py-4 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-widest group-hover:bg-indigo-600 transition-colors shadow-lg uppercase">
              Initiate
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGKSubjects = () => (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
      <button onClick={() => setState('HOME')} className="mb-12 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em] flex items-center">
        ← DISMISS GK SUITE
      </button>
      <div className="mb-16 border-b border-slate-200 pb-8">
        <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">GENERAL KNOWLEDGE</h2>
        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase mt-3">Target core UPSC disciplines</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {gkSubjects.map((sub) => (
          <div key={sub.id} onClick={() => { setSelectedSubject(sub); if(sub.categories) setState('CATEGORY_SELECTION'); else setState('TOPIC_SELECTION'); }} className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-lg hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center text-center">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{sub.icon}</div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{sub.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategorySelection = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
      <button onClick={() => setState('GK_SUBJECT_SELECTION')} className="mb-10 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em]">
        ← BACK TO CORE
      </button>
      <div className="mb-12 flex items-center space-x-8 bg-slate-900 p-12 rounded-[3rem] shadow-2xl">
        <div className="text-7xl">{selectedSubject?.icon}</div>
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{selectedSubject?.name}</h2>
          <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mt-1">Select Combat Category</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {selectedSubject?.categories?.map((cat) => (
          <div key={cat.id} onClick={() => { setSelectedCategory(cat); setState('TOPIC_SELECTION'); }} className="bg-white p-10 rounded-3xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer group flex items-center justify-between shadow-sm">
            <div>
              <h4 className="text-2xl font-black text-slate-800 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">{cat.name}</h4>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{cat.topics.length} Targeted Modules</p>
            </div>
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner font-black text-xl">→</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopicSelection = () => {
    const topics = selectedCategory ? selectedCategory.topics : selectedSubject?.topics;
    const backState = selectedCategory ? 'CATEGORY_SELECTION' : (selectedSubject?.section === SectionType.GK ? 'GK_SUBJECT_SELECTION' : 'HOME');

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
        <button onClick={() => setState(backState as any)} className="mb-10 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em]">
          ← RETURN
        </button>
        <div className="mb-12 flex items-center space-x-8 bg-white p-12 rounded-[3rem] shadow-xl border border-slate-50">
          <div className="text-7xl">{selectedSubject?.icon}</div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{selectedCategory ? selectedCategory.name : selectedSubject?.name}</h2>
            <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-1">Deploy Specific Simulation</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {topics?.map((topic) => (
            <div key={topic.id} onClick={() => startExam(selectedSubject!, topic)} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer group flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">{topic.name}</h4>
                <p className="text-slate-500 text-sm font-medium mt-1">{topic.description}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner font-black text-lg">→</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <div className="relative mb-10">
        <div className="w-20 h-20 border-[6px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-20 h-20 flex items-center justify-center text-[10px] font-black text-slate-900">INTEL</div>
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-[0.5em] mb-2">Assembling Vault</h2>
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Deploying concurrent simulation streams...</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-inner border border-red-100">⚠️</div>
      <h2 className="text-3xl font-black text-slate-900 uppercase mb-4 tracking-tight">System Override</h2>
      <p className="text-slate-500 max-w-sm mb-10 font-medium">The intelligence server is currently unreachable. You may initiate a pre-cached offline simulation or re-establish connection.</p>
      <button onClick={() => startExam(selectedSubject!, selectedTopic!)} className="px-14 py-4 bg-slate-900 text-white rounded-full font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all">Retry Simulation</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="bg-white/80 backdrop-blur-3xl border-b border-slate-100 h-20 flex items-center px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={reset}>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xl group-hover:scale-105 transition-all">V</div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 tracking-tighter text-xl leading-none">VANGUARD</span>
              <span className="text-[8px] font-black text-slate-400 tracking-[0.5em] uppercase mt-0.5">UPSC Command Center</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-100">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
               <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest leading-none">Ready</span>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {state === 'HOME' && renderHome()}
        {state === 'GK_SUBJECT_SELECTION' && renderGKSubjects()}
        {state === 'CATEGORY_SELECTION' && renderCategorySelection()}
        {state === 'TOPIC_SELECTION' && renderTopicSelection()}
        {state === 'LOADING' && renderLoading()}
        {state === 'ERROR' && renderError()}
        {state === 'EXAM' && selectedSubject && selectedTopic && (
          <TestEngine 
            questions={questions} 
            subject={selectedSubject} 
            topic={selectedTopic} 
            isKeyLoading={false}
            onFinish={handleFinishTest} 
          />
        )}
        {state === 'RESULTS' && selectedSubject && selectedTopic && (
          <ResultView 
            questions={questions} 
            responses={responses} 
            subject={selectedSubject} 
            topic={selectedTopic} 
            onRestart={reset} 
          />
        )}
      </main>
      
      <footer className="py-20 border-t border-slate-100 text-center bg-slate-50/50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">CDS VANGUARD • Strategic UPSC Engine • v5.0 (Parallel Core)</p>
      </footer>
    </div>
  );
};

export default App;
