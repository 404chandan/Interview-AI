import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { 
  parseResumeText, 
  generateQuestion, 
  evaluateAnswer, 
  reviewDSASelection, 
  evaluateSystemDesign, 
  compileFinalReport 
} from '../services/gemini.js';
import { executeCode } from '../services/codeExecutor.js';
import { User, Resume, Interview, Question, CodingSubmission, SystemDesignResponse, FeedbackReport } from '../models/Schemas.js';
import mongoose from 'mongoose';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// In-memory fallback database for offline development
const inMemoryDb = {
  users: [{ _id: 'mock-user-id', username: 'chandan', email: 'chandan@example.com' }],
  resumes: [],
  interviews: [],
  questions: [],
  submissions: [],
  whiteboards: [],
  reports: []
};

// Auth Helpers using built-in Crypto module
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  if (!storedPassword || !storedPassword.includes(':')) return false;
  const [salt, hash] = storedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

const generateToken = (user) => {
  const payload = JSON.stringify({ userId: user._id, email: user.email, username: user.username });
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret-key-12345').update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
};

const verifyToken = (token) => {
  if (!token) return null;
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const expectedSignature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret-key-12345').update(payload).digest('hex');
    if (signature === expectedSignature) {
      return JSON.parse(payload);
    }
  } catch (e) {
    // Ignore verification errors
  }
  return null;
};

// Helper to get current user ID from token, fallback to mock user
const getUserId = async (req) => {
  // 1. Check if token was parsed by auth middleware or present in headers
  if (req && req.user && req.user.userId) {
    return req.user.userId;
  }
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      return decoded.userId;
    }
  }
  const xUserId = req?.headers?.['x-user-id'];
  if (xUserId) {
    return xUserId;
  }

  // 2. Default fallback (e.g. for mock or offline development)
  try {
    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ username: 'chandan' });
      if (!user) {
        const dummyPassword = hashPassword('chandan123');
        user = await User.create({ username: 'chandan', email: 'chandan@example.com', password: dummyPassword });
      }
      return user._id;
    }
  } catch (err) {
    console.error("Mongoose connection issue in middleware, using mock user:", err.message);
  }
  return 'mock-user-id';
};

/**
 * Authentication Endpoints
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const hashedPassword = hashPassword(password);

    if (mongoose.connection.readyState === 1) {
      // Check if user exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const user = await User.create({
        username,
        email,
        password: hashedPassword
      });

      const token = generateToken(user);
      res.status(201).json({
        success: true,
        token,
        user: { _id: user._id, username: user.username, email: user.email }
      });
    } else {
      // In-memory fallback DB
      const existingUser = inMemoryDb.users.find(u => u.email === email || u.username === username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const mockId = 'mock-user-' + Date.now();
      const user = { _id: mockId, username, email, password: hashedPassword };
      inMemoryDb.users.push(user);

      const token = generateToken(user);
      res.status(201).json({
        success: true,
        token,
        user: { _id: user._id, username: user.username, email: user.email }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      res.json({
        success: true,
        token,
        user: { _id: user._id, username: user.username, email: user.email }
      });
    } else {
      // In-memory fallback DB
      const user = inMemoryDb.users.find(u => u.email === email);
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      res.json({
        success: true,
        token,
        user: { _id: user._id, username: user.username, email: user.email }
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 1. Upload & Parse Resume
 */
