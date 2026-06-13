import React, { useState } from 'react';
import CodingSandbox from './CodingSandbox';
import { BookOpen, Sparkles, Code, Play } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function LeetCodeGenerator() {
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('medium');
  const [company, setCompany] = useState('Google');
  const [question, setQuestion] = useState(null);
  const [generating, setGenerating] = useState(false);

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
        body: JSON.stringify({ topic, difficulty, company })
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      console.warn("Offline fallback for LeetCode question generation.");
      // Simulated question object
      setTimeout(() => {
        setQuestion({
          id: 'mock-dynamic-' + Date.now(),
          questionText: `Design a function to find the longest substring in a string 's' that contains at most 2 distinct characters.\n\nInput: s = "eceba"\nOutput: 3\nExplanation: The substring is "ece" with length 3.\n\nConstraints:\n- 1 <= s.length <= 10^5\n- s consists of English letters.`,
          codeTemplate: `function lengthOfLongestSubstringTwoDistinct(s) {\n    // Write your code here\n};`,
          difficulty: difficulty,
          topics: [topic, 'Hash Map'],
          functionName: 'lengthOfLongestSubstringTwoDistinct'
        });
      }, 800);
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
          <BookOpen className="w-12 h-12 text-brandBlue mx-auto" />
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
