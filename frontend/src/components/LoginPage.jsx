import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, ChevronRight, LockKeyhole, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister 
        ? { username, email, password } 
        : { email, password };

      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call success handler
      onLoginSuccess({
        name: data.user.username,
        email: data.user.email,
        _id: data.user._id,
        token: data.token
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (profile) => {
    setLoading(true);
    setError('');
    try {
      const email = profile.email;
      const username = profile.name.toLowerCase();
      const password = 'password123';

      let res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        // If login fails, try registering them
        res = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLoginSuccess({
        name: data.user.username,
        email: data.user.email,
        _id: data.user._id,
        token: data.token,
        role: profile.role,
        experienceYears: profile.experienceYears,
        skills: profile.skills
      });
    } catch (err) {
      console.warn("Backend unavailable during demo login, falling back to mock UI session:", err.message);
      // Fallback if offline
      onLoginSuccess({
        name: profile.name,
        email: profile.email,
        _id: 'mock-user-id',
        token: 'mock-token',
        role: profile.role,
        experienceYears: profile.experienceYears,
        skills: profile.skills
      });
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-xl font-bold text-gray-100">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRegister ? 'Sign up to start taking customized AI interviews' : 'Access your personalized AI mock interview dashboard'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Full Name / Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="chandan"
                  className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-xs text-gray-200 placeholder-gray-600"
                />
              </div>
            </div>
          )}

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
            {loading ? (isRegister ? 'Registering...' : 'Authenticating...') : (isRegister ? 'Sign Up' : 'Sign In')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-brandBlue hover:underline transition-all"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Separator line */}
        <div className="relative my-6 text-center">
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
