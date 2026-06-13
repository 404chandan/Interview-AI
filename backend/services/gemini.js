import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let aiModel = null;

if (apiKey) {
  try {
    const ai = new GoogleGenerativeAI(apiKey);
    aiModel = ai.getGenerativeModel({ model: 'gemini-3.5-flash' });
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
      achievements: [
        "Optimized database indexing which cut down server load by 40%.",
        "Won 1st place in Siemens Internal Hackathon for AI Automation.",
        "Delivered a critical production hotfix that saved $50k in infrastructure costs."
      ],
      technologies: ["Docker", "AWS", "Linux", "Kubernetes", "Git"]
    };
  }

  const prompt = `
    Analyze the following resume text. Extract skills, projects, professional experience, achievements, and technical tools.
    Provide the output strictly as a JSON object matching this structure:
    {
      "skills": ["skill1", "skill2"],
      "projects": [{"name": "project name", "description": "project desc", "technologies": ["tech1"]}],
      "experience": [{"company": "company name", "role": "job title", "duration": "years/months", "description": "details"}],
      "achievements": ["achievement1", "achievement2"],
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
export const generateMockQuestion = (round, resumeData, history = [], targetCompany = 'Google') => {
  const skills = resumeData?.skills || ["JavaScript", "Python"];
  const projects = resumeData?.projects || [];
  const experience = resumeData?.experience || [];
  const achievements = resumeData?.achievements || [];
  
  // Return realistic, highly versatile mock questions based on the round and history
  if (round === 'resume') {
    const dynamicQuestions = [];
    
    // Build questions from experiences
    if (experience && experience.length > 0) {
      experience.forEach(exp => {
        dynamicQuestions.push(`Regarding your role as ${exp.role} at ${exp.company}: you wrote that you "${exp.description}". Can you describe the most challenging technical hurdle you faced in this role?`);
        dynamicQuestions.push(`At ${exp.company}, you worked as a ${exp.role} for ${exp.duration}. Can you detail the tech stack used and how cache invalidation or database schemas were structured?`);
      });
    }
    
    // Build questions from projects
    if (projects && projects.length > 0) {
      projects.forEach(proj => {
        dynamicQuestions.push(`Let's discuss your project "${proj.name}". You described it as: "${proj.description}". What were the architectural design tradeoffs you made, and how did you choose ${proj.technologies ? proj.technologies.join(', ') : 'the technologies'}?`);
      });
    }

    // Build questions from achievements
    if (achievements && achievements.length > 0) {
      achievements.forEach(ach => {
        dynamicQuestions.push(`In your achievements, you mentioned: "${ach}". Can you share more context on this and explain your individual contribution to this milestone?`);
      });
    }

    // Build questions from skills
    if (skills && skills.length > 0) {
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      dynamicQuestions.push(`You listed "${randomSkill}" as one of your core skills. Can you explain a complex project where you used "${randomSkill}" and how it helped solve the business problem?`);
    }
    
    // Fallback default questions if arrays are empty
    if (dynamicQuestions.length === 0) {
      dynamicQuestions.push(`Could you walk me through your background, highlighting your most significant technical accomplishments?`);
      dynamicQuestions.push(`Which of the projects on your resume are you most proud of, and what engineering tradeoffs did you make?`);
      dynamicQuestions.push(`You listed core skills like ${skills.slice(0, 3).join(', ')}. How do you apply these in your day-to-day software development?`);
    }
    
    // Select question based on history length, filtering out any questions that are already in history
    let selectedQuestionText = dynamicQuestions[history.length % dynamicQuestions.length];
    
    // Avoid duplicates if possible
    const askedQuestions = history.map(h => h.questionText);
    const uniqueUnasked = dynamicQuestions.filter(q => !askedQuestions.includes(q));
    if (uniqueUnasked.length > 0) {
      selectedQuestionText = uniqueUnasked[0];
    }
    
    return {
      questionText: selectedQuestionText,
      difficulty: 'medium',
      topics: ['Resume', 'Technical']
    };
  } else if (round === 'dsa') {
    const dsaQuestions = [
      {
        questionText: `[${targetCompany} Style Challenge] Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\`\`\`\n\n**Example 2:**\n\`\`\`\nInput: nums = [3, 2, 4], target = 6\nOutput: [1, 2]\n\`\`\``,
        codeTemplate: `function twoSum(nums, target) {\n    // Write your code here\n};`,
        difficulty: 'easy',
        topics: ['Arrays', 'Hash Map'],
        id: 'two-sum',
        functionName: 'twoSum',
        testCases: [
          { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
          { input: [[3, 2, 4], 6], expected: [1, 2] },
          { input: [[3, 3], 6], expected: [0, 1] }
        ]
      },
      {
        questionText: `[${targetCompany} Style Challenge] Given a string 's', find the length of the longest substring without repeating characters.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.\n\`\`\`\n\n**Example 2:**\n\`\`\`\nInput: s = "bbbbb"\nOutput: 1\nExplanation: The answer is "b", with the length of 1.\n\`\`\``,
        codeTemplate: `function lengthOfLongestSubstring(s) {\n    // Write your code here\n};`,
        difficulty: 'medium',
        topics: ['String', 'Sliding Window'],
        id: 'longest-substring',
        functionName: 'lengthOfLongestSubstring',
        testCases: [
          { input: ["abcabcbb"], expected: 3 },
          { input: ["bbbbb"], expected: 1 },
          { input: ["pwwkew"], expected: 3 },
          { input: [""], expected: 0 }
        ]
      },
      {
        questionText: `[${targetCompany} Style Challenge] Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: s = "()"\nOutput: true\n\`\`\`\n\n**Example 2:**\n\`\`\`\nInput: s = "()[]{}"\nOutput: true\n\`\`\`\n\n**Example 3:**\n\`\`\`\nInput: s = "(]"\nOutput: false\n\`\`\``,
        codeTemplate: `function isValid(s) {\n    // Write your code here\n};`,
        difficulty: 'easy',
        topics: ['Stack', 'String'],
        id: 'valid-parentheses',
        functionName: 'isValid',
        testCases: [
          { input: ["()"], expected: true },
          { input: ["()[]{}"], expected: true },
          { input: ["(]"], expected: false },
          { input: ["([)]"], expected: false },
          { input: ["{[]}"], expected: true }
        ]
      },
      {
        questionText: `[${targetCompany} Style Challenge] Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].\n\`\`\`\n\n**Example 2:**\n\`\`\`\nInput: intervals = [[1,4],[4,5]]\nOutput: [[1,5]]\nExplanation: Intervals [1,4] and [4,5] are considered overlapping.\n\`\`\``,
        codeTemplate: `function merge(intervals) {\n    // Write your code here\n};`,
        difficulty: 'medium',
        topics: ['Array', 'Sorting'],
        id: 'merge-intervals',
        functionName: 'merge',
        testCases: [
          { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
          { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] }
        ]
      },
      {
        questionText: `[${targetCompany} Style Challenge] Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: nums = [1,2,3,1]\nOutput: true\n\`\`\`\n\n**Example 2:**\n\`\`\`\nInput: nums = [1,2,3,4]\nOutput: false\n\`\`\``,
        codeTemplate: `function containsDuplicate(nums) {\n    // Write your code here\n};`,
        difficulty: 'easy',
        topics: ['Array', 'Hash Table'],
        id: 'contains-duplicate',
        functionName: 'containsDuplicate',
        testCases: [
          { input: [[1, 2, 3, 1]], expected: true },
          { input: [[1, 2, 3, 4]], expected: false },
          { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true }
        ]
      }
    ];
    
    const askedQuestions = history.map(h => h.questionText);
    const uniqueUnasked = dsaQuestions.filter(q => !askedQuestions.some(asked => asked.includes(q.id) || q.questionText.includes(asked)));
    const selected = uniqueUnasked.length > 0 ? uniqueUnasked[0] : dsaQuestions[Math.floor(Math.random() * dsaQuestions.length)];
    return selected;
  } else if (round === 'system_design') {
    const designTopics = [
      { questionText: `[${targetCompany} Style Challenge] Design a URL Shortener like TinyURL. Focus on database choices, API designs, and how to scale to 100M daily active requests.`, difficulty: 'medium', topics: ['System Design', 'Scaling'] },
      { questionText: `[${targetCompany} Style Challenge] Design a Rate Limiter system that can be deployed at scale across a distributed API gateway setup.`, difficulty: 'medium', topics: ['System Design', 'API Gateway'] },
      { questionText: `[${targetCompany} Style Challenge] Design WhatsApp. Detail the socket layer, database choice for messaging history, and how to scale notifications for offline users.`, difficulty: 'hard', topics: ['System Design', 'Sockets'] },
      { questionText: `[${targetCompany} Style Challenge] Design a Distributed Cache system. Cover cache coherency, eviction strategies, and node registration.`, difficulty: 'hard', topics: ['System Design', 'Caching'] }
    ];
    
    const askedQuestions = history.map(h => h.questionText);
    const uniqueUnasked = designTopics.filter(q => !askedQuestions.includes(q.questionText));
    const selected = uniqueUnasked.length > 0 ? uniqueUnasked[0] : designTopics[Math.floor(Math.random() * designTopics.length)];
    return selected;
  } else {
    const behavioral = [
      "Tell me about a time when you had a conflict with a peer or teammate. How did you approach resolving it and what was the outcome?",
      "Describe a project or milestone that failed under your watch. What did you learn and how did it shape your future approach?",
      "How do you prioritize features or handle shifting requirements from product management when under tight release deadlines?",
      "Tell me about a time when you had to work with a very difficult stakeholder or customer. How did you manage that relationship?",
      "Describe a situation where you had to make an important technical decision with limited information or data. What was your process?",
      "Can you share an example of a time you went above and beyond your standard job duties to deliver a critical project?",
      "Describe a time when you had to quickly learn a new technology or domain to complete a task. How did you ramp up?",
      "Tell me about a time when you disagreed with your manager's direction. How did you voice your opinion and what was the resolution?",
      "What is the most complex bug or technical issue you've resolved in production? Walk me through how you diagnosed and fixed it."
    ];
    
    const askedQuestions = history.map(h => h.questionText);
    const uniqueUnasked = behavioral.filter(q => !askedQuestions.includes(q));
    let selectedQuestionText = uniqueUnasked.length > 0 ? uniqueUnasked[0] : behavioral[Math.floor(Math.random() * behavioral.length)];

    return {
      questionText: selectedQuestionText,
      difficulty: 'medium',
      topics: ['Behavioral', 'STAR Methodology']
    };
  }
};

