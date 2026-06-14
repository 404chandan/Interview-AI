import React, { useState } from 'react';
import CodingSandbox from './CodingSandbox';
import { BookOpen, Sparkles, Code, Play } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function LeetCodeGenerator() {
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('medium');
  const [company, setCompany] = useState('Google');
  const [historyList, setHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('leetcode_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const topics = [
    'Arrays', 'Trees', 'Graphs', 'DP', 'Greedy', 'Trie', 'Heap', 
    'Binary Search', 'Linked List', 'Backtracking', 
    'Array + Sliding Window', 'Graph + BFS', 'Tree + DP', 'Heap + Greedy'
  ];

  const difficulties = ['easy', 'medium', 'hard'];
  const companies = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Uber', 'Atlassian'];

  const handleGenerate = async () => {
    setGenerating(true);
    setQuestion(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/leetcode/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, company, history: historyList })
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setQuestion(data);
      
      const newHistory = [...historyList, data.id || data.functionName || data.questionText.split('\n')[0]];
      if (newHistory.length > 30) newHistory.shift();
      setHistoryList(newHistory);
      localStorage.setItem('leetcode_history', JSON.stringify(newHistory));
    } catch (err) {
      console.warn("Offline fallback for LeetCode question generation.");
      
      const cleanTopic = topic || 'Arrays';
      const cleanCompany = company || 'General';
      const lowercaseTopic = cleanTopic.toLowerCase();
      
      let mockQ;
      if (lowercaseTopic.includes('tree') || lowercaseTopic.includes('bst')) {
        mockQ = {
          id: 'mock-tree-' + Date.now(),
          questionText: `[${cleanCompany} Practice Challenge] Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: root = [3,9,20,null,null,15,7]\nOutput: 3\n\`\`\`\n\nConstraints:\n- The number of nodes in the tree is in the range [0, 10^4].`,
          codeTemplate: `function maxDepth(root) {\n    // Write your code here\n};`,
          difficulty: difficulty,
          topics: [cleanTopic, 'DFS'],
          functionName: 'maxDepth'
        };
      } else if (lowercaseTopic.includes('graph') || lowercaseTopic.includes('bfs') || lowercaseTopic.includes('dfs')) {
        mockQ = {
          id: 'mock-graph-' + Date.now(),
          questionText: `[${cleanCompany} Practice Challenge] There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\n\`\`\`\n\nConstraints:\n- 1 <= numCourses <= 2000`,
          codeTemplate: `function canFinish(numCourses, prerequisites) {\n    // Write your code here\n};`,
          difficulty: difficulty,
          topics: [cleanTopic, 'BFS', 'Topological Sort'],
          functionName: 'canFinish'
        };
      } else if (lowercaseTopic.includes('matrix') || lowercaseTopic.includes('grid')) {
        mockQ = {
          id: 'mock-matrix-' + Date.now(),
          questionText: `[${cleanCompany} Practice Challenge] Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]\nOutput: 1\n\`\`\``,
          codeTemplate: `function numIslands(grid) {\n    // Write your code here\n};`,
          difficulty: difficulty,
          topics: [cleanTopic, 'DFS', 'Matrix'],
          functionName: 'numIslands'
        };
      } else if (lowercaseTopic.includes('stack') || lowercaseTopic.includes('queue') || lowercaseTopic.includes('parentheses')) {
        mockQ = {
          id: 'mock-stack-' + Date.now(),
          questionText: `[${cleanCompany} Practice Challenge] Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: s = "()"\nOutput: true\n\`\`\``,
          codeTemplate: `function isValid(s) {\n    // Write your code here\n};`,
          difficulty: difficulty,
          topics: [cleanTopic, 'Stack'],
          functionName: 'isValid'
        };
      } else {
        mockQ = {
          id: 'mock-array-' + Date.now(),
          questionText: `[${cleanCompany} Practice Challenge] Given an array of integers nums, return true if any value appears at least twice in the array, and return false if every element is distinct.\n\n### Examples\n\n**Example 1:**\n\`\`\`\nInput: nums = [1,2,3,1]\nOutput: true\n\`\`\``,
          codeTemplate: `function containsDuplicate(nums) {\n    // Write your code here\n};`,
          difficulty: difficulty,
          topics: [cleanTopic, 'Hash Set'],
          functionName: 'containsDuplicate'
        };
      }

      setTimeout(() => {
        setQuestion(mockQ);
        const newHistory = [...historyList, mockQ.id];
        if (newHistory.length > 30) newHistory.shift();
        setHistoryList(newHistory);
        localStorage.setItem('leetcode_history', JSON.stringify(newHistory));
      }, 500);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Code className="w-6 h-6 text-brandBlue" /> Topic-wise DSA Prep
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Generate custom coding questions with instant compilation and detailed AI code reviews.
          </p>
        </div>
      </div>

      {!question ? (
        <div className="glass-panel rounded-xl p-8 max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12" />
            <BookOpen className="w-12 h-12 text-brandBlue" />
            {historyList.length > 0 ? (
              <button 
                onClick={() => {
                  setHistoryList([]);
                  localStorage.removeItem('leetcode_history');
                }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-500/20 px-2.5 py-1 rounded bg-red-500/5 hover:bg-red-500/10"
              >
                Reset History ({historyList.length})
              </button>
            ) : (
              <div className="w-[100px]" />
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-200">Configure Practice Workspace</h2>
          
          <div className="space-y-4 text-left">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Topic / Mixed Category</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Arrays, Graphs, Dynamic Programming, Heap, or enter custom"
                className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-gray-300 text-sm placeholder-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-gray-300 text-sm capitalize"
                >
                  {difficulties.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Company Style</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon, Uber, or enter custom"
                  className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-brandBlue text-gray-300 text-sm placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-brandBlue to-brandPurple text-white font-semibold hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brandBlue/10 disabled:opacity-50"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Assembling question parameters...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current text-yellow-300" />
                Generate LeetCode Challenge
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button 
            onClick={() => setQuestion(null)}
            className="text-xs font-semibold text-brandBlue hover:underline"
          >
            ← Configure Another Question
          </button>
          
          <div className="glass-panel rounded-xl p-6">
            <CodingSandbox 
              question={question} 
              isInterviewMode={false} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