router.post('/resume/upload', upload.single('resume'), async (req, res) => {
  try {
    const { role, experienceYears } = req.body;
    const userId = await getUserId(req);
    
    // Read files or simulate extraction
    let resumeText = "Experienced backend developer with 2 YOE. Skills: Python, Golang, Redis, Docker, AWS, Linux. Experience at Siemens DISW as SDE.";
    if (req.file) {
      // If a file is uploaded, normally we parse the text from PDF/Docx. 
      // In this setup, we will use a simulated content extractor based on file properties or read text file
      resumeText = `Uploaded resume file: ${req.file.originalname}. Technical background in software development. Skills include Golang, Python, Redis, Kubernetes, AWS. Worked as software developer.`;
    }

    const parsedData = await parseResumeText(resumeText, role, Number(experienceYears));

    let savedResume;
    if (mongoose.connection.readyState === 1) {
      savedResume = await Resume.create({
        userId,
        filename: req.file ? req.file.originalname : 'provided_resume.pdf',
        role,
        experienceYears: Number(experienceYears),
        skills: parsedData.skills,
        projects: parsedData.projects,
        experience: parsedData.experience,
        achievements: parsedData.achievements || [],
        technologies: parsedData.technologies
      });
    } else {
      savedResume = {
        _id: 'mock-resume-' + Date.now(),
        userId,
        filename: req.file ? req.file.originalname : 'provided_resume.pdf',
        role,
        experienceYears: Number(experienceYears),
        skills: parsedData.skills,
        projects: parsedData.projects,
        experience: parsedData.experience,
        achievements: parsedData.achievements || [],
        technologies: parsedData.technologies
      };
      inMemoryDb.resumes.push(savedResume);
    }

    res.json({ success: true, resume: savedResume });
  } catch (err) {
    console.error("Resume Upload Error:", err);
    res.status(500).json({ error: "Failed to parse and store resume: " + err.message });
  }
});

/**
 * 2. Start Interview Session
 */
