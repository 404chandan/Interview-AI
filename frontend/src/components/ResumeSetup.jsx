import React, { useState } from 'react';
import { Upload, ChevronRight, FileText, X, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function ResumeSetup({ onStartInterview }) {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('Backend Engineer');
  const [experience, setExperience] = useState(2);
  const [targetCompany, setTargetCompany] = useState('Google');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInterviewer, setSelectedInterviewer] = useState('Sarah');

  const roles = [
    'Software Engineer',
    'Backend Engineer',
    'Frontend Engineer',
    'Full Stack Developer',
    'Data Engineer',
    'ML Engineer'
  ];

  const companies = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Netflix', 'General/Other'];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf') || selected.name.endsWith('.docx')) {
        setFile(selected);
        setError('');
      } else {
        setError('Please upload a PDF or DOCX file.');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files[0];
    if (selected) {
      if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf') || selected.name.endsWith('.docx')) {
        setFile(selected);
        setError('');
      } else {
        setError('Please upload a PDF or DOCX file.');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      }
      formData.append('role', role);
      formData.append('experienceYears', experience);
      formData.append('targetCompany', targetCompany);
      formData.append('jobDescription', jobDescription);

      // 1. Upload & Parse Resume
      const uploadRes = await fetch(`${BACKEND_URL}/api/resume/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to parse resume. Backend might be unreachable.');
      }

      const uploadData = await uploadRes.json();
      const resumeId = uploadData.resume._id;

      // 2. Start Interview Session
      const startRes = await fetch(`${BACKEND_URL}/api/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          experienceYears: experience,
          resumeId,
          interviewer: selectedInterviewer,
        }),
      });

      if (!startRes.ok) {
        throw new Error('Failed to start interview.');
      }

      const startData = await startRes.json();
      
      // Pass data back to parent
      onStartInterview({
        interview: { ...startData.interview, interviewerAvatar: selectedInterviewer },
        resume: uploadData.resume
      });
    } catch (err) {
      console.error(err);
      // Fallback: If backend is completely offline, generate mock data immediately so they can play
      console.warn("Backend API request failed, initializing mock session in-browser.");
      
      const mockResumeId = 'mock-resume-' + Date.now();
      const mockInterviewId = 'mock-interview-' + Date.now();
      
      onStartInterview({
        interview: {
          _id: mockInterviewId,
          role,
          experienceYears: experience,
          resumeId: mockResumeId,
          status: 'ongoing',
          currentRound: 1,
          interviewerAvatar: selectedInterviewer,
          scores: { resume: 0, projects: 0, technical: 0, dsa: 0, systemDesign: 0, behavioral: 0 },
          finalScore: 0,
          hiringDecision: 'Pending',
          cameraAnalysis: {
            eyeContactScore: 85,
            confidenceScore: 80,
            fillerWordsCount: 2,
            avgResponseTime: 3.2,
            speechClarityScore: 92,
            speakingPace: 'Normal'
          },
          createdAt: new Date()
        },
        resume: {
          _id: mockResumeId,
          filename: file ? file.name : 'resume_mock.pdf',
          role,
          experienceYears: experience,
          skills: ["Python", "Golang", "Redis", "Docker", "AWS", "Linux"],
          projects: [
            { name: "InsightPro Automation", description: "Automated manual enterprise workflows.", technologies: ["Python", "Redis"] }
          ],
          experience: [
            { company: "Siemens DISW", role: "Software Developer", duration: "2 Years", description: "Developed microservices." }
          ],
          technologies: ["Docker", "AWS"]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="glass-panel rounded-xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
          Setup Your Interview Profile
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Provide your resume and configuration details. Our AI interviewer will customize question tracks to fit your background.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop File Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Upload Resume (PDF or DOCX)</label>
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-darkBorder hover:border-brandBlue/50 bg-darkBg/30 hover:bg-darkBg/50 transition-all rounded-xl p-8 text-center cursor-pointer relative"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-300 font-medium">Drag & drop your resume here, or <span className="text-brandBlue">browse</span></p>
                <p className="text-xs text-gray-500 mt-1">Supports PDF, DOCX up to 10MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-darkBg/50 border border-darkBorder">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brandBlue/10 rounded-lg">
                    <FileText className="w-6 h-6 text-brandBlue" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-200 truncate max-w-md">{file.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-gray-500 italic mt-1">
              * Note: If you do not upload a resume, the system will use a pre-filled mock profile (e.g., Chandan - 2 YOE Backend at Siemens).
            </p>
          </div>

          {/* Role & YOE selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-gray-300 text-sm"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Target Company</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-gray-300 text-sm"
              >
                {companies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Select AI Interviewer */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select AI Interviewer</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedInterviewer('Sarah')}
                className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  selectedInterviewer === 'Sarah' 
                    ? 'border-brandBlue bg-brandBlue/10 shadow-lg shadow-brandBlue/5' 
                    : 'border-darkBorder bg-darkBg/30 hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md text-sm">
                  S
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200">Sarah</div>
                  <div className="text-[10px] text-gray-500 font-medium">AI Technical Recruiter (Female)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInterviewer('David')}
                className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  selectedInterviewer === 'David' 
                    ? 'border-brandPurple bg-brandPurple/10 shadow-lg shadow-brandPurple/5' 
                    : 'border-darkBorder bg-darkBg/30 hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brandBlue to-blue-700 flex items-center justify-center font-bold text-white shadow-md text-sm">
                  D
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200">David</div>
                  <div className="text-[10px] text-gray-500 font-medium">Lead Systems Architect (Male)</div>
                </div>
              </button>
            </div>
          </div>

          {/* YOE Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
              <span>Years of Experience</span>
              <span className="text-brandBlue font-mono text-sm lowercase">{experience} YOE</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandBlue"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>0 (Entry/Junior)</span>
              <span>5 (Mid/Senior)</span>
              <span>10 (Lead)</span>
              <span>15+ (Principal)</span>
            </div>
          </div>

          {/* Job Description (Optional) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Job Description (Optional)</label>
            <textarea
              rows="3"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here to customize questions to the specific role requirements..."
              className="w-full px-4 py-3 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-gray-300 text-sm placeholder-gray-600 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-gradient-to-r from-brandBlue via-indigo-600 to-brandPurple text-white hover:opacity-95 transition-all text-sm font-semibold shadow-lg shadow-brandBlue/10 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing Profile & Syncing Model...
              </>
            ) : (
              <>
                Initialize Interview Room
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
