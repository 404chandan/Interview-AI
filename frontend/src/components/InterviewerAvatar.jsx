import React from 'react';

export default function InterviewerAvatar({ isTalking = false, isThinking = false }) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Outer sphere with radial glow based on state */}
      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 bg-gradient-to-br from-darkSurface to-gray-900 border-2 ${
        isTalking 
          ? 'border-brandBlue shadow-[0_0_25px_rgba(59,130,246,0.4)] animate-avatar-bounce' 
          : isThinking 
            ? 'border-brandPurple shadow-[0_0_25px_rgba(139,92,246,0.4)] animate-pulse' 
            : 'border-darkBorder hover:border-gray-700'
      }`}>
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 rounded-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:10px_10px]" />

        {/* AI Robot Face SVG */}
        <svg
          className="w-36 h-36 relative z-10 transition-transform duration-300"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Helmet Head Structure */}
          <path
            d="M20 50C20 30 30 20 50 20C70 20 80 30 80 50C80 65 72 75 50 75C28 75 20 65 20 50Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="3"
          />
          
          {/* Side Ears / Antenna connections */}
          <rect x="14" y="44" width="6" height="12" rx="3" fill="#64748b" />
          <rect x="80" y="44" width="6" height="12" rx="3" fill="#64748b" />

          {/* Dark Glass Visor Screen */}
          <path
            d="M26 42C26 36 32 32 50 32C68 32 74 36 74 42C74 48 68 52 50 52C32 52 26 48 26 42Z"
            fill="#0f172a"
            stroke={isTalking ? '#3b82f6' : isThinking ? '#8b5cf6' : '#334155'}
            strokeWidth="2"
          />

          {/* Eyes (Blinking animation) */}
          <g className="animate-avatar-blink origin-center">
            {/* Left Eye */}
            <circle cx="40" cy="42" r="3.5" fill={isTalking ? '#60a5fa' : isThinking ? '#c084fc' : '#38bdf8'} />
            <circle cx="40" cy="42" r="1.5" fill="#ffffff" />

            {/* Right Eye */}
            <circle cx="60" cy="42" r="3.5" fill={isTalking ? '#60a5fa' : isThinking ? '#c084fc' : '#38bdf8'} />
            <circle cx="60" cy="42" r="1.5" fill="#ffffff" />
          </g>

          {/* Holographic scanner line (active when thinking) */}
          {isThinking && (
            <line
              x1="28"
              y1="42"
              x2="72"
              y2="42"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              className="animate-bounce"
            />
          )}

          {/* Mouth (Talk animation) */}
          <g transform="translate(50, 62) scale(1, 1)">
            {isTalking ? (
              // Moving waveform mouth
              <rect
                x="-12"
                y="-3"
                width="24"
                height="6"
                rx="3"
                fill="#3b82f6"
                className="animate-avatar-talk origin-center"
              />
            ) : (
              // Static mouth line
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>

          {/* Head Cheek Accents */}
          <circle cx="30" cy="60" r="2.5" fill="#475569" opacity="0.5" />
          <circle cx="70" cy="60" r="2.5" fill="#475569" opacity="0.5" />
        </svg>

        {/* Ambient Ring Wavefront */}
        {isTalking && (
          <span className="absolute flex h-48 w-48 rounded-full border border-brandBlue/30 animate-ping pointer-events-none" />
        )}
      </div>

      {/* Voice Status Sub-label */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isTalking ? 'bg-brandBlue animate-ping' : isThinking ? 'bg-brandPurple animate-pulse' : 'bg-gray-600'}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {isTalking ? 'Speaking...' : isThinking ? 'AI Thinking...' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
