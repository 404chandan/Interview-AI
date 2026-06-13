import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import InterviewerAvatar from './InterviewerAvatar';
import CodingSandbox from './CodingSandbox';
import Whiteboard from './Whiteboard';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, ShieldAlert, Sparkles, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function InterviewSession({ interviewData, resumeData, onInterviewFinished }) {
  const [currentRound, setCurrentRound] = useState(1); // 1: Resume, 2: DSA, 3: System Design, 4: Behavioral
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('Hello! Let\'s begin by reviewing your resume.');
  
  const [isTalking, setIsTalking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  // Webcam & Audio control
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [speechVolume, setSpeechVolume] = useState(true);
  
  // Real-time camera analytics state
  const [cameraMetrics, setCameraMetrics] = useState({
    eyeContactScore: 80,
    confidenceScore: 85,
    fillerWordsCount: 0,
    avgResponseTime: 2.5,
    speechClarityScore: 90,
    speakingPace: 'Normal'
  });

  const [transcript, setTranscript] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [roundStep, setRoundStep] = useState(0); // tracks steps inside each round
  const [finished, setFinished] = useState(false);
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'typing'
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [latency, setLatency] = useState(24);
  const [timeLeft, setTimeLeft] = useState(300);
  const [showProceedButton, setShowProceedButton] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);

  const mainVideoRef = useRef(null);
  const pipVideoRef = useRef(null);
  const sidebarVideoRef = useRef(null);
  const persistentVideoRef = useRef(null);

  // Timer Effect
  useEffect(() => {
    const roundTimes = {
      1: 300, // 5 min
      2: 900, // 15 min
      3: 600, // 10 min
      4: 300  // 5 min
    };
    setTimeLeft(roundTimes[currentRound] || 300);
  }, [currentRound]);

  useEffect(() => {
    if (finished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRound, finished]);

  const handleTimerExpiry = () => {
    alert("Time has expired for this round! Automatically advancing.");
    advanceRound();
  };

  const handleSkipQuestion = async () => {
    setIsThinking(true);
    try {
      await getQuestion(currentRound);
    } catch (err) {
      console.error("Failed to skip question:", err);
    } finally {
      setIsThinking(false);
    }
  };

  // Latency simulator for the real-time card
  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(prev => Math.max(16, Math.min(38, prev + (Math.random() > 0.5 ? 2 : -2))));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Typewriter reveal effect for interviewer questions
  useEffect(() => {
    let index = 0;
    setDisplayedQuestion('');
    
    // Quick conversational reveal speed: 12ms per character
    const interval = setInterval(() => {
      index++;
      setDisplayedQuestion(questionText.slice(0, index));
      if (index >= questionText.length) {
        clearInterval(interval);
      }
    }, 12);
    
    return () => clearInterval(interval);
  }, [questionText]);

  const micOnRef = useRef(micOn);
  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const sessionFillersCountRef = useRef(0);
  const voicesLoadedRef = useRef(false);

  // Pre-warm speech synthesis voices (Chrome loads them async)
  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) return;
    
    // Force initial load
    synth.getVoices();
    
    const handleVoicesChanged = () => {
      voicesLoadedRef.current = true;
    };
    synth.addEventListener('voiceschanged', handleVoicesChanged);
    return () => synth.removeEventListener('voiceschanged', handleVoicesChanged);
  }, []);

  const interviewId = interviewData?._id || 'mock-interview';
  const roleName = resumeData?.role || 'Backend Engineer';

  // 1. Initialize Sockets
  useEffect(() => {
    socketRef.current = io(BACKEND_URL);
    socketRef.current.emit('join-session', interviewId);

    socketRef.current.on('metrics-realtime', (metrics) => {
      setCameraMetrics(prev => ({ ...prev, ...metrics }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [interviewId]);

  // 2. Initialize Camera Feed
  useEffect(() => {
    if (cameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          setWebcamStream(stream);
        })
        .catch((err) => {
          console.warn("Camera access denied or missing hardware:", err.message);
          setCameraOn(false);
        });
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
    }
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn]);

  const aiActive = isTalking || isThinking;

  // Callback refs to bind the webcam stream immediately when elements mount
  const setMainVideo = (el) => {
    mainVideoRef.current = el;
    if (el && webcamStream) el.srcObject = webcamStream;
  };

  const setPipVideo = (el) => {
    pipVideoRef.current = el;
    if (el && webcamStream) el.srcObject = webcamStream;
  };

  const setSidebarVideo = (el) => {
    sidebarVideoRef.current = el;
    if (el && webcamStream) el.srcObject = webcamStream;
  };

  // Re-apply stream if webcamStream state updates
  useEffect(() => {
    if (webcamStream) {
      if (mainVideoRef.current) mainVideoRef.current.srcObject = webcamStream;
      if (pipVideoRef.current) pipVideoRef.current.srcObject = webcamStream;
      if (sidebarVideoRef.current) sidebarVideoRef.current.srcObject = webcamStream;
      if (persistentVideoRef.current) persistentVideoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // 3. Initialize Web Speech API for TTS & STT
  useEffect(() => {
    // Check SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false; // Disable interim results for clean, stable inputs
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        sessionFillersCountRef.current = 0;
      };

      rec.onresult = (event) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        const cleanTranscript = finalTranscript.trim();
        if (cleanTranscript) {
          setTranscript(cleanTranscript);

          // Scan for filler words in the entire accumulated transcript of this session
          const fillerList = ['umm', 'like', 'basically', 'actually', 'uh', 'um'];
          let fillersFound = 0;
          fillerList.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = cleanTranscript.match(regex);
            if (matches) fillersFound += matches.length;
          });
          
          const newFillers = fillersFound - sessionFillersCountRef.current;
          if (newFillers > 0) {
            setCameraMetrics(prev => ({
              ...prev,
              fillerWordsCount: prev.fillerWordsCount + newFillers
            }));
            sessionFillersCountRef.current = fillersFound;
          }
        }
      };

      rec.onend = () => {
        // Automatically restart speech recognition if it timeouts but mic state is still on
        if (micOnRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started
          }
        }
      };

      rec.onerror = (e) => {
        console.warn("Speech Recognition Error: ", e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          micOnRef.current = false;
          setMicOn(false);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        micOnRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // 4. Trigger Speech Synthesis (TTS) with gender-appropriate voice
  const speakText = (text) => {
    if (!synthRef.current || !speechVolume) return;
    
    // Stop any active speak
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsTalking(true);
    utterance.onend = () => setIsTalking(false);
    utterance.onerror = () => setIsTalking(false);

    // Pick a female voice for Sarah avatar, male voice for David
    const avatarName = interviewData?.interviewerAvatar || 'Sarah';
    const isFemale = avatarName.toLowerCase() === 'sarah';
    const voices = synthRef.current.getVoices();
    
    if (voices.length > 0) {
      // Try to find a matching gender voice
      let selectedVoice = null;
      if (isFemale) {
        // Prefer well-known female voices
        selectedVoice = voices.find(v => /zira|female|samantha|victoria|karen|fiona|hazel|susan|jenny|aria/i.test(v.name));
        // Fallback: pick any English voice that isn't known-male
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en') && !/david|mark|james|daniel|george|male/i.test(v.name));
        }
      } else {
        // Male voice
        selectedVoice = voices.find(v => /david|mark|james|daniel|george|male/i.test(v.name));
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en'));
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.rate = 1.0;
    utterance.pitch = isFemale ? 1.15 : 0.95;
    
    synthRef.current.speak(utterance);
  };

  // 5. Toggle Microphone (STT Capture)
  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your responses.");
      return;
    }

    if (micOn) {
      recognitionRef.current.stop();
      setMicOn(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setMicOn(true);
    }
  };

  // 6. Fetch Next Question
  const getQuestion = async (round) => {
    setIsThinking(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/${interviewId}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round: round === 1 ? 'resume' : (round === 2 ? 'dsa' : (round === 3 ? 'system_design' : 'behavioral')),
          resumeId: resumeData?._id
        })
      });

      if (!res.ok) throw new Error("Question api failure");
      const data = await res.json();
      setCurrentQuestion(data.question);
      setQuestionText(data.question.questionText);
      speakText(data.question.questionText);

      // Automatically reactivate microphone for verbal rounds if in Voice Mode
      if ((round === 1 || round === 4) && inputMode === 'voice' && !micOn && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setMicOn(true);
          } catch (e) {}
        }, 1500);
      }
    } catch (err) {
      console.warn("Offline fallback for question retrieval.");
      
      let mockQuestion;
      if (round === 1) {
        mockQuestion = {
          _id: 'mock-q-1-' + Date.now(),
          questionText: "Let's review your experience at Siemens DISW. You automated InsightPro workflows. Can you explain the tech layout and how Redis caching was integrated?",
          difficulty: 'medium',
          topics: ['Resume', 'Backend']
        };
      } else if (round === 2) {
        mockQuestion = {
          _id: 'mock-q-2-' + Date.now(),
          questionText: "Write a function to return the indices of two elements in an array that add up to a target value.",
          codeTemplate: "function twoSum(nums, target) {\n    // Write your code here\n};",
          difficulty: 'easy',
          topics: ['Arrays', 'Hash Map'],
          id: 'two-sum',
          functionName: 'twoSum'
        };
      } else if (round === 3) {
        mockQuestion = {
          _id: 'mock-q-3-' + Date.now(),
          questionText: "Design a URL shortener service (like TinyURL) that handles 100M redirects daily. Draw your whiteboard design and explain caching tradeoffs.",
          difficulty: 'medium',
          topics: ['System Design', 'Caching']
        };
      } else {
        mockQuestion = {
          _id: 'mock-q-4-' + Date.now(),
          questionText: "Tell me about a time when you had to prioritize architectural features under a very tight deployment deadline.",
          difficulty: 'medium',
          topics: ['Behavioral']
        };
      }
      
      setCurrentQuestion(mockQuestion);
      setQuestionText(mockQuestion.questionText);
      speakText(mockQuestion.questionText);
    } finally {
      setIsThinking(false);
    }
  };

  // Fetch initial question on mount
  useEffect(() => {
    setTimeout(() => {
      speakText("Hello! Let's begin by reviewing your resume. I analyzed your profile at Siemens.");
      getQuestion(1);
      
      // Auto start mic for first question
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setMicOn(true);
        } catch (e) {}
      }
    }, 1000);
  }, []);

  // 7. Submit Verbal Answer (Round 1 & Round 4)
  const handleSubmitAnswer = async () => {
    const textToSubmit = transcript.trim();
    if (!textToSubmit) return;
    setSubmittingAnswer(true);
    setTranscript(''); // Clear immediately so it is ready for continuous dictation

    // Stop recognition to clear event.results session state for the next question
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recognition on answer submission:", e);
      }
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/${interviewId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion?._id || 'mock-id',
          answerText: textToSubmit,
          round: currentRound === 1 ? 'resume' : 'behavioral'
        })
      });

      if (!res.ok) throw new Error("Answer API error");
      const data = await res.json();
      
      // Setup dynamic AI follow-up (2 questions total per verbal round: 1 initial + 1 follow-up)
      if (roundStep < 1 && (currentRound === 1 || currentRound === 4)) {
        setRoundStep(prev => prev + 1);
        const nextFollowUp = data.evaluation.followUpQuestion || "Could you please elaborate on that experience or answer?";
        setQuestionText(nextFollowUp);
        speakText(nextFollowUp);
        setTranscript('');
      } else {
        // Round complete, show transition guided proceed screen
        setShowProceedButton(true);
      }
    } catch (err) {
      console.warn("Answer submission offline fallback.");
      if (roundStep < 1 && (currentRound === 1 || currentRound === 4)) {
        setRoundStep(prev => prev + 1);
        const fallbackQuestions = currentRound === 1 
          ? [
              "That makes sense. How did you handle testing and performance optimization on that backend stack?"
            ]
          : [
              "Thank you for sharing. How did this experience change the way you interact with similar peers or situations?"
            ];
        const followUp = fallbackQuestions[roundStep] || "Can you tell me more about that?";
        setQuestionText(followUp);
        speakText(followUp);
        setTranscript('');
      } else {
        setShowProceedButton(true);
      }
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // 8. Handle DSA Code submission
  const handleCodeSubmitted = (submission) => {
    // Wait for the candidate to review their coding results, then set proceed
    setTimeout(() => {
      setShowProceedButton(true);
    }, 3500); // give them 3.5s to read the initial score, then transition to proceed screen
  };

  // 9. Handle System Design Submission
  const handleDesignSubmitted = (evaluation) => {
    setTimeout(() => {
      setShowProceedButton(true);
    }, 4000);
  };

  const handleProceedNext = () => {
    setShowProceedButton(false);
    advanceRound();
  };

  const renderTransitionPanel = () => {
    const roundNames = {
      1: "Resume Deep Dive",
      2: "DSA Coding Sandbox",
      3: "System Design Architecture",
      4: "Behavioral & Situation Assessment"
    };

    const roundDescriptions = {
      1: "Your resume profile, experiences, and technical backgrounds have been reviewed. Ready to proceed to the live coding round?",
      2: "Your coding implementation and algorithm efficiency have been evaluated. Ready to proceed to the system architecture design round?",
      3: "Your system architecture whiteboard schema has been analyzed. Ready to proceed to the behavioral questions?",
      4: "All assessment metrics have been gathered. Ready to finalize the interview and generate your performance dossier?"
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto h-full">
        <div className="w-16 h-16 rounded-full bg-brandBlue/15 border border-brandBlue/30 flex items-center justify-center text-brandBlue mb-6 animate-pulse">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Round {currentRound} Complete!
        </h2>
        <p className="text-sm text-brandBlue font-semibold mb-6 uppercase tracking-wider">
          {roundNames[currentRound]}
        </p>

        <div className="bg-darkSurface border border-darkBorder rounded-xl p-5 mb-8 w-full text-left">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Round Summary</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            {roundDescriptions[currentRound]}
          </p>
        </div>

        {/* Progress Timeline */}
        <div className="flex items-center justify-between w-full mb-8 px-4 text-[10px] text-gray-400 font-semibold relative">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-darkBorder z-0 -translate-y-1/2" />
          {[1, 2, 3, 4].map((r) => (
            <div key={r} className="relative z-10 flex flex-col items-center gap-1 bg-darkBg px-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                r < currentRound
                  ? 'bg-brandBlue border-brandBlue text-white'
                  : r === currentRound
                  ? 'border-brandBlue text-brandBlue bg-brandBlue/10 animate-pulse'
                  : 'border-darkBorder text-gray-500 bg-darkBg'
              }`}>
                {r < currentRound ? '✓' : r}
              </div>
              <span className={r === currentRound ? 'text-brandBlue font-bold' : 'text-gray-500'}>
                Round {r}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleProceedNext}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple hover:from-blue-600 hover:to-purple-600 text-white text-sm font-bold transition-all shadow-lg shadow-brandBlue/20 transform hover:-translate-y-0.5"
        >
          {currentRound === 4 ? (
            <>
              <Sparkles className="w-4 h-4" />
              Finish & Generate Overall Report
            </>
          ) : (
            <>
              Proceed to Round {currentRound + 1}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  };

  // 10. Advance Round State Machine
  const advanceRound = () => {
    setTranscript('');
    setRoundStep(0);
    const nextRound = currentRound + 1;
    
    // Stop recognition to clear session state
    if (recognitionRef.current) {
      if (nextRound === 2 || nextRound === 3) {
        micOnRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        setMicOn(false);
      } else {
        // Verbal round: restart it
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
    
    if (nextRound > 4) {
      handleFinishInterview();
    } else {
      setCurrentRound(nextRound);
      getQuestion(nextRound);
    }
  };

  // 11. Conclude Interview
  const handleFinishInterview = async () => {
    setFinished(true);
    setIsThinking(true);
    
    if (recognitionRef.current) {
      micOnRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setMicOn(false);
    }
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/${interviewId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cameraMetrics })
      });

      if (res.ok) {
        onInterviewFinished(interviewId);
      } else {
        throw new Error("Report compile error");
      }
    } catch (err) {
      console.warn("Report compile failed, navigating to report dashboard.");
      onInterviewFinished(interviewId);
    } finally {
      setIsThinking(false);
    }
  };

  // Simulating live camera posture analytics triggers
  useEffect(() => {
    const interval = setInterval(() => {
      if (cameraOn) {
        // Randomly simulate eye contact fluctuations and posture
        const lookAway = Math.random() > 0.85;
        const newEyeContact = Math.max(50, Math.min(100, cameraMetrics.eyeContactScore + (lookAway ? -12 : Math.floor(Math.random() * 5) - 2)));
        const newConfidence = Math.max(50, Math.min(100, cameraMetrics.confidenceScore + (lookAway ? -4 : Math.floor(Math.random() * 3) - 1)));
        
        setCameraMetrics(prev => ({
          ...prev,
          eyeContactScore: Math.round(newEyeContact),
          confidenceScore: Math.round(newConfidence)
        }));

        if (lookAway && socketRef.current) {
          socketRef.current.emit('camera-telemetry', {
            interviewId,
            metrics: { eyeContactScore: Math.round(newEyeContact) }
          });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [cameraOn, cameraMetrics]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-left">
      
      {/* Upper Status Ribbon */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-darkSurface border border-darkBorder rounded-xl p-4 mb-6 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-brandBlue/10 border border-brandBlue/30 text-brandBlue font-bold uppercase tracking-wider">
            Round {currentRound} of 4: {currentRound === 1 ? 'Resume Deep Dive' : (currentRound === 2 ? 'DSA coding' : (currentRound === 3 ? 'System Design' : 'Behavioral'))}
          </span>
          <span className="text-gray-400">Position: <strong className="text-gray-200">{roleName}</strong></span>
        </div>

        <div className="flex items-center gap-4">
          {/* Countdown Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 font-mono font-bold ${
            timeLeft < 60 
              ? 'border-red-500/30 bg-red-500/10 text-red-500 animate-pulse' 
              : 'border-darkBorder bg-darkBg text-gray-300'
          }`}>
            <span className={`w-2 h-2 rounded-full bg-current ${timeLeft < 60 ? 'animate-ping' : ''}`} />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Media Controls */}
            <button 
              onClick={() => setCameraOn(!cameraOn)} 
              className={`p-2 rounded-lg border transition-all ${cameraOn ? 'border-brandBlue bg-brandBlue/15 text-brandBlue' : 'border-darkBorder bg-darkBg text-gray-500 hover:text-white'}`}
            >
              {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
            
            <button 
              onClick={handleMicToggle} 
              className={`p-2 rounded-lg border transition-all ${micOn ? 'border-brandAccent bg-brandAccent/15 text-brandAccent animate-pulse' : 'border-darkBorder bg-darkBg text-gray-500 hover:text-white'}`}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button 
              onClick={() => setSpeechVolume(!speechVolume)} 
              className={`p-2 rounded-lg border transition-all ${speechVolume ? 'border-brandPurple bg-brandPurple/15 text-brandPurple' : 'border-darkBorder bg-darkBg text-gray-500 hover:text-white'}`}
            >
              {speechVolume ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch h-[640px] max-h-[calc(100vh-190px)] min-h-[580px] select-none">
        
        {/* Left Side: Avatar Panel & Webcam & Telemetry (Only for non-verbal rounds when not showing proceed) */}
        {!showProceedButton && !(currentRound === 1 || currentRound === 4) && (
          <div className="lg:col-span-1 flex flex-col gap-4 h-full">
            
            {/* AI Avatar Display */}
            <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center h-[260px] relative shrink-0">
              <InterviewerAvatar isTalking={isTalking} isThinking={isThinking} avatarType={interviewData?.interviewerAvatar || 'Sarah'} />
            </div>

            {/* Candidate Camera Stream */}
            <div className="glass-panel rounded-xl p-3 overflow-hidden relative flex-1 min-h-[140px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-black">
                {cameraOn ? (
                  <video 
                    ref={setSidebarVideo}
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-contain transform scale-x-[-1] bg-black"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    Camera Feed Off
                  </div>
                )}
              </div>

              {/* Overlap Real-time Telemetry Stats */}
              <div className="absolute top-2 left-2 right-2 flex justify-between gap-2 pointer-events-none text-[9px] font-bold">
                <span className="px-2 py-0.5 bg-black/70 border border-brandBlue/30 text-brandBlue rounded backdrop-blur">
                  Eye: {cameraMetrics.eyeContactScore}%
                </span>
                <span className="px-2 py-0.5 bg-black/70 border border-brandPurple/30 text-brandPurple rounded backdrop-blur">
                  Confidence: {cameraMetrics.confidenceScore}%
                </span>
              </div>
              
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-none text-[9px] font-bold">
                <span className="px-2 py-0.5 bg-black/70 text-gray-300 rounded backdrop-blur">
                  Fillers: {cameraMetrics.fillerWordsCount}
                </span>
                {cameraMetrics.eyeContactScore < 70 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600/90 text-white rounded animate-pulse shadow">
                    <ShieldAlert className="w-2.5 h-2.5" /> Gaze Warning
                  </span>
                )}
              </div>
            </div>

            {/* AI Core Telemetry Panel */}
            <div className="glass-panel rounded-xl p-3 h-[100px] shrink-0 text-[10px] flex flex-col justify-between border-brandBlue/10 bg-darkSurface/40">
              <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-wider border-b border-darkBorder/40 pb-1.5">
                <span>AI Core Telemetry</span>
                <span className="flex items-center gap-1 text-brandAccent animate-pulse">
                  <span className="w-1.5 h-1.5 bg-brandAccent rounded-full" /> Connected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-1.5 text-gray-300 mt-1 font-mono">
                <div className="flex justify-between pr-2 border-r border-darkBorder/30">
                  <span className="text-gray-500">Latency:</span>
                  <span className="font-bold text-gray-200">{latency}ms</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-gray-500">Packet Loss:</span>
                  <span className="font-bold text-brandAccent">0.00%</span>
                </div>
                <div className="flex justify-between pr-2 border-r border-darkBorder/30">
                  <span className="text-gray-500">Voice Sync:</span>
                  <span className="font-bold text-brandBlue">96kbps</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-gray-500">AI Engine:</span>
                  <span className="font-bold text-brandPurple">v3.5</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Main Workspace Panel */}
        <div className={`${
          (showProceedButton || currentRound === 1 || currentRound === 4) 
            ? 'lg:col-span-4' 
            : 'lg:col-span-3'
        } flex flex-col bg-darkSurface border border-darkBorder rounded-xl overflow-hidden h-full`}>
          
          {showProceedButton ? (
            // Round Transition Panel
            renderTransitionPanel()
          ) : currentRound === 1 || currentRound === 4 ? (
            // Verbal Rounds Layout (Resume & Behavioral)
            <div className="flex-1 flex flex-col justify-between p-6 h-full min-h-0 overflow-y-auto">
              
              {/* Active-Speaker Video Call Stage */}
              <div className="relative w-full h-[360px] bg-black rounded-xl overflow-hidden border border-darkBorder flex items-center justify-center shrink-0 mb-6">

                {/* Persistent camera video element — never unmounted */}
                {cameraOn && (
                  <video
                    ref={(el) => {
                      persistentVideoRef.current = el;
                      if (el && webcamStream) el.srcObject = webcamStream;
                    }}
                    autoPlay
                    muted
                    playsInline
                    className={`absolute transform scale-x-[-1] bg-black transition-all duration-300 ease-in-out z-10 ${
                      aiActive
                        ? 'bottom-4 right-4 w-40 h-28 rounded-lg border border-brandBlue shadow-lg'
                        : 'inset-0 w-full h-full object-contain rounded-xl'
                    }`}
                    style={aiActive ? {} : { position: 'absolute', top: 0, left: 0 }}
                  />
                )}

                {/* AI Interviewer layer */}
                <div className={`absolute transition-all duration-300 ease-in-out flex items-center justify-center ${
                  aiActive
                    ? 'inset-0 w-full h-full bg-gradient-to-b from-darkSurface to-black z-0'
                    : 'bottom-4 right-4 w-28 h-28 bg-darkSurface/90 rounded-lg border border-darkBorder shadow-lg z-20'
                }`}>
                  <div className={aiActive ? 'scale-125' : 'scale-50'}>
                    <InterviewerAvatar isTalking={isTalking} isThinking={isThinking} avatarType={interviewData?.interviewerAvatar || 'Sarah'} />
                  </div>
                  {!aiActive && (
                    <div className="absolute bottom-1 left-1 bg-black/60 text-[8px] font-semibold text-white px-1 py-0.5 rounded">
                      Interviewer ({interviewData?.interviewerAvatar || 'Sarah'})
                    </div>
                  )}
                </div>

                {/* Candidate label when candidate is large */}
                {aiActive && cameraOn && (
                  <div className="absolute bottom-4 right-4 z-20 pointer-events-none" style={{ bottom: '4.5rem', right: '1rem' }}>
                  </div>
                )}
                {aiActive && cameraOn && (
                  <div className="absolute z-20 text-[8px] font-semibold text-white px-1 py-0.5 rounded bg-black/60" style={{ bottom: '1.15rem', right: '1.15rem' }}>
                    You (Candidate)
                  </div>
                )}

                {/* No camera fallback */}
                {!cameraOn && !aiActive && (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    Camera Feed Off
                  </div>
                )}

                {/* Overlap Real-time Telemetry Stats */}
                <div className="absolute top-4 left-4 right-4 flex justify-between gap-2 pointer-events-none text-[10px] font-bold z-10">
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-black/75 border border-brandBlue/30 text-brandBlue rounded-lg backdrop-blur">
                      Gaze: {cameraMetrics.eyeContactScore}%
                    </span>
                    <span className="px-2.5 py-1 bg-black/75 border border-brandPurple/30 text-brandPurple rounded-lg backdrop-blur">
                      Confidence: {cameraMetrics.confidenceScore}%
                    </span>
                  </div>
                  {cameraMetrics.eyeContactScore < 70 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-red-600/90 text-white rounded-lg animate-pulse shadow">
                      <ShieldAlert className="w-3 h-3" /> Gaze Warning
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none text-[10px] font-bold z-10">
                  <span className="px-2.5 py-1 bg-black/75 text-gray-300 rounded-lg backdrop-blur">
                    Fillers: {cameraMetrics.fillerWordsCount}
                  </span>
                  <span className="px-2.5 py-1 bg-black/75 text-gray-400 rounded-lg backdrop-blur font-mono">
                    Latency: {latency}ms
                  </span>
                </div>
              </div>

              {/* Question Screen */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brandBlue" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Interviewer Prompt</span>
                </div>
                
                <div className="text-base font-semibold text-gray-100 leading-relaxed border-l-2 border-brandBlue pl-4 min-h-[44px] select-text">
                  {displayedQuestion}
                  <span className="inline-block w-1.5 h-4 bg-brandBlue ml-0.5 animate-pulse" />
                </div>
              </div>

              {/* User transcript console */}
              <div className="space-y-4 pt-6 border-t border-darkBorder/40 mt-6 animate-fade-in">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-semibold">Input Mode:</span>
                    <button
                      onClick={() => {
                        setInputMode('voice');
                        if (!micOn && recognitionRef.current) {
                          setTranscript('');
                          micOnRef.current = true;
                          try {
                            recognitionRef.current.start();
                          } catch (e) {}
                          setMicOn(true);
                        }
                      }}
                      className={`px-3 py-1 rounded-md border text-[10px] font-bold uppercase transition-all ${
                        inputMode === 'voice' 
                          ? 'border-brandBlue bg-brandBlue/10 text-brandBlue' 
                          : 'border-darkBorder bg-darkBg text-gray-500 hover:text-white'
                      }`}
                    >
                      Oral / Voice
                    </button>
                    <button
                      onClick={() => {
                        setInputMode('typing');
                        if (micOn && recognitionRef.current) {
                          micOnRef.current = false;
                          try {
                            recognitionRef.current.stop();
                          } catch (e) {}
                          setMicOn(false);
                        }
                      }}
                      className={`px-3 py-1 rounded-md border text-[10px] font-bold uppercase transition-all ${
                        inputMode === 'typing' 
                          ? 'border-brandPurple bg-brandPurple/10 text-brandPurple' 
                          : 'border-darkBorder bg-darkBg text-gray-500 hover:text-white'
                      }`}
                    >
                      Keyboard / Typing
                    </button>
                  </div>
                  {micOn && <span className="text-brandAccent animate-pulse flex items-center gap-1">🎤 Capturing mic...</span>}
                </div>

                {inputMode === 'voice' ? (
                  // Voice Mode Visualizer
                  <div className="w-full h-28 p-4 bg-darkBg/50 border border-darkBorder rounded-lg flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className={`absolute w-36 h-36 bg-brandAccent/5 rounded-full blur-xl transition-all duration-1000 ${micOn ? 'scale-150 opacity-100' : 'scale-50 opacity-0'}`} />
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      {micOn ? (
                        <>
                          <div className="flex items-center gap-1.5 h-6">
                            <div className="w-1.5 bg-brandAccent rounded-full animate-wave-tall" style={{ animationDelay: '0.1s' }} />
                            <div className="w-1.5 bg-brandAccent rounded-full animate-wave-medium" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1.5 bg-brandAccent rounded-full animate-wave-short" style={{ animationDelay: '0.3s' }} />
                            <div className="w-1.5 bg-brandAccent rounded-full animate-wave-medium" style={{ animationDelay: '0.4s' }} />
                            <div className="w-1.5 bg-brandAccent rounded-full animate-wave-tall" style={{ animationDelay: '0.5s' }} />
                          </div>
                          <p className="text-xs text-gray-300 font-bold max-w-2xl line-clamp-2 italic px-4">
                            "{transcript.trim() || 'Listening to your voice... Speak now!'}"
                          </p>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleMicToggle}
                            className="w-10 h-10 rounded-full bg-brandAccent/10 border border-brandAccent/30 hover:bg-brandAccent/20 flex items-center justify-center text-brandAccent transition-all shadow-lg shadow-brandAccent/10"
                          >
                            <Mic className="w-5 h-5" />
                          </button>
                          <p className="text-xs text-gray-400 font-semibold">Microphone is off. Click to start speaking.</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Type your explanation or answer here..."
                    className="w-full h-28 p-4 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-sm text-gray-200 placeholder-gray-600 resize-none leading-relaxed"
                  />
                )}
                
                <div className="flex justify-between items-center w-full">
                  <button
                    type="button"
                    onClick={handleSkipQuestion}
                    disabled={isThinking || submittingAnswer}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-white bg-darkBg border border-darkBorder hover:border-gray-500 rounded-lg transition-all disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Ask different question
                  </button>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !transcript.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brandBlue hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-brandBlue/15 disabled:opacity-50"
                  >
                    {submittingAnswer ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Response
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : currentRound === 2 ? (
            // Coding Round Layout (Monaco Editor Integration)
            <div className="h-full min-h-0 flex flex-col p-6">
              {currentQuestion && (
                <CodingSandbox 
                  question={currentQuestion} 
                  onCodeSubmitted={handleCodeSubmitted}
                  isInterviewMode={true}
                />
              )}
            </div>
          ) : (
            // System Design Layout (Whiteboard Drawing Integration)
            <div className="h-full min-h-0 flex flex-col p-6">
              {currentQuestion && (
                <Whiteboard 
                  question={currentQuestion}
                  onDesignSubmitted={handleDesignSubmitted}
                />
              )}
            </div>
          )}

        </div>

      </div>

      {/* Finishing Loading Screen */}
      {finished && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-center space-y-4 backdrop-blur">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brandPurple border-t-transparent" />
          <h2 className="text-xl font-bold text-white">Interview Concluded successfully</h2>
          <p className="text-gray-400 text-sm">Our AI Engine is scoring your performance and writing your feedback dossier...</p>
        </div>
      )}
    </div>
  );
}
