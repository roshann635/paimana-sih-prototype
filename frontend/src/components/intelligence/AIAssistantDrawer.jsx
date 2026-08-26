import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, FileText, CheckCircle2, ShieldCheck, ArrowRight, CornerDownLeft } from 'lucide-react';
import { paimanaApi } from '../../services/api/paimanaApi';

const SUGGESTED_QUERIES = [
  "Which projects have the highest Intervention Priority (IPI)?",
  "Inspect Project 618233 risk drivers and TreeSHAP attributions",
  "Summarize Maharashtra state infrastructure portfolio",
  "What are the XGBoost model evaluation and ROC-AUC metrics?",
  "What is the capital exposure across Roads & Highways?"
];

export default function AIAssistantDrawer({ isOpen, onClose, onSelectProject }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Greetings. I am the **PAIMANA Decision Support Assistant**.\n\nYou may query the active database across all 1,630 central infrastructure projects, inspect TreeSHAP factor attributions, explore state-level risk concentrations, or review XGBoost model governance metrics.',
      evidence: ['PAIMANA Master Database (1,630 Projects)', 'MoSPI Flash Reports', 'v1.0-temporal-xgb Model'],
      confidence: 'HIGH'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend = null) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg = { role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await paimanaApi.queryAssistant({ query: q });
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer,
          evidence: res.evidence_sources || ['Database Record'],
          confidence: res.confidence ? `${Math.round(res.confidence * 100)}%` : 'HIGH',
          projectId: res.project_id
        }
      ]);
    } catch (err) {
      console.error('Assistant query failed:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to process query against the active database. Please verify backend service connection.',
          evidence: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 font-sans">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;
          
          // Bold formatting
          let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
          formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');
          formatted = formatted.replace(/`(.*?)`/g, '<code class="px-1 py-0.2 rounded bg-[#07131F] text-[#00E5FF] font-mono text-[10px]">$1</code>');

          if (line.startsWith('• ') || line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-[#00E5FF] mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•\-]\s*/, '') }} />
              </div>
            );
          }
          return <p key={idx} dangerouslySetInnerHTML={{ __html: formatted }} />;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 flex justify-end transition-opacity backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#07131F] border-l border-[#16324A] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200 text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-[#16324A] bg-[#0D1E30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center shadow-gold-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono">Ask PAIMANA AI</h3>
              <p className="text-[10px] font-mono text-[#00E5FF]">Grounded Decision Intelligence Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16324A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#07131F]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-xl max-w-[95%] text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-white font-medium shadow-cyan-glow'
                    : 'bg-[#0D1E30] border border-[#16324A] text-slate-200 shadow-command-card space-y-2.5'
                }`}
              >
                {renderFormattedText(m.text)}

                {/* Direct Action: Deep Dive Button */}
                {m.projectId && onSelectProject && (
                  <div className="pt-2 border-t border-[#16324A]">
                    <button
                      onClick={() => {
                        onSelectProject(m.projectId);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F59E0B] text-[#07131F] text-[10px] font-mono font-bold rounded shadow-gold-glow hover:bg-[#D97706] transition-colors"
                    >
                      <span>Inspect Project Deep Dive ({m.projectId})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Evidence Citations */}
                {m.evidence && m.evidence.length > 0 && (
                  <div className="pt-2 border-t border-[#16324A] flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                    <span className="text-slate-400 font-bold">Grounded Sources:</span>
                    {m.evidence.map((ev, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-[#07131F] text-[#00E5FF] border border-[#16324A]"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] bg-[#0D1E30] p-3 rounded-xl border border-[#16324A] w-fit animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Querying longitudinal database & TreeSHAP attributions...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries Strip */}
        <div className="p-2.5 border-t border-[#16324A] bg-[#0B1A2A] overflow-x-auto">
          <div className="text-[10px] font-mono font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <span>Suggested Inquiries</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] font-mono bg-[#07131F] hover:bg-[#11263C] text-slate-300 hover:text-white rounded-md border border-[#16324A] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <div className="p-3 border-t border-[#16324A] bg-[#0D1E30]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a project code, sector, state, or model health..."
              className="flex-1 bg-[#07131F] border border-[#16324A] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00E5FF] font-sans transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-30 text-[#07131F] font-bold rounded-lg transition-colors shadow-gold-glow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
