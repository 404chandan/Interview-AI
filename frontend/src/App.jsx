import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ResumeSetup from './components/ResumeSetup';
import InterviewSession from './components/InterviewSession';
import ReportView from './components/ReportView';
import LeetCodeGenerator from './components/LeetCodeGenerator';
import { Layers, Code, Play, LogIn, LogOut, User, Sun, Moon } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'dashboard', 'setup', 'interview', 'report', 'sandbox'
  const [user, setUser] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [sessionData, setSessionData] = useState({ interview: null, resume: null });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auto-login and fetch interceptor
  useEffect(() => {
    // 1. Inject global fetch interceptor to automatically append Bearer token
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const token = localStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      return originalFetch(url, options);
    };

    // 2. Restore active session
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({
          name: parsed.username,
          email: parsed.email,
          _id: parsed._id,
          token: savedToken
        });
        setView('dashboard');
      } catch (e) {
        console.error("Error restoring session:", e);
      }
    }
  }, []);

  const handleStartInterview = (data) => {
    setSessionData(data);
    setInterviewId(data.interview._id);
    setView('interview');
  };

  const handleInterviewFinished = (id) => {
    setInterviewId(id);
    setView('report');
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-gray-100 pb-16">
      
      {/* Global Glassmorphic Header */}
      <header className="sticky top-0 z-40 bg-glassBg border-b border-glassBorder backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => setView(user ? 'dashboard' : 'landing')}
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

        {/* Navigation / Header Actions */}
        <nav className="flex items-center gap-6 text-xs font-semibold text-gray-400">
          <button
            type="button"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-darkBorder hover:border-gray-500 text-gray-400 hover:text-white transition-all flex items-center justify-center"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-brandBlue" />}
          </button>

          {user ? (
            <>
              <button 
                onClick={() => setView('dashboard')}
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${view === 'dashboard' ? 'text-brandBlue font-brand' : ''}`}
              >
                <Layers className="w-3.5 h-3.5" /> Dashboard
              </button>
              
              <button 
                onClick={() => setView('sandbox')}
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${view === 'sandbox' ? 'text-brandBlue font-brand' : ''}`}
              >
                <Code className="w-3.5 h-3.5" /> DSA Prep
              </button>

              <button 
                onClick={() => setView('setup')}
                className={`px-3 py-1.5 rounded-lg bg-brandBlue/15 hover:bg-brandBlue text-brandBlue hover:text-white border border-brandBlue/30 hover:border-transparent transition-all`}
              >
                New Interview
              </button>

              {/* User badge */}
              <div className="flex items-center gap-3 pl-4 border-l border-darkBorder">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brandPurple/20 flex items-center justify-center border border-brandPurple/30 text-brandPurple font-bold">
                    {user.name[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-300 text-xs truncate max-w-[80px]">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {view !== 'login' && (
                <button
                  onClick={() => setView('login')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brandBlue hover:bg-blue-600 text-white transition-all shadow-md shadow-brandBlue/10"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
              )}
            </>
          )}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {view === 'landing' && (
          <LandingPage onEnterPlatform={() => setView('login')} />
        )}

        {view === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}

        {view === 'dashboard' && (
          <Dashboard 
            onNavigate={setView} 
            setInterviewId={setInterviewId}
            user={user}
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