export const generateQuestion = async (round, resumeData, history = [], targetCompany = 'Google') => {
  const role = resumeData?.role || "Software Engineer";
  const experienceYears = resumeData?.experienceYears || 2;
  const skills = resumeData?.skills || ["JavaScript", "Python"];
  const projects = resumeData?.projects || [];
  const experience = resumeData?.experience || [];
  const achievements = resumeData?.achievements || [];
  const technologies = resumeData?.technologies || [];

  if (!aiModel) {
    return generateMockQuestion(round, resumeData, history, targetCompany);
  }

  // Select a random DSA topic to avoid repeating substring questions
  const dsaTopics = ['Arrays', 'Strings', 'Stacks & Queues', 'Linked Lists', 'Trees & BST', 'Graphs', 'Dynamic Programming', 'Matrix / 2D Grid', 'Hash Tables', 'Recursion & Backtracking', 'Sorting & Binary Search'];
  const randomDsaTopic = dsaTopics[Math.floor(Math.random() * dsaTopics.length)];

  // Real LLM Generation with rich context and settings
  const prompt = `
    You are conducting a premium technical/behavioral interview. Generate a highly relevant and unique interview question for a candidate with the following profile:
    Role: ${role}
    Experience: ${experienceYears} Years
    Skills: ${skills.join(', ')}
    Technologies: ${technologies.join(', ')}
    Achievements: ${JSON.stringify(achievements)}
    Work History/Experiences: ${JSON.stringify(experience)}
    Projects: ${JSON.stringify(projects)}
    
    Target Company Style: ${targetCompany}
    Current Round: ${round}
    Previous Interview Questions History: ${JSON.stringify(history.map(h => h.questionText))}
    
    Instructions:
    - CRITICAL CONVERSATIONAL STYLE: The generated question MUST be a single, concise, human-friendly, and conversational question. Do NOT ask multiple sub-questions, bullet points, or multi-part/numbered lists of questions in a single turn. Seek exactly ONE explanation, design choice, or response at a time, keeping it like a real-time back-and-forth interview.
    - If round is "resume", generate a deep-dive question targeting one of their listed projects, work experience achievements, or technologies. Refer directly to the name of the company or project. Make it specific and avoid generic questions.
    - If round is "dsa", generate a LeetCode style coding question specifically for the topic: "${randomDsaTopic}" (do NOT limit yourself to substring problems!).
      Provide a clean function boilerplate for JavaScript in "codeTemplate".
      Provide a unique slug/name (e.g. "reverse-string") in "id".
      Provide the main function name to evaluate in "functionName".
      Under "questionText", describe the problem clearly and you MUST include at least two Markdown-formatted Examples showing:
        Example 1:
        Input: ...
        Output: ...
        Explanation: ...
      Also you MUST generate a "testCases" array of 3 objects, where each object has:
        "input": [arg1, arg2, ...] (the parameters passed to the function, represented as an array of arguments. E.g. for twoSum(nums, target) it is [[2,7,11,15], 9] which is an array with two elements: a sub-array and a number)
        "expected": expected_output_value (the expected output value returned by the function)
      Ensure the test cases are realistic, match the signature of the function, and can be evaluated using standard JSON comparisons.
    - If round is "system_design", ask for architectural designs suitable for YOE of ${experienceYears} tailored to the typical systems scale of ${targetCompany}. E.g. URL Shortener, Rate Limiter, WhatsApp, or Distributed Cache.
    - If round is "behavioral", ask STAR-format questions challenging their leadership, conflicts, failures, or task management, aligning with ${targetCompany}'s core values.
    
    CRITICAL: Do NOT generate any question that is identical or highly similar to any question listed in the "Previous Interview Questions History". Ensure high versatility and variety.
    
    Output strictly as a JSON object matching this structure:
    {
      "questionText": "the question detail with Example 1 and Example 2 sections",
      "codeTemplate": "boilerplate code string (only for dsa)",
      "difficulty": "easy/medium/hard",
      "topics": ["topic1", "topic2"],
      "id": "slug-id-for-code-executor",
      "functionName": "the main function name to evaluate (only for dsa)",
      "testCases": [{"input": [args], "expected": val}] (only for dsa)
    }
  `;

  try {
    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85
      }
    });
    const response = await result.response;
    const cleanText = response.text().replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Error generating question from Gemini, using fallback mock generation:", err);
    return generateMockQuestion(round, resumeData, history, targetCompany);
  }
};

