import React, { useState } from 'react';
import { X, Send, MessageSquare, Bot, User, ArrowRight } from 'lucide-react';
import { fetchPriorityQueue, fetchDashboardSummary, fetchProjectExplanation } from '../services/api';

export const AIAssistantModal = ({ isOpen, onClose, onSelectProject }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Welcome to the PAIMANA Infrastructure Decision Support Assistant. I synthesize predictive risk signals, TreeSHAP root cause factor attributions, and administrative priority queues across central sector projects.',
      data: null,
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const examplePrompts = [
    'Which projects have the fastest rising risk?',
    'Show top Railway projects by Intervention Priority Index',
    'Why is project P0001 high risk and what review is recommended?',
    'What is the portfolio capex at risk across National Highways?',
  ];

  async function handleSend(userText) {
    const textToSend = userText || query;
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMsgs);
    setQuery('');
    setLoading(true);

    try {
      const lower = textToSend.toLowerCase();

      if (lower.includes('fastest rising') || lower.includes('deteriorat')) {
        const queue = await fetchPriorityQueue(10);
        const deteriorating = queue.filter((p) => p.trend_direction === 'deteriorating').slice(0, 3);
        
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text: `Based on 3-month risk trajectory tracking, here are the top projects experiencing rapid risk deterioration:`,
            projects: deteriorating,
            recommendation: 'These projects combine multi-month progress stagnation with schedule slippage acceleration and require immediate administrative review.',
          },
        ]);
      } else if (lower.includes('railway') || lower.includes('rail')) {
        const queue = await fetchPriorityQueue(10, 'Railways');
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text: `Top priority Railway corridor and capacity projects ordered by Intervention Priority Index (IPI):`,
            projects: queue.slice(0, 4),
            recommendation: 'Priority is driven by capital outlay exposure and critical-path track doubling / signaling bottlenecks.',
          },
        ]);
      } else if (lower.includes('p0001') || lower.includes('p0002') || lower.includes('why')) {
        const match = textToSend.match(/P\d{4}/i);
        const targetPid = match ? match[0].toUpperCase() : 'P0001';
        const exp = await fetchProjectExplanation(targetPid);

        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text: `Root Cause Diagnosis for Project ${targetPid}:`,
            diagnosis: exp.diagnosis,
            attributions: exp.attributions,
            targetPid: targetPid,
            recommendation: 'Prescribed review directive: Schedule recovery re-baselining and contractor capacity audit.',
          },
        ]);
      } else {
        const sum = await fetchDashboardSummary();
        const topSec = sum.top_sectors_at_risk?.[0] || { sector: 'National Highways', red_count: 84 };
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text: `National Infrastructure Portfolio Briefing (April 2026):`,
            stats: [
              `Total Projects Monitored: ${sum.total_projects.toLocaleString()}`,
              `Total Revised Capex: ₹${(sum.total_revised_cost_cr / 100000).toFixed(2)} Lakh Crore`,
              `Critical Review (RED Tier) Projects: ${sum.risk_counts?.RED || 0}`,
              `Highest Exposure Sector: ${topSec.sector} (${topSec.red_count} Critical Projects)`,
            ],
            recommendation: 'Use the Priority Queue tab to review projects ordered by administrative decision urgency.',
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: 'Error processing inquiry. Please verify backend connection.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <span>PAIMANA Decision Support Assistant</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Grounded Synthesis
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Structured SQL + SHAP Explainability</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3 rounded-xl max-w-xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-700 text-white rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>

                {/* Structured Project Output */}
                {m.projects && (
                  <div className="mt-2.5 space-y-1.5 font-mono">
                    {m.projects.map((p) => (
                      <div
                        key={p.project_id}
                        onClick={() => {
                          onSelectProject(p.project_id);
                          onClose();
                        }}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-700 cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white font-sans text-xs">{p.project_name}</div>
                          <div className="text-[10px] text-slate-400">
                            {p.project_id} • {p.sector} • ₹{p.revised_cost} Cr
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-amber-400">
                            IPI: {p.ipi_score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Structured Diagnosis */}
                {m.diagnosis && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                    "{m.diagnosis}"
                  </div>
                )}

                {/* Structured Stats */}
                {m.stats && (
                  <ul className="mt-2 space-y-1 text-xs list-disc list-inside text-slate-300 font-mono">
                    {m.stats.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}

                {m.recommendation && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                    Directives: {m.recommendation}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs pl-8">
              <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Querying infrastructure knowledge base & generating synthesis...</span>
            </div>
          )}
        </div>

        {/* Prompt Chips */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap gap-1.5">
          {examplePrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Inquire on portfolio risk, TreeSHAP root causes, or priority projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="p-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
