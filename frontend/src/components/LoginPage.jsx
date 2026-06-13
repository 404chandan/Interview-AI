import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, ChevronRight, LockKeyhole } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Predefined profiles for quick testing and personalized feeds
  const demoProfiles = [
    {
      name: "Chandan",
      role: "Backend Engineer",
      experienceYears: 2,
      email: "chandan@example.com",
      skills: ["Python", "Golang", "Redis", "Docker", "AWS", "Linux"],
      avatar: "C"
    },
    {
      name: "Alex",
      role: "Frontend Engineer",
      experienceYears: 1,
      email: "alex@example.com",
      skills: ["React", "TypeScript", "Tailwind CSS", "Vite", "Jest"],
      avatar: "A"
    },
    {
      name: "Sarah",
      role: "ML Engineer",
      experienceYears: 5,
      email: "sarah@example.com",
      skills: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "Docker", "Kubernetes"],
      avatar: "S"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login
    setTimeout(() => {
      onLoginSuccess({
        name: email.split('@')[0] || "User",
        email,
        role: "Software Engineer",
        experienceYears: 2,
        skills: ["JavaScript", "React", "Node.js", "MongoDB"]
      });
      setLoading(false);
    }, 800);
  };

  const handleDemoLogin = (profile) => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(profile);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in text-left">
      <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative ambient radial light */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-brandBlue/15 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brandBlue/10 rounded-xl mb-3 border border-brandBlue/20">
            <LockKeyhole className="w-6 h-6 text-brandBlue" />
          </div>
          <h1 className="text-xl font-bold text-gray-100">Welcome Back</h1>
          <p className="text-xs text-gray-500 mt-1">Access your personalized AI mock interview dashboard</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chandan@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-xs text-gray-200 placeholder-gray-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-xs text-gray-200 placeholder-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-brandBlue hover:bg-blue-600 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brandBlue/15 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separator line */}
        <div className="relative my-8 text-center">
          <hr className="border-darkBorder" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-darkSurface text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Quick-Login Demo Accounts
          </span>
        </div>

        {/* Demo Quick Accounts */}
        <div className="space-y-2.5">
          {demoProfiles.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleDemoLogin(p)}
              disabled={loading}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-darkBg/50 border border-darkBorder hover:border-gray-500 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brandBlue to-brandPurple flex items-center justify-center text-xs font-black text-white">
                  {p.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200">{p.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{p.role} • {p.experienceYears} YOE</div>
                </div>
              </div>
              
              <div className="text-[10px] font-bold text-brandBlue flex items-center gap-0.5">
                Quick Start <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
