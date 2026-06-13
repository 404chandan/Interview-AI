import { GoogleGenAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let aiModel = null;

if (apiKey) {
  try {
    const ai = new GoogleGenAI({ apiKey });
    aiModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✨ Gemini Generative AI Service initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Gemini API:', err.message);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY is not set in .env. Gemini AI services will use mock evaluations.');
}

/**
 * Parses resume text to pull structured details
 */
export const parseResumeText = async (text, role, experienceYears) => {
  if (!aiModel) {
    // Return high-quality mock resume analysis
    return {
      skills: ["Python", "Golang", "Redis", "Docker", "AWS", "Linux", "Node.js", "MongoDB", "SQL"],
      projects: [
        {
          name: "InsightPro Automation",
          description: "Automated manual enterprise workflows reducing overhead by 80% using Python, Redis, and Celery tasks.",
          technologies: ["Python", "Redis", "Celery", "Linux"]
        },
        {
          name: "AI Troubleshooting System",
          description: "Engineered LLM-backed diagnostics agents for customer support, reducing average resolution latency to under 3 seconds.",
          technologies: ["Python", "Gemini API", "FastAPI", "Docker"]
        }
      ],
      experience: [
        {
          company: "Siemens DISW",
          role: "Software Development Engineer",
          duration: "2 Years",
          description: "Engineered high-performance backend pipelines in Go and Python. Managed cache invalidation with Redis."
        }
      ],
      technologies: ["Docker", "AWS", "Linux", "Kubernetes", "Git"]
    };
  }

  const prompt = `
    Analyze the following resume text. Extract skills, projects, professional experience, and technical tools.
    Provide the output strictly as a JSON object matching this structure:
    {
      "skills": ["skill1", "skill2"],
      "projects": [{"name": "project name", "description": "project desc", "technologies": ["tech1"]}],
      "experience": [{"company": "company name", "role": "job title", "duration": "years/months", "description": "details"}],
      "technologies": ["tech1", "tech2"]
    }
    
    Resume Text:
    ${text}
    
    Target Role: ${role}
    Years of Experience: ${experienceYears}
  `;

  try {
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Error calling Gemini for resume parsing:", err);
    throw err;
  }
};

/**
 * Dynamically generates a question based on current round and session context
 */
export const generateQuestion = async (round, resumeData, history = []) => {
  const role = resumeData?.role || "Software Engineer";
  const experienceYears = resumeData?.experienceYears || 2;
  const skills = resumeData?.skills || ["JavaScript", "Python"];
  
  if (!aiModel) {
    // Return realistic mock questions based on the round
    if (round === 'resume') {
      const questions = [
        `You mentioned at Siemens DISW that you automated InsightPro workflows reducing manual effort by 80%. Can you explain the system architecture and how you measured this 80% reduction?`,
        `Regarding your AI Troubleshooting System, why did you choose LLMs for diagnostics, and how did you handle response evaluation and evaluation latency?`,
        `You list Redis in your skills. In your project at Siemens DISW, how did you handle cache invalidation, and what eviction policy did you choose?`
      ];
      return {
        questionText: questions[Math.min(history.length, questions.length - 1)],
        difficulty: 'medium',
        topics: ['Resume', 'Backend']
      };
    } else if (round === 'dsa') {
      const dsaQuestions = [
        {
          questionText: `Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
          codeTemplate: `function twoSum(nums, target) {\n    // Write your code here\n};`,
          difficulty: 'easy',
          topics: ['Arrays', 'Hash Map'],
          id: 'two-sum',
          functionName: 'twoSum'
        },
        {
          questionText: `Given a string 's', find the length of the longest substring without repeating characters.`,
          codeTemplate: `function lengthOfLongestSubstring(s) {\n    // Write your code here\n};`,
          difficulty: 'medium',
          topics: ['String', 'Sliding Window'],
          id: 'longest-substring',
          functionName: 'lengthOfLongestSubstring'
        }
      ];
      const selected = dsaQuestions[experienceYears > 3 ? 1 : 0];
      return selected;
    } else if (round === 'system_design') {
      const designTopics = [
        { questionText: "Design a URL Shortener like TinyURL. Focus on database choices, API designs, and how to scale to 100M daily active requests.", difficulty: 'medium' },
        { questionText: "Design a Rate Limiter system that can be deployed at scale across a distributed API gateway setup.", difficulty: 'medium' },
        { questionText: "Design WhatsApp. Detail the socket layer, database choice for messaging history, and how to scale notifications for offline users.", difficulty: 'hard' }
      ];
      return designTopics[experienceYears > 4 ? 2 : (experienceYears > 2 ? 1 : 0)];
    } else {
      const behavioral = [
        "Tell me about a time when you had a conflict with a peer or teammate. How did you approach resolving it and what was the outcome?",
        "Describe a project or milestone that failed under your watch. What did you learn and how did it shape your future approach?",
        "How do you prioritize features or handle shifting requirements from product management when under tight release deadlines?"
      ];
      return {
        questionText: behavioral[Math.min(history.length, behavioral.length - 1)],
        difficulty: 'medium',
        topics: ['Behavioral', 'STAR Methodology']
      };
    }
  }

  // Real LLM Generation
  const prompt = `
    Generate an interview question for a candidate with the following profile:
    Role: ${role}
    Experience: ${experienceYears} Years
    Skills: ${skills.join(', ')}
    
    Current Round: ${round}
    Previous Conversation/Questions History: ${JSON.stringify(history)}
    
    Instructions:
    - If round is "resume", ask a deep-dive question about their experience, projects, or listed tools.
    - If round is "dsa", provide a LeetCode style question suitable for a YOE of ${experienceYears}.
    - If round is "system_design", ask for architectural designs. E.g. 0-2 YOE: URL Shortener, Rate Limiter; 3-5 YOE: WhatsApp, Uber; 5+ YOE: Distributed Cache, Kafka.
    - If round is "behavioral", ask STAR-format questions.
    
    Output strictly as a JSON object matching this structure:
    {
      "questionText": "the question detail",
      "codeTemplate": "boilerplate code string (only for dsa)",
      "difficulty": "easy/medium/hard",
      "topics": ["topic1", "topic2"],
      "id": "slug-id-for-code-executor-matching-if-classic-dsa-else-new",
      "functionName": "the main function name to evaluate (only for dsa)"
    }
  `;

  try {
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Error generating question from Gemini:", err);
    // Fall back to default question generator if parsing or Gemini fails
    return generateQuestion(round, resumeData, history);
  }
};

/**
 * Evaluates candidate responses (real-time voice transcript or coding input)
 */
export const evaluateAnswer = async (questionText, answerText, round) => {
  if (!aiModel) {
    const randomScore = Math.floor(Math.random() * 3) + 7; // 7, 8, 9
    return {
      score: randomScore,
      feedback: `You demonstrated solid understanding of this topic. You clearly outlined the key parameters. To improve further, consider discussing memory layouts or edge cases like high concurrency.`,
      followUpQuestion: `That makes sense. Can you elaborate on how your proposed structure handles cache invalidation or unexpected node failures?`
    };
  }

  const prompt = `
    You are an technical interviewer conducting a live round of: ${round}.
    Question Asked: "${questionText}"
    Candidate Answered: "${answerText}"
    
    Evaluate the response. Grade it on a scale of 0 to 10.
    Generate constructive feedback.
    Also generate a natural follow-up question extending their answer or addressing a missed edge case.
    
    Output strictly as a JSON object matching this structure:
    {
      "score": 8,
      "feedback": "detailed review text",
      "followUpQuestion": "natural conversational follow-up question"
    }
  `;

  try {
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Error evaluating answer:", err);
    return {
      score: 7,
      feedback: "Failed to query Gemini. Answer evaluated as average.",
      followUpQuestion: "Let's move forward. How would you handle scaling this setup?"
    };
  }
};

/**
 * Conducts Code Review on submitted DSA solution
 */
export const reviewDSASelection = async (questionText, code, language) => {
  if (!aiModel) {
    return {
      correctnessScore: 90,
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      aiFeedback: "Excellent approach using a single hash map pass. The variable names are descriptive, and edge cases are handled correctly. You could optimize space complexity to O(1) in specific variants."
    };
  }

  const prompt = `
    Analyze the following coding submission:
    Problem: "${questionText}"
    Language: ${language}
    Submitted Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Evaluate correctness, time complexity, space complexity, and provide detailed code review suggestions (code quality, edge cases, naming).
    
    Output strictly as a JSON object:
    {
      "correctnessScore": 95,
      "timeComplexity": "O(N)",
      "spaceComplexity": "O(1)",
      "aiFeedback": "Detailed review and optimization guidelines"
    }
  `;

  try {
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Error reviewing code:", err);
    return {
      correctnessScore: 80,
      timeComplexity: "Unable to calculate",
      spaceComplexity: "Unable to calculate",
      aiFeedback: "Code parsed successfully, but LLM review failed to generate. Check variable names and time complexity bounds."
    };
  }
};

/**
 * Evaluates System Design drawings and verbal explanations
 */
export const evaluateSystemDesign = async (questionText, whiteboardSummary, explanationText) => {
  if (!aiModel) {
    return {
      scalabilityScore: 85,
      cachingScore: 80,
      databaseScore: 90,
      apiDesignScore: 85,
      tradeoffsScore: 75,
      comments: "Strong database choices using SQL for transaction safety and NoSQL for rapid messaging lookups. The API architecture is sound, but cache invalidation policies (LRU) were not fully elaborated."
    };
  }

  const prompt = `
    Evaluate a system design round.
    Question: "${questionText}"
    Whiteboard Layout (JSON representation of boxes/connectors):
    ${JSON.stringify(whiteboardSummary)}
    
    Candidate Speech Explanation:
    "${explanationText}"
    
    Score each of the following from 0 to 100:
    - scalability
    - caching
    - database selection
    - apiDesign
    - tradeoffs
    Include general evaluation comments.
    
    Output strictly as a JSON object:
    {
      "scalabilityScore": 85,
      "cachingScore": 80,
      "databaseScore": 90,
      "apiDesignScore": 85,
      "tradeoffsScore": 75,
      "comments": "Summary text here"
    }
  `;

  try {
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Error evaluating system design:", err);
    return {
      scalabilityScore: 80,
      cachingScore: 80,
      databaseScore: 80,
      apiDesignScore: 80,
      tradeoffsScore: 80,
      comments: "Local evaluation fallback due to API failure."
    };
  }
};

/**
 * Compiles all session scores, speech/cam metrics, and outputs the final PDF-ready Report
 */
export const compileFinalReport = async (interviewData, questionsAndAnswers) => {
  if (!aiModel) {
    // Generate simulated report scores
    const scores = {
      resume: 85,
      projects: 88,
      technical: 82,
      dsa: 90,
      systemDesign: 78,
      behavioral: 84
    };
    
    const finalScore = Math.round(
      scores.resume * 0.15 + 
      scores.projects * 0.15 + 
      scores.technical * 0.2 + 
      scores.dsa * 0.2 + 
      scores.systemDesign * 0.15 + 
      scores.behavioral * 0.15
    );

    const hiringDecision = finalScore >= 85 ? 'Strong Hire' : (finalScore >= 75 ? 'Hire' : (finalScore >= 65 ? 'Lean Hire' : 'No Hire'));

    return {
      candidateSummary: `Chandan shows strong backend competence with solid familiarity in container tools (Docker), caching layouts (Redis), and high-scale coding (Golang, Python). Their DSA execution was optimal, solving problems with linear time complexities. Communication is clear, showing good confidence, though system design rounds highlighted minor gaps in distributed transaction handling and message broker configurations.`,
      strongAreas: ["Algorithm execution & DSA", "Backend caching patterns with Redis", "Clear conversational communication"],
      weakAreas: ["Distributed Transaction scalability", "Cache consistency protocols", "Alternative message queues tradeoffs"],
      estimatedReadiness: {
        google: 72,
        amazon: 81,
        meta: 76,
        microsoft: 84
      },
      scores,
      finalScore,
      hiringDecision
    };
  }

  const prompt = `
    Compile the final evaluation report for an interview session.
    Interview Summary: ${JSON.stringify(interviewData)}
    Questions, Answers, and Evaluations: ${JSON.stringify(questionsAndAnswers)}
    
    Calculate individual weighted section scores (0-100) for:
    - resume
    - projects
    - technical
    - dsa
    - systemDesign
    - behavioral
    
    Calculate the overall final weighted score.
    Decide the Hiring Status (Strong Hire, Hire, Lean Hire, No Hire).
    Provide summary statements, list of strong areas, weak areas, and estimated readiness percentage for Google, Amazon, Meta, and Microsoft.
    
    Output strictly as a JSON object:
    {
      "candidateSummary": "concise profile summary",
      "strongAreas": ["area1", "area2"],
      "weakAreas": ["area1", "area2"],
      "estimatedReadiness": {
        "google": 75,
        "amazon": 82,
        "meta": 78,
        "microsoft": 85
      },
      "scores": {
        "resume": 85,
        "projects": 80,
        "technical": 82,
        "dsa": 90,
        "systemDesign": 75,
        "behavioral": 85
      },
      "finalScore": 82.5,
      "hiringDecision": "Hire"
    }
  `;

  try {
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Error compiling final report:", err);
    // return defaults
    return compileFinalReport(interviewData, []);
  }
};
