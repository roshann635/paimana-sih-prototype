import React, { useState } from 'react';
import { X, Sparkles, Send, Bot } from 'lucide-react';

const SUGGESTED_QUERIES = [
  "Which projects have the highest Intervention Priority (IPI)?",
  "What are the top risk drivers for Road Transport & Highways?",
  "Which sectors have the highest Capex at Risk?",
  "Summarize the latest out-of-time model validation performance."
];

export default function AIAssistantDrawer({ isOpen, onClose, onSelectProject }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Greetings. I am the PAIMANA Decision Support Assistant. You may query the monitored central infrastructure database, inspect TreeSHAP factor attributions, or ask for sector-wise risk summaries.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend = null) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg = { role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let replyText = "Based on current MoSPI Flash Report records in the database, 1,630 projects are monitored with 38 projects flagged in Critical Review status. The primary drivers are contractor disputes and cumulative schedule slippage.";
      
      if (q.toLowerCase().includes('ipi') || q.toLowerCase().includes('highest risk')) {
        replyText = "The top projects by Intervention Priority Index (IPI) exhibit critical schedule delays exceeding 180 days and disproportionate expenditure velocity. Recommended action: convenes IPMD quarterly review with the implementing ministry.";
      } else if (q.toLowerCase().includes('sector') || q.toLowerCase().includes('capex')) {
        replyText = "Road Transport & Highways and Railways account for the largest share of Capex at Risk (>60% of total portfolio exposure). Median peer progress velocity stands at 2.4% per month.";
      } else if (q.toLowerCase().includes('model') || q.toLowerCase().includes('validation')) {
        replyText = "The XGBoost temporal models were validated on out-of-time test snapshots (Sept–Oct 2025). The Cost Overrun model achieves ROC-AUC 0.8656, and Time Overrun model achieves ROC-AUC 0.8470.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-gov-surface border-l border-gov-border shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#C9DFDD] bg-intel-light flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-gov-sm bg-intel text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-intel">Ask PAIMANA</h3>
              <p className="text-[11px] text-text-secondary">Government Infrastructure Decision Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-gov-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gov-bg">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 text-xs ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-intel-light border border-[#C9DFDD] flex items-center justify-center shrink-0 text-intel">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-gov max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand text-white font-medium'
                    : 'bg-gov-surface border border-gov-border text-text-primary shadow-gov'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 text-xs items-center text-text-muted">
              <Bot className="w-4 h-4 animate-spin text-intel" />
              <span>Querying portfolio database & TreeSHAP models...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="p-3 bg-gov-surface border-t border-gov-border space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Suggested Administrative Queries
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] text-left px-2.5 py-1 bg-[#F7F7F4] hover:bg-gov-secondary rounded-gov-sm text-text-primary transition-colors border border-gov-border"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-gov-border bg-gov-surface flex gap-2">
          <input
            type="text"
            placeholder="Type query regarding portfolio, sectors, or projects..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-gov-surface border border-gov-border rounded-gov-sm px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-intel focus:ring-1 focus:ring-intel/20"
          />
          <button
            onClick={() => handleSend()}
            className="px-3.5 py-2 bg-intel hover:bg-intel/90 text-white text-xs font-semibold rounded-gov-sm transition-colors flex items-center gap-1 shadow-gov"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
