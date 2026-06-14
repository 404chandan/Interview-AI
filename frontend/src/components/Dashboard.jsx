import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Play, Code, BookOpen, Award, Zap, AlertTriangle, CheckCircle, ChevronRight, Eye, Video } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function Dashboard({ onNavigate, setInterviewId, user }) {
  const isFrontend = user?.role === 'Frontend Engineer';
  const isML = user?.role === 'ML Engineer';

  const personalData = {
    weakSpots: isFrontend 
      ? [
          { topic: "CSS Layouts", detail: "Flexbox/Grid layout boundary rendering issues." },
          { topic: "React Rendering", detail: "Inefficient state hooks causing redundant re-renders." }
        ]
      : isML
        ? [
            { topic: "Model Cache", detail: "GPU cache memory leaking on pipeline re-runs." },
            { topic: "CNN Overfitting", detail: "Failing regularization on sparse custom datasets." }
          ]
        : [
            { topic: "Dynamic Programming", detail: "Failed edge cases on string alignments." },
            { topic: "System Design", detail: "Missed AOF rewrites during Redis persistence questions." }
          ],
    strengths: isFrontend
      ? [
          { topic: "State Management", detail: "Clean usage of state hooks and context providers." },
          { topic: "DOM API", detail: "Optimal document tree traversal bounds." }
        ]
      : isML
        ? [
            { topic: "Linear Algebra", detail: "Excellent matrix manipulation concepts." },
            { topic: "Feature Engineering", detail: "Optimal data pre-processing implementations." }
          ]
        : [
            { topic: "Sliding Window", detail: "Excellent solution structure." },
            { topic: "General Backend", detail: "Clear concepts of caches and Docker setups." }
          ],
    recommendations: isFrontend
      ? [
          { title: "Optimize Component Rendering", detail: "Practice dynamic rendering hooks on Monaco", route: "sandbox" },
          { title: "Design Web App Layout", detail: "Build whiteboard layouts for responsive design", route: "setup" }
        ]
      : isML
        ? [
            { title: "Array Multiplication", detail: "Practice multidimensional array indexing", route: "sandbox" },
            { title: "Design ML Pipelines", detail: "Build whiteboard schemas for ML data lakes", route: "setup" }
        ]
      : [
          { title: "Practice Sliding Window", detail: "Solve Google Medium questions", route: "sandbox" },
          { title: "System Design Whiteboard", detail: "Mock build TinyURL or Rate Limiters", route: "setup" }
        ]
  };
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    averageScore: 0,
    dsaTrend: [],
    sysDesignTrend: [],
    commTrend: [],
    readyEstimates: { google: 0, amazon: 0, meta: 0, microsoft: 0 }
  });
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from backend API
    const fetchData = async () => {
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/analytics`),
          fetch(`${BACKEND_URL}/api/interviews/history`)
        ]);
        
        if (analyticsRes.ok && historyRes.ok) {
          const analyticsData = await analyticsRes.json();
          const historyData = await historyRes.json();
          setAnalytics(analyticsData);
          setHistory(historyData);
        }
      } catch (err) {
        console.warn("Could not load backend data, using fallback presets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isNewUser = !loading && history.length === 0;

  // Format Recharts trend data
  const chartData = analytics.dsaTrend.map((_, i) => ({
    session: `Session #${i + 1}`,
    DSA: analytics.dsaTrend[i] || 0,
    SystemDesign: analytics.sysDesignTrend[i] || 0,
    Communication: analytics.commTrend[i] || 0
  }));

  const companies = [
    { name: 'Google', level: 'L4 SWE', rating: analytics.readyEstimates.google, color: '#3b82f6' },
    { name: 'Amazon', level: 'SDE II', rating: analytics.readyEstimates.amazon, color: '#f59e0b' },
    { name: 'Meta', level: 'E4 SWE', rating: analytics.readyEstimates.meta, color: '#8b5cf6' },
    { name: 'Microsoft', level: 'L61 SWE', rating: analytics.readyEstimates.microsoft, color: '#10b981' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">
            Welcome back, {user?.name || 'Chandan'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Your personal AI Coach has parsed 1 resume and has recommendations ready for a target <strong className="text-brandBlue">{user?.role || 'Backend Engineer'}</strong> role.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('sandbox')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-darkBorder bg-darkSurface text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-colors text-sm font-semibold"
          >
            <Code className="w-4 h-4 text-brandBlue" />
            LeetCode Sandbox
          </button>
          <button
            onClick={() => onNavigate('setup')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-brandBlue to-brandPurple text-white hover:opacity-90 transition-opacity text-sm font-semibold shadow-lg shadow-brandBlue/10"
          >
            <Play className="w-4 h-4 fill-current" />
            New Mock Interview
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Analytics Chart & History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Charts Area */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-brandBlue" /> Performance Metrics Timeline
            </h2>
            
            {isNewUser ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-darkBg/10 border border-dashed border-darkBorder rounded-lg">
                <Award className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-sm font-semibold text-gray-300">Performance Timeline Pending</p>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Complete your first mock interview. We will track your DSA, System Design, and Communication skills over time.
                </p>
              </div>
            ) : (
              <>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDsa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="session" stroke="var(--color-gray-500)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--color-gray-500)" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-surface)', 
                          borderColor: 'var(--color-border)', 
                          borderRadius: '8px' 
                        }}
                        labelStyle={{ color: 'var(--color-gray-400)', fontWeight: 'bold' }}
                        itemStyle={{ color: 'var(--color-gray-50)' }}
                      />
                      <Area type="monotone" dataKey="DSA" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDsa)" name="DSA / Coding" />
                      <Area type="monotone" dataKey="SystemDesign" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSys)" name="System Design" />
                      <Area type="monotone" dataKey="Communication" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorComm)" name="Communication" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-4 justify-center text-xs">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-brandBlue" /> DSA / Coding
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-brandPurple" /> System Design
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-brandAccent" /> Communication
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Past History */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-brandPurple" /> Interview History & Session Replays
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 w-full bg-darkBorder/30 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-darkBorder rounded-lg">
                <p className="text-gray-500 text-sm">No interviews recorded yet. Upload your resume to start.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((session) => (
                  <div 
                    key={session._id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-darkSurface/50 border border-darkBorder hover:border-gray-700 transition-colors gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-sm text-gray-200">{session.role}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                          session.hiringDecision === 'Strong Hire' 
                            ? 'bg-brandAccent/15 text-brandAccent' 
                            : session.hiringDecision === 'Hire'
                              ? 'bg-brandBlue/15 text-brandBlue'
                              : 'bg-gray-800 text-gray-400'
                        }`}>
                          {session.hiringDecision}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                        <span>Score: <strong className="text-gray-100">{session.finalScore}%</strong></span>
                        <span>•</span>
                        <span>Exp: {session.experienceYears} Years</span>
                        <span>•</span>
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setInterviewId(session._id);
                        onNavigate('report');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brandBlue hover:text-white bg-brandBlue/10 hover:bg-brandBlue rounded-lg transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Replay Report
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Twin Coaching widget */}
        <div className="space-y-8">
          
          {/* AI Twin Coach Widget */}
          <div className="glass-panel rounded-xl p-6 border-brandBlue/20 bg-gradient-to-b from-darkSurface to-[#0f1524]">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-brandPurple animate-pulse" />
              <h2 className="text-lg font-semibold text-gray-100">AI Coach Twin</h2>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Analyzing metrics from your history and resume. I have mapped your skill set to target requirements.
            </p>

            {/* Target readiness meters */}
            {/* Target readiness meters */}
            {isNewUser ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center bg-darkBg/10 border border-dashed border-darkBorder rounded-lg my-4">
                <Zap className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-xs font-semibold text-gray-300">Readiness Analysis Pending</p>
                <p className="text-[10px] text-gray-500 max-w-[200px] mt-1">
                  We will compile your readiness scores for Google, Amazon, Meta, and Microsoft after your first assessment.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Target Company Readiness</span>
                {companies.map((company) => (
                  <div key={company.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-200">{company.name} <span className="text-[10px] text-gray-500">({company.level})</span></span>
                      <span style={{ color: company.color }}>{company.rating}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${company.rating}%`,
                          backgroundColor: company.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback items */}
            {isNewUser ? (
              <div className="pt-4 border-t border-darkBorder text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center justify-center gap-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Skill Profile Pending
                </span>
                <p className="text-[10px] text-gray-500 max-w-[220px] mx-auto mt-1">
                  Your core strengths and weak spots will be mapped as you complete interviews.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 pt-4 border-t border-darkBorder">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Focus Weak Spots
                  </span>
                  <div className="space-y-2">
                    {personalData.weakSpots.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span><strong>{item.topic}:</strong> {item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 mt-4 border-t border-darkBorder">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-brandAccent" /> Top Strengths
                  </span>
                  <div className="space-y-2">
                    {personalData.strengths.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="w-1.5 h-1.5 bg-brandAccent rounded-full mt-1.5 flex-shrink-0" />
                        <span><strong>{item.topic}:</strong> {item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick study links */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brandBlue" /> Recommended Preparation
            </h2>
            <div className="space-y-3">
              {personalData.recommendations.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onNavigate(item.route)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-darkSurface/30 border border-darkBorder hover:border-gray-700 transition-colors text-left"
                >
                  <div>
                    <div className="text-xs font-semibold text-gray-200">{item.title}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{item.detail}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