router.post('/interview/start', async (req, res) => {
  try {
    const { role, experienceYears, resumeId } = req.body;
    const userId = await getUserId(req);

    let interview;
    if (mongoose.connection.readyState === 1) {
      interview = await Interview.create({
        userId,
        role,
        experienceYears: Number(experienceYears),
        resumeId: mongoose.Types.ObjectId.isValid(resumeId) ? resumeId : null,
        status: 'ongoing',
        currentRound: 1
      });
    } else {
      interview = {
        _id: 'mock-interview-' + Date.now(),
        userId,
        role,
        experienceYears: Number(experienceYears),
        resumeId,
        status: 'ongoing',
        currentRound: 1,
        scores: { resume: 0, projects: 0, technical: 0, dsa: 0, systemDesign: 0, behavioral: 0 },
        finalScore: 0,
        hiringDecision: 'Pending',
        cameraAnalysis: {
          eyeContactScore: 82,
          confidenceScore: 85,
          fillerWordsCount: 0,
          avgResponseTime: 2.8,
          speechClarityScore: 90,
          speakingPace: 'Normal'
        },
        createdAt: new Date()
      };
      inMemoryDb.interviews.push(interview);
    }

    res.json({ success: true, interview });
  } catch (err) {
    console.error("Start Interview Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Generate Next Question
 */
router.post('/interview/:id/question', async (req, res) => {
  try {
    const interviewId = req.params.id;
    const { round, resumeId } = req.body;

    // Clean up unanswered questions for this interview and round to avoid clutter
    if (mongoose.connection.readyState === 1) {
      await Question.deleteMany({
        interviewId,
        round,
        $and: [
          { $or: [{ userAnswerText: { $exists: false } }, { userAnswerText: "" }] },
          { $or: [{ userAnswerCode: { $exists: false } }, { userAnswerCode: "" }] },
          { $or: [{ userAnswerWhiteboard: { $exists: false } }, { userAnswerWhiteboard: "" }] }
        ]
      });
    } else {
      inMemoryDb.questions = inMemoryDb.questions.filter(q => {
        if (q.interviewId === interviewId && q.round === round) {
          const hasAnswer = (q.userAnswerText && q.userAnswerText.trim() !== "") || 
                            (q.userAnswerCode && q.userAnswerCode.trim() !== "") || 
                            (q.userAnswerWhiteboard && q.userAnswerWhiteboard.trim() !== "");
          return hasAnswer;
        }
        return true;
      });
    }
    
    // Fetch resume details
    let resumeData = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(resumeId)) {
        resumeData = await Resume.findById(resumeId);
      }
    } else {
      resumeData = inMemoryDb.resumes.find(r => r._id === resumeId);
    }

    // Fetch question history for this interview
    let history = [];
    if (mongoose.connection.readyState === 1) {
      history = await Question.find({ interviewId });
    } else {
      history = inMemoryDb.questions.filter(q => q.interviewId === interviewId);
    }

    const questionObj = await generateQuestion(round, resumeData, history);
    
    let savedQuestion;
    if (mongoose.connection.readyState === 1) {
      savedQuestion = await Question.create({
        interviewId,
        round,
        questionText: questionObj.questionText,
        codeTemplate: questionObj.codeTemplate || null,
        dsaSlug: questionObj.id || questionObj.dsaSlug || null,
        functionName: questionObj.functionName || null,
        difficulty: questionObj.difficulty || 'medium',
        topics: questionObj.topics || [],
        expectedAnswer: questionObj.expectedAnswer || '',
        score: 0,
        feedback: ''
      });
    } else {
      savedQuestion = {
        _id: 'mock-question-' + Date.now(),
        interviewId,
        round,
        questionText: questionObj.questionText,
        codeTemplate: questionObj.codeTemplate || null,
        dsaSlug: questionObj.id || questionObj.dsaSlug || null,
        functionName: questionObj.functionName || null,
        difficulty: questionObj.difficulty || 'medium',
        topics: questionObj.topics || [],
        expectedAnswer: questionObj.expectedAnswer || '',
        score: 0,
        feedback: ''
      };
      inMemoryDb.questions.push(savedQuestion);
    }

    res.json({ success: true, question: savedQuestion });
  } catch (err) {
    console.error("Generate Question Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. Submit Answer (Verbal/Transcript)
 */
router.post('/interview/:id/answer', async (req, res) => {
  try {
    const interviewId = req.params.id;
    const { questionId, answerText, round } = req.body;

    // Fetch original question text
    let questionText = "Tell me about your background.";
    let activeQuestion;
    
    if (mongoose.connection.readyState === 1) {
      activeQuestion = await Question.findById(questionId);
      if (activeQuestion) questionText = activeQuestion.questionText;
    } else {
      activeQuestion = inMemoryDb.questions.find(q => q._id === questionId);
      if (activeQuestion) questionText = activeQuestion.questionText;
    }

    // Fetch question history for this interview to pass to evaluator
    let history = [];
    if (mongoose.connection.readyState === 1) {
      history = await Question.find({ interviewId });
    } else {
      history = inMemoryDb.questions.filter(q => q.interviewId === interviewId);
    }

    const evaluation = await evaluateAnswer(questionText, answerText, round, history);

    // Save answer evaluation
    if (activeQuestion) {
      if (mongoose.connection.readyState === 1) {
        activeQuestion.userAnswerText = answerText;
        activeQuestion.score = evaluation.score;
        activeQuestion.feedback = evaluation.feedback;
        await activeQuestion.save();
      } else {
        activeQuestion.userAnswerText = answerText;
        activeQuestion.score = evaluation.score;
        activeQuestion.feedback = evaluation.feedback;
      }
    }

    res.json({ success: true, evaluation });
  } catch (err) {
    console.error("Submit Answer Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. Submit Code Submission (DSA)
 */
router.post('/interview/:id/code', async (req, res) => {
  try {
    const interviewId = req.params.id;
    const { questionId, code, language, questionText, functionName } = req.body;
    const userId = await getUserId(req);

    // Resolve questionId to dsaSlug if it's a mongo ID
    let dsaSlug = questionId;
    let activeQuestion;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(questionId)) {
      activeQuestion = await Question.findById(questionId);
      if (activeQuestion && activeQuestion.dsaSlug) {
        dsaSlug = activeQuestion.dsaSlug;
      }
    } else {
      activeQuestion = inMemoryDb.questions.find(q => q._id === questionId);
      if (activeQuestion && activeQuestion.dsaSlug) {
        dsaSlug = activeQuestion.dsaSlug;
      }
    }

    // 1. Run local sandboxed tests
    const executionResults = await executeCode(code, language, dsaSlug, functionName || (activeQuestion && activeQuestion.functionName) || 'solution');

    // 2. Perform AI review of code
    const aiReview = await reviewDSASelection(questionText, code, language);

    // 3. Save submission
    let submission;
    const correctnessScore = Math.round((executionResults.passed / executionResults.total) * 100);
    
    if (mongoose.connection.readyState === 1) {
      submission = await CodingSubmission.create({
        userId,
        interviewId,
        questionId: mongoose.Types.ObjectId.isValid(questionId) ? questionId : null,
        language,
        code,
        passedCases: executionResults.passed,
        totalCases: executionResults.total,
        runtime: executionResults.runtime,
        memory: executionResults.memory,
        correctnessScore,
        timeComplexity: aiReview.timeComplexity,
        spaceComplexity: aiReview.spaceComplexity,
        aiFeedback: aiReview.aiFeedback
      });

      // Update question text and record DSA results
      if (activeQuestion) {
        activeQuestion.userAnswerCode = code;
        activeQuestion.score = Math.round(correctnessScore / 10);
        activeQuestion.feedback = aiReview.aiFeedback;
        await activeQuestion.save();
      }
    } else {
      submission = {
        _id: 'mock-submission-' + Date.now(),
        userId,
        interviewId,
        questionId,
        language,
        code,
        passedCases: executionResults.passed,
        totalCases: executionResults.total,
        runtime: executionResults.runtime,
        memory: executionResults.memory,
        correctnessScore,
        timeComplexity: aiReview.timeComplexity,
        spaceComplexity: aiReview.spaceComplexity,
        aiFeedback: aiReview.aiFeedback,
        createdAt: new Date()
      };
      inMemoryDb.submissions.push(submission);

      if (activeQuestion) {
        activeQuestion.userAnswerCode = code;
        activeQuestion.score = Math.round(correctnessScore / 10);
        activeQuestion.feedback = aiReview.aiFeedback;
      }
    }

    res.json({ 
      success: true, 
      submission, 
      execution: executionResults 
    });
  } catch (err) {
    console.error("Submit Code Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6. Submit System Design Whiteboard
 */
router.post('/interview/:id/whiteboard', async (req, res) => {
  try {
    const interviewId = req.params.id;
    const { questionId, whiteboardData, explanationText, questionText } = req.body;

    const evaluation = await evaluateSystemDesign(questionText, whiteboardData, explanationText);

    let sysDesignResponse;
    if (mongoose.connection.readyState === 1) {
      sysDesignResponse = await SystemDesignResponse.create({
        interviewId,
        questionId: mongoose.Types.ObjectId.isValid(questionId) ? questionId : null,
        whiteboardData: JSON.stringify(whiteboardData),
        audioTranscript: explanationText,
        aiEvaluation: evaluation
      });

      // Update parent question score
      const activeQuestion = await Question.findById(questionId);
      if (activeQuestion) {
        activeQuestion.userAnswerWhiteboard = JSON.stringify(whiteboardData);
        activeQuestion.userAnswerText = explanationText;
        activeQuestion.score = Math.round(
          (evaluation.scalabilityScore + 
           evaluation.cachingScore + 
           evaluation.databaseScore + 
           evaluation.apiDesignScore) / 40
        );
        activeQuestion.feedback = evaluation.comments;
        await activeQuestion.save();
      }
    } else {
      sysDesignResponse = {
        _id: 'mock-sysdesign-' + Date.now(),
        interviewId,
        questionId,
        whiteboardData: JSON.stringify(whiteboardData),
        audioTranscript: explanationText,
        aiEvaluation: evaluation,
        createdAt: new Date()
      };
      inMemoryDb.whiteboards.push(sysDesignResponse);

      const activeQuestion = inMemoryDb.questions.find(q => q._id === questionId);
      if (activeQuestion) {
        activeQuestion.userAnswerWhiteboard = JSON.stringify(whiteboardData);
        activeQuestion.userAnswerText = explanationText;
        activeQuestion.score = Math.round(
          (evaluation.scalabilityScore + 
           evaluation.cachingScore + 
           evaluation.databaseScore + 
           evaluation.apiDesignScore) / 40
        );
        activeQuestion.feedback = evaluation.comments;
      }
    }

    res.json({ success: true, evaluation: sysDesignResponse });
  } catch (err) {
    console.error("Submit System Design Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7. Finish Interview & Compile Final Report
 */
router.post('/interview/:id/finish', async (req, res) => {
  try {
    const interviewId = req.params.id;
    const { cameraMetrics } = req.body;

    let interview;
    let questionsAndAnswers = [];

    if (mongoose.connection.readyState === 1) {
      interview = await Interview.findById(interviewId);
      questionsAndAnswers = await Question.find({ interviewId });
    } else {
      interview = inMemoryDb.interviews.find(i => i._id === interviewId);
      questionsAndAnswers = inMemoryDb.questions.filter(q => q.interviewId === interviewId);
    }

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    const report = await compileFinalReport(interview, questionsAndAnswers);

    // Save final report details
    let savedReport;
    if (mongoose.connection.readyState === 1) {
      // Update interview status and score values
      interview.status = 'completed';
      interview.scores = report.scores;
      interview.finalScore = report.finalScore;
      interview.hiringDecision = report.hiringDecision;
      
      if (cameraMetrics) {
        interview.cameraAnalysis = {
          eyeContactScore: cameraMetrics.eyeContactScore || 80,
          confidenceScore: cameraMetrics.confidenceScore || 80,
          fillerWordsCount: cameraMetrics.fillerWordsCount || 0,
          avgResponseTime: cameraMetrics.avgResponseTime || 3.0,
          speechClarityScore: cameraMetrics.speechClarityScore || 85,
          speakingPace: cameraMetrics.speakingPace || 'Normal'
        };
      }
      await interview.save();

      // Create detailed report
      savedReport = await FeedbackReport.create({
        interviewId,
        candidateSummary: report.candidateSummary,
        strongAreas: report.strongAreas,
        weakAreas: report.weakAreas,
        estimatedReadiness: report.estimatedReadiness,
        questionBreakdown: questionsAndAnswers.map(q => ({
          questionId: q._id,
          questionText: q.questionText,
          userAnswer: q.round === 'dsa' ? q.userAnswerCode : q.userAnswerText,
          score: q.score,
          feedback: q.feedback
        }))
      });
    } else {
      interview.status = 'completed';
      interview.scores = report.scores;
      interview.finalScore = report.finalScore;
      interview.hiringDecision = report.hiringDecision;
      
      if (cameraMetrics) {
        interview.cameraAnalysis = {
          eyeContactScore: cameraMetrics.eyeContactScore || 80,
          confidenceScore: cameraMetrics.confidenceScore || 80,
          fillerWordsCount: cameraMetrics.fillerWordsCount || 0,
          avgResponseTime: cameraMetrics.avgResponseTime || 3.0,
          speechClarityScore: cameraMetrics.speechClarityScore || 85,
          speakingPace: cameraMetrics.speakingPace || 'Normal'
        };
      }

      savedReport = {
        _id: 'mock-report-' + Date.now(),
        interviewId,
        candidateSummary: report.candidateSummary,
        strongAreas: report.strongAreas,
        weakAreas: report.weakAreas,
        estimatedReadiness: report.estimatedReadiness,
        questionBreakdown: questionsAndAnswers.map(q => ({
          questionId: q._id,
          questionText: q.questionText,
          userAnswer: q.round === 'dsa' ? q.userAnswerCode : q.userAnswerText,
          score: q.score,
          feedback: q.feedback
        })),
        createdAt: new Date()
      };
      inMemoryDb.reports.push(savedReport);
    }

    res.json({ success: true, report: savedReport, interview });
  } catch (err) {
    console.error("Finish Interview Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 8. Get History list
 */
router.get('/interviews/history', async (req, res) => {
  try {
    const userId = await getUserId(req);
    let list = [];
    if (mongoose.connection.readyState === 1) {
      list = await Interview.find({ userId }).sort({ createdAt: -1 });
    } else {
      list = inMemoryDb.interviews.filter(i => i.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 9. Get Single Report
 */
router.get('/interview/:id/report', async (req, res) => {
  try {
    const interviewId = req.params.id;
    let report = null;
    let interview = null;

    if (mongoose.connection.readyState === 1) {
      report = await FeedbackReport.findOne({ interviewId });
      interview = await Interview.findById(interviewId);
    } else {
      report = inMemoryDb.reports.find(r => r.interviewId === interviewId);
      interview = inMemoryDb.interviews.find(i => i._id === interviewId);
    }

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ report, interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 10. Standalone LeetCode dynamic question generator
 */
router.post('/leetcode/generate', async (req, res) => {
  try {
    const { topic, difficulty, company } = req.body;
    
    // Construct dynamic prompt or return mock
    if (!aiModel) {
      // Mock questions based on topic
      const mocks = {
        "Arrays": {
          questionText: `Given an array of integers, find if the array contains any duplicates. Your function should return true if any value appears at least twice in the array, and it should return false if every element is distinct.`,
          codeTemplate: `function containsDuplicate(nums) {\n    // Write your code here\n};`,
          difficulty: difficulty || 'easy',
          topics: ['Arrays', 'Hash Set'],
          id: 'contains-duplicate',
          functionName: 'containsDuplicate'
        },
        "Trees": {
          questionText: `Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
          codeTemplate: `function maxDepth(root) {\n    // Write your code here\n};`,
          difficulty: difficulty || 'medium',
          topics: ['Binary Tree', 'DFS'],
          id: 'max-depth',
          functionName: 'maxDepth'
        },
        "Graphs": {
          questionText: `There are an total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.`,
          codeTemplate: `function canFinish(numCourses, prerequisites) {\n    // Write your code here\n};`,
          difficulty: difficulty || 'medium',
          topics: ['Graph', 'BFS', 'Topological Sort'],
          id: 'course-schedule',
          functionName: 'canFinish'
        }
      };

      const q = mocks[topic] || mocks["Arrays"];
      q.difficulty = difficulty || 'medium';
      return res.json(q);
    }

    const prompt = `
      Create a LeetCode style coding question.
      Primary Topic: ${topic}
      Difficulty level: ${difficulty}
      Target Company style: ${company}
      
      Output strictly as a JSON object matching this structure:
      {
        "questionText": "problem description with constraints and inputs/outputs",
        "codeTemplate": "boilerplate script code function in JavaScript",
        "difficulty": "${difficulty}",
        "topics": ["${topic}", "other-topic"],
        "id": "slug-id",
        "functionName": "the main entry function name"
      }
    `;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/gi, '').trim();
    res.json(JSON.parse(cleanText));
  } catch (err) {
    console.error("Error generating LeetCode question:", err);
    res.status(500).json({ error: "Failed to generate question: " + err.message });
  }
});

/**
 * 11. Dashboard Analytics endpoint
 */
router.get('/analytics', async (req, res) => {
  try {
    const userId = await getUserId(req);
    let list = [];
    if (mongoose.connection.readyState === 1) {
      list = await Interview.find({ userId, status: 'completed' });
    } else {
      list = inMemoryDb.interviews.filter(i => i.userId === userId && i.status === 'completed');
    }

    // Default trend data
    let dsaTrend = [60, 68, 75, 82, 90];
    let sysDesignTrend = [45, 50, 60, 70, 78];
    let commTrend = [75, 78, 80, 84, 86];
    
    if (list.length > 0) {
      // Map existing scores to trends if available
      dsaTrend = list.map(i => i.scores.dsa || 0).reverse();
      sysDesignTrend = list.map(i => i.scores.systemDesign || 0).reverse();
      commTrend = list.map(i => i.cameraAnalysis.eyeContactScore || 0).reverse();
    }

    res.json({
      totalSessions: list.length,
      averageScore: list.length > 0 ? Math.round(list.reduce((acc, i) => acc + i.finalScore, 0) / list.length) : 0,
      dsaTrend,
      sysDesignTrend,
      commTrend,
      readyEstimates: {
        google: list.length > 0 ? Math.max(...list.map(i => i.finalScore)) - 5 : 72,
        amazon: list.length > 0 ? Math.max(...list.map(i => i.finalScore)) + 2 : 81,
        meta: list.length > 0 ? Math.max(...list.map(i => i.finalScore)) - 2 : 76,
        microsoft: list.length > 0 ? Math.max(...list.map(i => i.finalScore)) + 5 : 84
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
