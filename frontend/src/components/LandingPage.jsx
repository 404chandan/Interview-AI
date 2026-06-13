import React from 'react';
import { Layers, Sparkles, Shield, Cpu, Video, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage({ onEnterPlatform }) {
  const features = [
    {
      title: "Resume Intelligence",
      description: "Extract skills, technologies, and project details using Gemini. Target tracks are customized to your profile.",
      icon: Sparkles,
      color: "text-brandBlue"
    },
    {
      title: "Talking AI Avatar",
      description: "Interactive voice conversations featuring dynamic follow-ups, synchronized lip-sync speech, and real-time STT.",
      icon: Cpu,
      color: "text-brandPurple"
    },
    {
      title: "Monaco Code Sandbox",
      description: "Full compiler sandbox matching LeetCode. Submit, compile, and trigger comprehensive AI code-quality audits.",
      icon: Layers,
      color: "text-brandAccent"
    },
    {
      title: "System Design Whiteboard",
      description: "Interactive design canvas. Drag nodes (databases, caches, queues) and get scored on scalability tradeoffs.",
      icon: Shield,
      color: "text-yellow-400"
    },
    {
      title: "Webcam Gaze & Gaze Analytics",
      description: "Webcam capture that tracks eye contact ratios, speaking confidence, filler word frequencies, and response latency.",
      icon: Video,
      color: "text-red-400"
    }
  ];

  const technologies = [
    { name: "React", type: "Frontend" },
    { name: "Tailwind CSS", type: "Styling" },
    { name: "Node.js / Express", type: "Backend" },
    { name: "Socket.IO", type: "Sockets" },
    { name: "MongoDB / Mongoose", type: "Database" },
    { name: "Google Gemini", type: "GenAI Engine" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in text-left select-none">
      
      {/* Hero Header Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 mb-20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brandBlue/10 border border-brandBlue/20 text-brandBlue text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation AI Interview Coaching</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Master Technical Interviews with{' '}
          <span className="bg-gradient-to-r from-brandBlue via-indigo-400 to-brandPurple bg-clip-text text-transparent">
            Interview AI
          </span>
        </h1>

        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          The flagship GenAI platform combining real-time Monaco compilers, System Design whiteboard canvases, talking avatars, and video camera gaze analytics.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={onEnterPlatform}
            className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-brandBlue to-brandPurple text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-brandBlue/10"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Grids */}
      <div className="space-y-6 mb-24">
        <div>
          <h2 className="text-2xl font-bold text-gray-200">Flagship Capabilities</h2>
          <p className="text-gray-500 text-xs mt-1">An integrated prep system engineered to replicate top-tier technical loops.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="glass-card rounded-xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className={`p-3 bg-darkBg/80 border border-darkBorder rounded-lg w-fit`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-gray-100">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="glass-panel rounded-2xl p-8 flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="space-y-3 lg:max-w-md">
          <h2 className="text-xl font-bold text-gray-100">Engineered Architecture</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Interview AI leverages real-time WebSocket communication, sandboxed VM evaluation, Web Speech API integration, and MERN storage.
          </p>
        </div>

        <div className="flex flex-wrap justify-center lg:justify-start gap-3 max-w-xl">
          {technologies.map((t, idx) => (
            <div key={idx} className="px-4 py-2 rounded-lg bg-darkBg/60 border border-darkBorder flex items-center gap-2.5">
              <CheckCircle className="w-3.5 h-3.5 text-brandAccent" />
              <div>
                <span className="text-xs font-bold text-gray-200 block">{t.name}</span>
                <span className="text-[9px] text-gray-500 block uppercase font-mono">{t.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
