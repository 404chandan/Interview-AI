import React, { useState, useEffect, useRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { CheckCircle2, User, Download, RefreshCw, Star, AlertTriangle, Eye, Video, Award } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function ReportView({ interviewId, onNavigate }) {
  const [report, setReport] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/interview/${interviewId}/report`);
        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
          setInterview(data.interview);
        }
      } catch (err) {
        console.warn("Could not fetch interview report, generating local mock data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchReport();
    } else {
      // Direct mock fallback for presentation
      setTimeout(() => {
        setInterview({
          _id: 'mock-session',
          role: 'Backend Engineer',
          experienceYears: 2,
          scores: { resume: 85, projects: 88, technical: 82, dsa: 90, systemDesign: 78, behavioral: 84 },
          finalScore: 84,
          hiringDecision: 'Hire',
          cameraAnalysis: {
            eyeContactScore: 76,
            confidenceScore: 82,
            fillerWordsCount: 14,
            avgResponseTime: 3.1,
            speechClarityScore: 87,
            speakingPace: 'Normal'
          }
        });
        
        setReport({
          candidateSummary: "Chandan shows strong backend competence with solid familiarity in container tools (Docker), caching layouts (Redis), and high-scale coding (Golang, Python). Their DSA execution was optimal, solving problems with linear time complexities. Communication is clear, showing good confidence, though system design rounds highlighted minor gaps in distributed transaction handling and message broker configurations.",
          strongAreas: ["Algorithm execution & DSA", "Backend caching patterns with Redis", "Clear conversational communication"],
          weakAreas: ["Distributed Transaction scalability", "Cache consistency protocols", "Alternative message queues tradeoffs"],
          estimatedReadiness: { google: 72, amazon: 81, meta: 76, microsoft: 84 },
          questionBreakdown: [
            {
              questionText: "You automated InsightPro workflows reducing manual effort by 80%. Can you explain the architecture?",
              userAnswer: "I designed a distributed task runner using Celery and Redis to batch process jobs concurrently. We scaled workers dynamically based on queue size, which minimized job latency and reduced manual processing from 5 hours to 1 hour.",
              score: 9,
              feedback: "Excellent understanding of asynchronous task architecture. Identified and explained the queuing mechanism clearly."
            },
            {
              questionText: "Given an array of integers, find if the array contains any duplicates.",
              userAnswer: "function containsDuplicate(nums) {\n  const set = new Set();\n  for (const num of nums) {\n    if (set.has(num)) return true;\n    set.add(num);\n  }\n  return false;\n}",
              score: 10,
              feedback: "Optimal solution with O(N) time complexity and O(N) space complexity. Handled all edge cases correctly."
            },
            {
              questionText: "Design TinyURL (URL Shortener). Focus on scaling writes and database storage choices.",
              userAnswer: "I would use a relational database with horizontal sharding for URL mapping tables, and a pre-allocated key range generator using ZooKeeper to avoid collision on unique short slugs. Standard lookups would be cached in Redis with an LRU policy.",
              score: 8,
              feedback: "Good scaling structure. High marks on ZooKeeper lookup setup, but missed detailing database write replication bounds."
            }
          ]
        });
        setLoading(false);
      }, 500);
    }
  }, [interviewId]);

  // Activate local camera replay simulation
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.warn("Camera replay preview disabled or blocked: ", err.message));
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-500 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brandBlue border-t-transparent" />
        <span className="text-sm font-semibold">Compiling final rating report cards...</span>
      </div>
    );
  }

  // Radar data mapping
  const radarData = [
    { subject: 'DSA', value: interview?.scores?.dsa || 80, fullMark: 100 },
    { subject: 'Backend', value: interview?.scores?.technical || 80, fullMark: 100 },
    { subject: 'System Design', value: interview?.scores?.systemDesign || 80, fullMark: 100 },
    { subject: 'Communication', value: interview?.cameraAnalysis?.eyeContactScore || 80, fullMark: 100 },
    { subject: 'Problem Solving', value: interview?.scores?.projects || 80, fullMark: 100 },
    { subject: 'Leadership', value: interview?.scores?.behavioral || 80, fullMark: 100 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-left">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-brandBlue uppercase tracking-wider">Report Center</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Detailed Interview Assessment</h1>
          <p className="text-gray-400 text-xs mt-1">Session ID: {interviewId || 'mock-session-id'}</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-darkSurface border border-darkBorder hover:border-gray-500 text-gray-300 hover:text-white transition-all text-xs font-semibold"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brandBlue hover:bg-blue-600 text-white transition-all text-xs font-semibold shadow-md shadow-brandBlue/10"
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Scores, Summary, Replay, Questions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Summary & Decision Box */}
          <div className="glass-panel rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 border-brandBlue/20">
            <div className="w-28 h-28 rounded-full border-4 border-dashed border-brandBlue/30 flex items-center justify-center bg-brandBlue/5 flex-shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Final Rating</span>
                <span className="text-3xl font-black text-gray-100">{interview?.finalScore}%</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h2 className="text-xl font-bold text-gray-100">{interview?.role} mock</h2>
                <span className={`px-3 py-0.5 rounded text-xs font-bold uppercase border ${
                  interview?.hiringDecision === 'Strong Hire' 
                    ? 'bg-brandAccent/10 text-brandAccent border-brandAccent/30' 
                    : interview?.hiringDecision === 'Hire'
                      ? 'bg-brandBlue/10 text-brandBlue border-brandBlue/30'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}>
                  Hiring Verdict: {interview?.hiringDecision}
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                {report?.candidateSummary}
              </p>
            </div>
          </div>

          {/* Section Score Breakdown */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-brandBlue" /> Section Scorecards
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
              {Object.entries(interview?.scores || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-darkBg/50 border border-darkBorder rounded-lg">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block truncate">{key}</span>
                  <span className="text-lg font-bold text-gray-100 font-mono mt-1 block">{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question Breakdown Analysis */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-200 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brandAccent" /> Question-Wise Analysis
            </h2>
            
            <div className="space-y-6">
              {report?.questionBreakdown.map((q, idx) => (
                <div key={idx} className="border-b border-darkBorder/40 pb-6 last:border-0 last:pb-0 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-semibold text-gray-200 leading-relaxed">
                      Q{idx + 1}: {q.questionText}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-darkBg border border-darkBorder text-brandBlue flex-shrink-0">
                      Score: {q.score}/10
                    </span>
                  </div>

                  <div className="bg-darkBg/40 border border-darkBorder/60 rounded-lg p-3 text-xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Your Submission</span>
                    <pre className="text-gray-300 font-mono whitespace-pre-wrap leading-relaxed text-[11px]">
                      {q.userAnswer}
                    </pre>
                  </div>

                  <div className="bg-brandPurple/5 border border-brandPurple/10 rounded-lg p-3 text-xs">
                    <span className="text-[10px] text-brandPurple font-bold uppercase block mb-1">AI Assessor feedback</span>
                    <p className="text-gray-300 leading-relaxed">
                      {q.feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Radar Chart, Webcam Analysis, Webcam Replay */}
        <div className="space-y-8">
          
          {/* Radar Chart Panel */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Skill Radar Chart
            </h2>
            <div className="h-56 w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tickLine={false} tick={false} />
                  <Radar name="Candidate" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Webcam Metrics Panel */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Video className="w-4 h-4 text-brandPurple" /> Webcam Communication Analysis
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-darkBg/40 border border-darkBorder rounded-lg">
                <span className="text-[9px] text-gray-500 font-bold uppercase block">Eye Contact</span>
                <span className="text-base font-bold text-gray-200 font-mono block mt-1">
                  {interview?.cameraAnalysis?.eyeContactScore}%
                </span>
              </div>
              <div className="p-3 bg-darkBg/40 border border-darkBorder rounded-lg">
                <span className="text-[9px] text-gray-500 font-bold uppercase block">Confidence Level</span>
                <span className="text-base font-bold text-gray-200 font-mono block mt-1">
                  {interview?.cameraAnalysis?.confidenceScore}%
                </span>
              </div>
              <div className="p-3 bg-darkBg/40 border border-darkBorder rounded-lg">
                <span className="text-[9px] text-gray-500 font-bold uppercase block">Filler Words</span>
                <span className="text-base font-bold text-gray-200 font-mono block mt-1">
                  {interview?.cameraAnalysis?.fillerWordsCount}
                </span>
              </div>
              <div className="p-3 bg-darkBg/40 border border-darkBorder rounded-lg">
                <span className="text-[9px] text-gray-500 font-bold uppercase block">Avg Response</span>
                <span className="text-base font-bold text-gray-200 font-mono block mt-1">
                  {interview?.cameraAnalysis?.avgResponseTime} s
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-darkBorder/40">
              <div className="flex justify-between">
                <span className="text-gray-400">Speech Clarity:</span>
                <span className="text-gray-200 font-bold font-mono">{interview?.cameraAnalysis?.speechClarityScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Speaking Pace:</span>
                <span className="text-gray-200 font-bold">{interview?.cameraAnalysis?.speakingPace}</span>
              </div>
            </div>
          </div>

          {/* Video Session Replay player */}
          <div className="glass-panel rounded-xl p-6 overflow-hidden">
            <h2 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-brandBlue animate-pulse" /> Webcam Recording Replay
            </h2>
            <div className="aspect-video bg-black rounded-lg border border-darkBorder relative overflow-hidden flex items-center justify-center">
              <video 
                ref={videoRef}
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-contain opacity-60 bg-black"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span>SESSION REPLAY PREVIEW (Muted)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
