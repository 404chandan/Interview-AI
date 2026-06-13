import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import InterviewerAvatar from './InterviewerAvatar';
import CodingSandbox from './CodingSandbox';
import Whiteboard from './Whiteboard';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, ShieldAlert, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
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

  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

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
    if (cameraOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.warn("Camera access denied or missing hardware:", err.message);
          setCameraOn(false);
        });
    } else if (!cameraOn && videoRef.current) {
      const srcObject = videoRef.current.srcObject;
      if (srcObject) {
        srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraOn]);

  // 3. Initialize Web Speech API for TTS & STT
  useEffect(() => {
    // Check SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev + ' ' + finalTranscript);

        // Scan for filler words in transcript
        const fillerList = ['umm', 'like', 'basically', 'actually', 'uh'];
        let fillersFound = 0;
        fillerList.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = finalTranscript.match(regex);
          if (matches) fillersFound += matches.length;
        });
        
        if (fillersFound > 0) {
          setCameraMetrics(prev => ({
            ...prev,
            fillerWordsCount: prev.fillerWordsCount + fillersFound
          }));
        }
      };

      rec.onerror = (e) => console.error("Speech Recognition Error: ", e);
      recognitionRef.current = rec;
    }
  }, []);

  // 4. Trigger Speech Synthesis (TTS)
  const speakText = (text) => {
    if (!synthRef.current || !speechVolume) return;
    
    // Stop any active speak
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsTalking(true);
    utterance.onend = () => setIsTalking(false);
    utterance.onerror = () => setIsTalking(false);
    
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
    }, 1000);
  }, []);

  // 7. Submit Verbal Answer (Round 1 & Round 4)
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;
    setSubmittingAnswer(true);

    // Stop mic
    if (micOn && recognitionRef.current) {
      recognitionRef.current.stop();
      setMicOn(false);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/${interviewId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion?._id || 'mock-id',
          answerText: transcript,
          round: currentRound === 1 ? 'resume' : 'behavioral'
        })
      });

      if (!res.ok) throw new Error("Answer API error");
      const data = await res.json();
      
      // Setup dynamic AI follow-up
      if (roundStep === 0 && currentRound === 1) {
        // Allow 1 follow-up for resume round
        setRoundStep(1);
        setQuestionText(data.evaluation.followUpQuestion);
        speakText(data.evaluation.followUpQuestion);
        setTranscript('');
      } else {
        // Move to next round
        advanceRound();
      }
    } catch (err) {
      console.warn("Answer submission offline fallback.");
      if (roundStep === 0 && currentRound === 1) {
        setRoundStep(1);
        const followUp = "That makes sense. How did you design cache eviction mechanisms for Redis?";
        setQuestionText(followUp);
        speakText(followUp);
        setTranscript('');
      } else {
        advanceRound();
      }
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // 8. Handle DSA Code submission
  const handleCodeSubmitted = (submission) => {
    // Advance to next round (System Design) after DSA code submission
    setTimeout(() => {
      advanceRound();
    }, 4000); // 4 seconds delay to show AI review scorecard
  };

  // 9. Handle System Design Submission
  const handleDesignSubmitted = (evaluation) => {
    // Advance to behavioral round
    setTimeout(() => {
      advanceRound();
    }, 4500); // 4.5 seconds delay to let candidate read canvas score
  };

  // 10. Advance Round State Machine
  const advanceRound = () => {
    setTranscript('');
    setRoundStep(0);
    const nextRound = currentRound + 1;
    
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

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side: Avatar Panel & Webcam (1/4 columns on large screen) */}
        <div className="space-y-6 lg:col-span-1 flex flex-col justify-between">
          
          {/* AI Avatar Display */}
          <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center min-h-[260px] relative">
            <InterviewerAvatar isTalking={isTalking} isThinking={isThinking} />
          </div>

          {/* Candidate Camera Stream */}
          <div className="glass-panel rounded-xl p-4 overflow-hidden relative flex-1 flex flex-col justify-end min-h-[220px]">
            <div className="absolute inset-0 bg-black">
              {cameraOn ? (
                <video 
                  ref={videoRef}
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
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
        </div>

        {/* Right Side: Conversation Area / Interactive coding/whiteboard (3/4 columns) */}
        <div className="lg:col-span-3 flex flex-col bg-darkSurface border border-darkBorder rounded-xl overflow-hidden min-h-[500px]">
          
          {/* Swap workspaces based on rounds */}
          {currentRound === 1 || currentRound === 4 ? (
            // Verbal Rounds Layout (Resume & Behavioral)
            <div className="flex-1 flex flex-col justify-between p-6">
              
              {/* Question Screen */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brandBlue" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Interviewer Prompt</span>
                </div>
                
                <div className="text-lg font-semibold text-gray-100 leading-relaxed border-l-2 border-brandBlue pl-4">
                  {questionText}
                </div>
              </div>

              {/* User transcript console */}
              <div className="space-y-4 pt-6 border-t border-darkBorder/40">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                  <span>Candidate Response (Speak or Type)</span>
                  {micOn && <span className="text-brandAccent animate-pulse flex items-center gap-1">🎤 Capturing mic...</span>}
                </div>

                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Click the microphone in the status ribbon above to begin dictation or type your explanation here..."
                  className="w-full h-32 p-4 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-sm text-gray-200 placeholder-gray-600 resize-none leading-relaxed"
                />

                <div className="flex justify-end">
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
            <div className="flex-1 p-6">
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
            <div className="flex-1 p-6">
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
