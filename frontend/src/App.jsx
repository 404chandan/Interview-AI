import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ResumeSetup from './components/ResumeSetup';
import InterviewSession from './components/InterviewSession';
import ReportView from './components/ReportView';
import LeetCodeGenerator from './components/LeetCodeGenerator';
import { Award, Code, BookOpen, Layers, Terminal } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'setup', 'interview', 'report', 'sandbox'
  const [interviewId, setInterviewId] = useState(null);
  const [sessionData, setSessionData] = useState({ interview: null, resume: null });

  const handleStartInterview = (data) => {
    setSessionData(data);
    setInterviewId(data.interview._id);
    setView('interview');
  };

  const handleInterviewFinished = (id) => {
    setInterviewId(id);
    setView('report');
  };

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-gray-100 pb-16">
      
      {/* Global Glassmorphic Header */}
      <header className="sticky top-0 z-40 bg-glassBg border-b border-glassBorder backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="p-2 bg-gradient-to-br from-brandBlue to-brandPurple rounded-lg shadow-md group-hover:opacity-90 transition-opacity">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:text-white transition-colors">
              Interview AI
            </h1>
            <span className="text-[10px] text-gray-500 font-bold block -mt-0.5">AI mock coach & prep</span>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-6 text-xs font-semibold text-gray-400">
          <button 
            onClick={() => setView('dashboard')}
            className={`hover:text-white transition-colors flex items-center gap-1.5 ${view === 'dashboard' ? 'text-brandBlue font-bold' : ''}`}
          >
            <Layers className="w-3.5 h-3.5" /> Dashboard
          </button>
          
          <button 
            onClick={() => setView('sandbox')}
            className={`hover:text-white transition-colors flex items-center gap-1.5 ${view === 'sandbox' ? 'text-brandBlue font-bold' : ''}`}
          >
            <Code className="w-3.5 h-3.5" /> DSA Prep
          </button>

          <button 
            onClick={() => setView('setup')}
            className={`px-4 py-2 rounded-lg bg-brandBlue/15 hover:bg-brandBlue text-brandBlue hover:text-white border border-brandBlue/30 hover:border-transparent transition-all`}
          >
            New Interview
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {view === 'dashboard' && (
          <Dashboard 
            onNavigate={setView} 
            setInterviewId={setInterviewId} 
          />
        )}
        
        {view === 'setup' && (
          <ResumeSetup 
            onStartInterview={handleStartInterview} 
          />
        )}
        
        {view === 'interview' && (
          <InterviewSession 
            interviewData={sessionData.interview}
            resumeData={sessionData.resume}
            onInterviewFinished={handleInterviewFinished}
          />
        )}
        
        {view === 'report' && (
          <ReportView 
            interviewId={interviewId} 
            onNavigate={setView} 
          />
        )}

        {view === 'sandbox' && (
          <LeetCodeGenerator />
        )}
      </main>
    </div>
  );
}
