import React from 'react';

export default function InterviewerAvatar({ isTalking = false, isThinking = false, avatarType = 'Sarah' }) {
  const isSarah = avatarType === 'Sarah';

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Outer sphere with radial glow based on state and interviewer type */}
      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 bg-gradient-to-br from-darkSurface to-gray-900 border-2 ${
        isTalking 
          ? (isSarah 
              ? 'border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.4)] animate-avatar-bounce' 
              : 'border-brandBlue shadow-[0_0_25px_rgba(59,130,246,0.4)] animate-avatar-bounce') 
          : isThinking 
            ? 'border-brandPurple shadow-[0_0_25px_rgba(139,92,246,0.4)] animate-pulse' 
            : 'border-darkBorder hover:border-gray-700'
      }`}>
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 rounded-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:10px_10px]" />

        {isSarah ? (
          /* Sarah: Elegant Lady AI Recruiter SVG */
          <svg
            className="w-36 h-36 relative z-10 transition-transform duration-300"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cybernetic Hair Base */}
            <path
              d="M18 50 C18 20, 32 12, 50 12 C68 12, 82 20, 82 50 C82 55, 78 72, 78 72 L72 75 L68 55 L32 55 L28 75 L22 72 C22 72, 18 55, 18 50 Z"
              fill="#312e81"
              stroke="#4f46e5"
              strokeWidth="2.5"
            />

            {/* Main Face Structure */}
            <path
              d="M26 48C26 30 34 22 50 22C66 22 74 30 74 48C74 62 66 70 50 70C34 70 26 62 26 48Z"
              fill="#1e1b4b"
              stroke="#6366f1"
              strokeWidth="2.5"
            />
            
            {/* Cyber Neck Connector */}
            <path d="M42 70 L42 82 L58 82 L58 70 Z" fill="#312e81" stroke="#4f46e5" strokeWidth="2" />
            <line x1="46" y1="76" x2="54" y2="76" stroke="#a78bfa" strokeWidth="2" className={isTalking ? 'animate-pulse' : ''} />

            {/* Smart Glasses */}
            <path
              d="M28 42 H72"
              stroke={isTalking ? '#ec4899' : isThinking ? '#8b5cf6' : '#4f46e5'}
              strokeWidth="2.5"
            />
            {/* Left Lens */}
            <circle cx="38" cy="42" r="8" fill="#1e1b4b" stroke={isTalking ? '#ec4899' : isThinking ? '#8b5cf6' : '#4f46e5'} strokeWidth="2" />
            {/* Right Lens */}
            <circle cx="62" cy="42" r="8" fill="#1e1b4b" stroke={isTalking ? '#ec4899' : isThinking ? '#8b5cf6' : '#4f46e5'} strokeWidth="2" />

            {/* Eyes (Blinking animation) */}
            <g className="animate-avatar-blink origin-center">
              <circle cx="38" cy="42" r="2.5" fill={isTalking ? '#f472b6' : isThinking ? '#c084fc' : '#818cf8'} />
              <circle cx="38" cy="42" r="1" fill="#ffffff" />
              <circle cx="62" cy="42" r="2.5" fill={isTalking ? '#f472b6' : isThinking ? '#c084fc' : '#818cf8'} />
              <circle cx="62" cy="42" r="1" fill="#ffffff" />
            </g>

            {/* Holographic scanner line (active when thinking) */}
            {isThinking && (
              <line
                x1="32"
                y1="42"
                x2="68"
                y2="42"
                stroke="#c084fc"
                strokeWidth="1.5"
                className="animate-bounce"
              />
            )}

            {/* Mouth (Talk animation) */}
            <g transform="translate(50, 58) scale(1, 1)">
              {isTalking ? (
                <rect
                  x="-10"
                  y="-3"
                  width="20"
                  height="6"
                  rx="3"
                  fill="#ec4899"
                  className="animate-avatar-talk origin-center"
                />
              ) : (
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
              )}
            </g>

            {/* Cheek Details */}
            <circle cx="32" cy="52" r="1.5" fill="#f472b6" opacity="0.4" />
            <circle cx="68" cy="52" r="1.5" fill="#f472b6" opacity="0.4" />
          </svg>
        ) : (
          /* David: Lead SDE Male AI Recruiter SVG */
          <svg
            className="w-36 h-36 relative z-10 transition-transform duration-300"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cybernetic Hair Outline (Short/Spiky) */}
            <path
              d="M20 40 L24 24 L32 18 L50 14 L68 18 L76 24 L80 40 L76 45 C76 45, 74 32, 50 32 C26 32, 24 45, 24 45 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="2.5"
            />

            {/* Main Face Structure with Beard Accents */}
            <path
              d="M24 44 C24 28, 30 20, 50 20 C70 20, 76 28, 76 44 C76 58, 68 72, 50 72 C32 72, 24 58, 24 44 Z"
              fill="#0f172a"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />

            {/* Beard Lines */}
            <path d="M25 46 L30 66 L50 72 L70 66 L75 46" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />

            {/* Cyber Neck Connector */}
            <path d="M42 72 L42 82 L58 82 L58 72 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <line x1="46" y1="77" x2="54" y2="77" stroke="#60a5fa" strokeWidth="2" className={isTalking ? 'animate-pulse' : ''} />

            {/* Angular Smart Glasses */}
            <rect x="28" y="38" width="18" height="10" rx="2" fill="#0f172a" stroke={isTalking ? '#3b82f6' : isThinking ? '#8b5cf6' : '#475569'} strokeWidth="2" />
            <rect x="54" y="38" width="18" height="10" rx="2" fill="#0f172a" stroke={isTalking ? '#3b82f6' : isThinking ? '#8b5cf6' : '#475569'} strokeWidth="2" />
            <line x1="46" y1="43" x2="54" y2="43" stroke={isTalking ? '#3b82f6' : isThinking ? '#8b5cf6' : '#475569'} strokeWidth="2.5" />

            {/* Eyes (Blinking animation) */}
            <g className="animate-avatar-blink origin-center">
              <circle cx="37" cy="43" r="2.5" fill={isTalking ? '#60a5fa' : isThinking ? '#c084fc' : '#38bdf8'} />
              <circle cx="37" cy="43" r="1" fill="#ffffff" />
              <circle cx="63" cy="43" r="2.5" fill={isTalking ? '#60a5fa' : isThinking ? '#c084fc' : '#38bdf8'} />
              <circle cx="63" cy="43" r="1" fill="#ffffff" />
            </g>

            {/* Holographic scanner line (active when thinking) */}
            {isThinking && (
              <line
                x1="30"
                y1="43"
                x2="70"
                y2="43"
                stroke="#8b5cf6"
                strokeWidth="1.5"
                className="animate-bounce"
              />
            )}

            {/* Mouth (Talk animation) */}
            <g transform="translate(50, 58) scale(1, 1)">
              {isTalking ? (
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
                <line x1="-10" y1="0" x2="10" y2="0" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
              )}
            </g>
          </svg>
        )}

        {/* Ambient Ring Wavefront */}
        {isTalking && (
          <span className={`absolute flex h-48 w-48 rounded-full border animate-ping pointer-events-none ${
            isSarah ? 'border-pink-500/30' : 'border-brandBlue/30'
          }`} />
        )}
      </div>

      {/* Voice Status Sub-label */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${
          isTalking 
            ? (isSarah ? 'bg-pink-500 animate-ping' : 'bg-brandBlue animate-ping') 
            : isThinking 
              ? 'bg-brandPurple animate-pulse' 
              : 'bg-gray-600'
        }`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {isSarah ? 'Sarah' : 'David'} • {isTalking ? 'Speaking...' : isThinking ? 'AI Thinking...' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
