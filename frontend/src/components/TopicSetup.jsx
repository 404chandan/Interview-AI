import React, { useState } from 'react';
import { BookOpen, ChevronRight, AlertCircle, Clock, Award, User } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function TopicSetup({ onStartInterview }) {
  const [topicName, setTopicName] = useState('Operating Systems');
  const [experience, setExperience] = useState(2);
  const [duration, setDuration] = useState(15);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedInterviewer, setSelectedInterviewer] = useState('Sarah');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const popularTopics = [
    'Operating Systems',
    'Database Management Systems (DBMS)',
    'Computer Networks',
    'System Design',
    'Machine Learning & Deep Learning',
    'Object-Oriented Programming (OOPs)'
  ];

  const difficulties = ['easy', 'medium', 'hard'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Start Interview Session in Topic-Wise Mode
      const startRes = await fetch(`${BACKEND_URL}/api/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: topicName,
          experienceYears: experience,
          resumeId: null, // No resume needed for purely topic-wise mocks
          interviewer: selectedInterviewer,
          targetCompany: 'General',
          isTopicWise: true,
          topicName,
          difficulty,
          roundTimes: { 1: duration } // Round 1 will run for the chosen duration
        }),
      });

      if (!startRes.ok) {
        throw new Error('Failed to start topic-wise interview.');
      }

      const startData = await startRes.json();
      
      // Pass data back to parent
      onStartInterview({
        interview: { ...startData.interview, interviewerAvatar: selectedInterviewer },
        resume: null
      });
    } catch (err) {
      console.warn("Backend API request failed, initializing mock session in-browser.");
      
      const mockInterviewId = 'mock-topic-interview-' + Date.now();
      
      onStartInterview({
        interview: {
          _id: mockInterviewId,
          role: topicName,
          experienceYears: experience,
          resumeId: null,
          status: 'ongoing',
          currentRound: 1,
          interviewerAvatar: selectedInterviewer,
          isTopicWise: true,
          topicName,
          difficulty,
          roundTimes: { 1: duration },
          scores: { resume: 0, projects: 0, technical: 0, dsa: 0, systemDesign: 0, behavioral: 0 },
          finalScore: 0,
          hiringDecision: 'Pending',
          cameraAnalysis: {
            eyeContactScore: 85,
            confidenceScore: 80,
            fillerWordsCount: 2,
            avgResponseTime: 3.2,
            speechClarityScore: 92,
            speakingPace: 'Normal'
          },
          createdAt: new Date()
        },
        resume: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in text-left">
      <div className="glass-panel rounded-xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-550 flex items-center gap-2 mb-2">
          <BookOpen className="w-7 h-7 text-brandPurple" /> Topic-Wise Mock Interview
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Focus your preparation. Enter any technical topic, choose your experience level and desired duration, and our AI interviewer will probe your depth on that subject.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Enter or Select Topic</label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Operating Systems, System Design, databases"
              className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandPurple text-gray-300 text-sm placeholder-gray-600 mb-2"
              required
            />
            <div className="flex flex-wrap gap-2 mt-1.5">
              {popularTopics.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setTopicName(pt)}
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all ${
                    topicName === pt
                      ? 'border-brandPurple bg-brandPurple/10 text-brandPurple'
                      : 'border-darkBorder bg-darkBg text-gray-500 hover:text-gray-200'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brandPurple" /> Interview Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={duration}
                onChange={(e) => setDuration(Math.max(5, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandPurple text-gray-300 text-sm"
              />
              <span className="text-[10px] text-gray-500 italic block mt-0.5">Choose between 5 and 60 minutes.</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brandPurple" /> Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandPurple text-gray-300 text-sm capitalize"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Interviewer selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select AI Interviewer</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedInterviewer('Sarah')}
                className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  selectedInterviewer === 'Sarah' 
                    ? 'border-brandBlue bg-brandBlue/10 shadow-lg shadow-brandBlue/5' 
                    : 'border-darkBorder bg-darkBg/30 hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md text-sm">
                  S
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200">Sarah</div>
                  <div className="text-[10px] text-gray-500 font-medium">AI Technical Recruiter (Female)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInterviewer('David')}
                className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  selectedInterviewer === 'David' 
                    ? 'border-brandPurple bg-brandPurple/10 shadow-lg shadow-brandPurple/5' 
                    : 'border-darkBorder bg-darkBg/30 hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brandBlue to-blue-700 flex items-center justify-center font-bold text-white shadow-md text-sm">
                  D
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200">David</div>
                  <div className="text-[10px] text-gray-500 font-medium">Lead Systems Architect (Male)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Years of Experience Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
              <span>Candidate Experience Level</span>
              <span className="text-brandPurple font-mono text-sm lowercase">{experience} YOE</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandPurple"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>0 (Entry/Junior)</span>
              <span>5 (Mid/Senior)</span>
              <span>10 (Lead)</span>
              <span>15+ (Principal)</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-gradient-to-r from-brandPurple via-indigo-600 to-brandBlue text-white hover:opacity-95 transition-all text-sm font-semibold shadow-lg shadow-brandPurple/15 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing Topic-wise Model...
              </>
            ) : (
              <>
                Start Custom Topic Interview
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
