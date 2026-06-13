import React from 'react';

export default function InterviewerAvatar({ isTalking = false, isThinking = false, avatarType = 'Sarah' }) {
  const isSarah = avatarType === 'Sarah';

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Inline Styles for self-contained animations */}
      <style>{`
        @keyframes avatar-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes avatar-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes avatar-talk-mouth {
          0%, 100% { transform: scaleY(0.2) scaleX(0.9); }
          50% { transform: scaleY(1.3) scaleX(1.1); }
        }
        @keyframes avatar-pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.1); }
          50% { box-shadow: 0 0 25px rgba(99, 102, 241, 0.3); }
        }
        .avatar-container {
          animation: avatar-float 4s ease-in-out infinite;
        }
        .eye-blink {
          animation: avatar-blink 5s ease-in-out infinite;
          transform-origin: 50% 42%;
        }
        .mouth-talk {
          animation: avatar-talk-mouth 0.25s ease-in-out infinite;
          transform-origin: 50% 63%;
        }
      `}</style>

      {/* Outer sphere with radial glow based on state and interviewer type */}
      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 bg-gradient-to-br from-darkSurface to-gray-950 border-2 ${
        isTalking 
          ? (isSarah 
              ? 'border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.5)]' 
              : 'border-brandBlue shadow-[0_0_30px_rgba(59,130,246,0.5)]') 
          : isThinking 
            ? 'border-brandPurple shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-pulse' 
            : 'border-darkBorder hover:border-gray-800'
      }`}>
        {/* Futuristic Tech Grid Overlay */}
        <div className="absolute inset-0 rounded-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:12px_12px]" />

        {/* Head Container with float animation */}
        <div className="avatar-container w-36 h-36 relative z-10 flex items-center justify-center">
          {isSarah ? (
            /* Sarah: Stylized Cartoon Female Recruiter Face */
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Back Hair (Purple Bun) */}
              <circle cx="50" cy="24" r="16" fill="#3b0764" />
              
              {/* Shoulders & Jacket */}
              <path
                d="M22 84 C22 74, 32 68, 50 68 C68 68, 78 74, 78 84 L78 95 L22 95 Z"
                fill="#4338ca"
              />
              {/* Shirt V-Neck Collar */}
              <path d="M42 68 L50 78 L58 68 Z" fill="#ffffff" />
              <path d="M45 68 L50 74 L55 68 Z" fill="#db2777" />

              {/* Neck */}
              <path d="M44 60 L44 70 L56 70 L56 60 Z" fill="#ffedd5" />
              <path d="M44 65 C48 68, 52 68, 56 65" stroke="#e4e4e7" strokeWidth="1" />

              {/* Face Base */}
              <path
                d="M30 44 C30 32, 38 24, 50 24 C62 24, 70 32, 70 44 C70 54, 60 62, 50 62 C40 62, 30 54, 30 44 Z"
                fill="#ffe4e6" // Soft rosy tone
              />

              {/* Cheeks blush */}
              <ellipse cx="36" cy="48" rx="4" ry="2" fill="#f472b6" opacity="0.4" />
              <ellipse cx="64" cy="48" rx="4" ry="2" fill="#f472b6" opacity="0.4" />

              {/* Eye lashes / closed lids (blinking container) */}
              <g className="eye-blink">
                {/* Left Eye */}
                <ellipse cx="40" cy="40" rx="3.5" ry="4" fill="#ffffff" />
                <circle cx="40" cy="40" r="2.2" fill="#4f46e5" />
                <circle cx="41.2" cy="38.8" r="0.8" fill="#ffffff" />
                <path d="M36 38 C38 36, 42 36, 44 38" stroke="#3b0764" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Right Eye */}
                <ellipse cx="60" cy="40" rx="3.5" ry="4" fill="#ffffff" />
                <circle cx="60" cy="40" r="2.2" fill="#4f46e5" />
                <circle cx="61.2" cy="38.8" r="0.8" fill="#ffffff" />
                <path d="M56 38 C58 36, 62 36, 64 38" stroke="#3b0764" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Glasses Frame (Pink Chic) */}
              <path
                d="M30 40 H70"
                stroke="#db2777"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect x="33" y="34" width="13" height="11" rx="3.5" fill="none" stroke="#db2777" strokeWidth="1.8" />
              <rect x="54" y="34" width="13" height="11" rx="3.5" fill="none" stroke="#db2777" strokeWidth="1.8" />

              {/* Nose */}
              <path d="M49 45 L50 49 L51 45" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" fill="none" />

              {/* Hair Front Bangs */}
              <path
                d="M28 36 C32 20, 68 20, 72 36 C72 36, 68 26, 50 26 C32 26, 28 36, 28 36 Z"
                fill="#581c87"
              />
              <path
                d="M28 36 C27 44, 29 52, 29 52 L32 50 C32 50, 31 42, 31 38"
                fill="#581c87"
              />
              <path
                d="M72 36 C73 44, 71 52, 71 52 L68 50 C68 50, 69 42, 69 38"
                fill="#581c87"
              />

              {/* Mouth (Talk / Smile) */}
              {isTalking ? (
                /* Dynamic open mouth */
                <ellipse
                  cx="50"
                  cy="53"
                  rx="4"
                  ry="5"
                  fill="#9d174d"
                  className="mouth-talk"
                />
              ) : (
                /* Static sweet smile */
                <path
                  d="M45 52 Q50 56 55 52"
                  stroke="#db2777"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          ) : (
            /* David: Stylized Cartoon Male Recruiter Face */
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shoulders & Suit Jacket */}
              <path
                d="M22 84 C22 74, 32 68, 50 68 C68 68, 78 74, 78 84 L78 95 L22 95 Z"
                fill="#1e293b"
              />
              {/* White Shirt Collar & Blue Tie */}
              <path d="M40 68 L50 78 L60 68 Z" fill="#ffffff" />
              <path d="M47 70 L50 92 L53 70 Z" fill="#2563eb" />

              {/* Neck */}
              <path d="M44 60 L44 70 L56 70 L56 60 Z" fill="#ffedd5" />

              {/* Face Base */}
              <path
                d="M30 42 C30 30, 37 23, 50 23 C63 23, 70 30, 70 42 C70 53, 62 62, 50 62 C38 62, 30 53, 30 42 Z"
                fill="#fed7aa" // Healthy peach skin
              />

              {/* Hair (Spiky Slate) */}
              <path
                d="M28 32 C26 22, 36 12, 50 12 C64 12, 74 22, 72 32 C70 24, 62 18, 50 18 C38 18, 30 24, 28 32 Z"
                fill="#1e293b"
              />
              {/* Hair Spikes */}
              <path d="M36 15 L32 8 L42 12 Z" fill="#1e293b" />
              <path d="M46 13 L47 5 L53 11 Z" fill="#1e293b" />
              <path d="M57 14 L62 7 L64 15 Z" fill="#1e293b" />

              {/* Stubble / Beard outline */}
              <path
                d="M30 44 C30 56, 38 62, 50 62 C62 62, 70 56, 70 44 L70 48 C70 57, 60 64, 50 64 C40 64, 30 57, 30 48 Z"
                fill="#475569"
                opacity="0.65"
              />

              {/* Eyes blinking */}
              <g className="eye-blink">
                {/* Left Eye */}
                <ellipse cx="40" cy="39" rx="3.5" ry="3.5" fill="#ffffff" />
                <circle cx="40" cy="39" r="2" fill="#1e293b" />
                <circle cx="41" cy="38" r="0.6" fill="#ffffff" />
                <path d="M36 36 H44" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Right Eye */}
                <ellipse cx="60" cy="39" rx="3.5" ry="3.5" fill="#ffffff" />
                <circle cx="60" cy="39" r="2" fill="#1e293b" />
                <circle cx="61" cy="38" r="0.6" fill="#ffffff" />
                <path d="M56 36 H64" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Bold Smart Glasses (Blue-Grey Frames) */}
              <path
                d="M30 39 H70"
                stroke="#334155"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="33" y="34" width="13" height="9" rx="2" fill="none" stroke="#334155" strokeWidth="2" />
              <rect x="54" y="34" width="13" height="9" rx="2" fill="none" stroke="#334155" strokeWidth="2" />

              {/* Nose */}
              <path d="M49 44 L50 48 L51 44" stroke="#c2410c" strokeWidth="1.2" strokeLinecap="round" fill="none" />

              {/* Mouth (Talk / Smile) */}
              {isTalking ? (
                /* Dynamic open mouth */
                <ellipse
                  cx="50"
                  cy="53"
                  rx="4.5"
                  ry="4.5"
                  fill="#450a0a"
                  className="mouth-talk"
                />
              ) : (
                /* Classic subtle line smile */
                <path
                  d="M44 52 Q50 55 56 52"
                  stroke="#1e293b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          )}
        </div>

        {/* Outer Wavefront rings pulsing on talk */}
        {isTalking && (
          <span className={`absolute flex h-48 w-48 rounded-full border animate-ping pointer-events-none ${
            isSarah ? 'border-pink-500/35' : 'border-blue-500/35'
          }`} />
        )}
      </div>

      {/* Voice Status Sub-label */}
      <div className="mt-4 flex items-center gap-2 bg-darkSurface/65 border border-darkBorder/40 px-3 py-1 rounded-full backdrop-blur-sm">
        <span className={`w-2 h-2 rounded-full ${
          isTalking 
            ? (isSarah ? 'bg-pink-500 animate-pulse' : 'bg-brandBlue animate-pulse') 
            : isThinking 
              ? 'bg-brandPurple animate-pulse' 
              : 'bg-gray-500'
        }`} />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-300">
          {isSarah ? 'Sarah (AI Recruiter)' : 'David (Lead SDE)'} • {isTalking ? 'Speaking' : isThinking ? 'Analyzing' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