/**
 * Evaluates candidate responses (real-time voice transcript or coding input)
 */
export const evaluateAnswer = async (questionText, answerText, round, history = []) => {
  if (!aiModel) {
    const randomScore = Math.floor(Math.random() * 3) + 7; // 7, 8, 9
    
    let followUp = "That makes sense. Can you elaborate on how you handled the tradeoffs in that situation?";
    if (round === 'resume') {
      const followups = [
        "How did you design cache eviction and handle data consistency in that layout?",
        "What specific metrics did you look at to evaluate performance improvements?",
        "If you had to rebuild that project today, what architecture choices would you change?",
        "How did you secure your backend APIs and handle authentication/authorization in that setup?",
        "What was the scale of requests/data you processed, and how did you scale your system horizontally?"
      ];
      
      const askedQuestions = history.map(h => h.questionText);
      const uniqueUnasked = followups.filter(q => !askedQuestions.includes(q));
      followUp = uniqueUnasked.length > 0 ? uniqueUnasked[Math.floor(Math.random() * uniqueUnasked.length)] : followups[Math.floor(Math.random() * followups.length)];
    } else if (round === 'behavioral') {
      const followups = [
        "If your teammates had a different perspective, how would you incorporate their opinions?",
        "Looking back, what is the single biggest lesson you learned from that experience?",
        "How did you communicate the delay or conflict to project stakeholders?",
        "What would you do differently if you were faced with the same scenario again?",
        "How did this experience change the way you mentor juniors or guide other engineers?"
      ];
      
      const askedQuestions = history.map(h => h.questionText);
      const uniqueUnasked = followups.filter(q => !askedQuestions.includes(q));
      followUp = uniqueUnasked.length > 0 ? uniqueUnasked[Math.floor(Math.random() * uniqueUnasked.length)] : followups[Math.floor(Math.random() * followups.length)];
    }

    return {
      score: randomScore,
      feedback: `You demonstrated solid understanding of this topic. You clearly outlined the key parameters. To improve further, consider discussing memory layouts or edge cases like high concurrency.`,
      followUpQuestion: followUp
    };
  }

  const prompt = `
    You are a technical interviewer conducting a live round of: ${round}.
    Question Asked: "${questionText}"
    Candidate Answered: "${answerText}"
    Previous Interview History: ${JSON.stringify(history.map(h => h.questionText))}
    
    Evaluate the response. Grade it on a scale of 0 to 10.
    Generate constructive feedback.
    Also generate a natural, conversational follow-up question extending their answer or addressing a missed edge case.
    
    CRITICAL: The follow-up question MUST be a single, concise, human-friendly, and conversational question. Do NOT ask multiple sub-questions, bullet points, or numbered lists. Seek exactly ONE specific explanation or detail, keeping it like a real-time conversation.
    
    CRITICAL: The follow-up question must be unique and must NOT duplicate or overlap with any questions or concepts from the "Previous Interview History".
    
    Output strictly as a JSON object matching this structure:
    {
      "score": 8,
      "feedback": "detailed review text",
      "followUpQuestion": "natural conversational follow-up question"
    }
  `;

  try {
    const result = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8
      }
    });
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
    // Return structured fallback directly to avoid recursive calls and hang ups
    const scores = {
      resume: 80,
      projects: 78,
      technical: 82,
      dsa: 85,
      systemDesign: 75,
      behavioral: 80
    };
    return {
      candidateSummary: "Failed to compile report with AI. Default evaluation generated. The candidate shows good overall software development understanding and clear communication.",
      strongAreas: ["Coding logic and syntax structures", "Clear communication and speaking pace"],
      weakAreas: ["System Design trade-offs detail"],
      estimatedReadiness: {
        google: 70,
        amazon: 78,
        meta: 74,
        microsoft: 80
      },
      scores,
      finalScore: 80,
      hiringDecision: "Hire"
    };
  }
};
