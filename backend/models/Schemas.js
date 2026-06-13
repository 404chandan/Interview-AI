import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  stats: {
    totalInterviews: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    dsaRating: { type: Number, default: 0 },
    systemDesignRating: { type: Number, default: 0 },
    communicationRating: { type: Number, default: 0 }
  }
});

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: String,
  role: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  skills: [String],
  projects: [{
    name: String,
    description: String,
    technologies: [String]
  }],
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  achievements: [String],
  technologies: [String],
  createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  round: { type: String, enum: ['resume', 'dsa', 'system_design', 'behavioral'] },
  questionText: String,
  codeTemplate: String, // For DSA questions
  dsaSlug: String, // Slug to map to test runner cases (e.g. 'two-sum')
  functionName: String, // Name of the function to invoke for evaluation
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  topics: [String],
  expectedAnswer: String,
  userAnswerText: String, // Transcript
  userAnswerCode: String, // Submitted code if DSA
  userAnswerWhiteboard: String, // Whiteboard layout data / image
  score: { type: Number, min: 0, max: 10 },
  feedback: String,
  createdAt: { type: Date, default: Date.now }
});

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: String,
  experienceYears: Number,
  status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'ongoing' },
  currentRound: { type: Number, default: 1 }, // 1: Resume, 2: DSA, 3: System Design, 4: Behavioral
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  
  // Section Scores (0-100)
  scores: {
    resume: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    dsa: { type: Number, default: 0 },
    systemDesign: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 }
  },
  finalScore: { type: Number, default: 0 },
  hiringDecision: { type: String, enum: ['Strong Hire', 'Hire', 'Lean Hire', 'No Hire', 'Pending'], default: 'Pending' },
  
  // Communication & Camera metrics
  cameraAnalysis: {
    eyeContactScore: { type: Number, default: 0 }, // %
    confidenceScore: { type: Number, default: 0 }, // %
    fillerWordsCount: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }, // seconds
    speechClarityScore: { type: Number, default: 0 }, // %
    speakingPace: { type: String, default: 'Normal' } // Slow, Normal, Fast
  },
  
  videoRecordingPath: String,
  summary: String,
  createdAt: { type: Date, default: Date.now }
});

const CodingSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  language: String,
  code: String,
  passedCases: Number,
  totalCases: Number,
  runtime: Number, // ms
  memory: Number, // KB
  correctnessScore: Number, // 0-100
  timeComplexity: String, // e.g. O(N)
  spaceComplexity: String, // e.g. O(1)
  aiFeedback: String,
  createdAt: { type: Date, default: Date.now }
});

const SystemDesignResponseSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  whiteboardData: String, // SVG or JSON of components
  audioTranscript: String,
  aiEvaluation: {
    scalabilityScore: Number,
    cachingScore: Number,
    databaseScore: Number,
    apiDesignScore: Number,
    tradeoffsScore: Number,
    comments: String
  },
  createdAt: { type: Date, default: Date.now }
});

const FeedbackReportSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', unique: true },
  candidateSummary: String,
  strongAreas: [String],
  weakAreas: [String],
  estimatedReadiness: {
    google: Number, // %
    amazon: Number, // %
    meta: Number, // %
    microsoft: Number // %
  },
  questionBreakdown: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionText: String,
    userAnswer: String,
    score: Number,
    feedback: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const LeaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  username: String,
  avgScore: Number,
  completedInterviews: Number,
  rank: Number,
  lastUpdated: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Resume = mongoose.model('Resume', ResumeSchema);
export const Question = mongoose.model('Question', QuestionSchema);
export const Interview = mongoose.model('Interview', InterviewSchema);
export const CodingSubmission = mongoose.model('CodingSubmission', CodingSubmissionSchema);
export const SystemDesignResponse = mongoose.model('SystemDesignResponse', SystemDesignResponseSchema);
export const FeedbackReport = mongoose.model('FeedbackReport', FeedbackReportSchema);
export const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);
