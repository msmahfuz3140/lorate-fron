'use client';

import React, { useState } from 'react';
import { authClient } from '../../../lib/auth-client';
import { useToast } from '../../../components/admin/ToastContext';
import {
  Sparkles,
  Send,
  ShieldAlert,
  ShieldCheck,
  Bot,
  User,
  Clock,
  HelpCircle,
  TrendingUp,
  CreditCard,
  Sliders,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  category?: string;
  dataSummary?: Record<string, any>;
  timestamp: string;
}

const PRESET_QUERIES = [
  'How many confirmed subscriptions were sold this month?',
  'Which plan is most popular?',
  'How many subscriptions will expire within seven days?',
  'Which moderator has the most confirmed attributed sales?',
  'How many payments are pending?',
  'What security alerts occurred in the last 24 hours?'
];

export default function AdminAiAssistantPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Welcome Main Admin. I am your read-only telemetry intelligence assistant. You can ask me natural language inquiries regarding sales, expiring subscriptions, plan popularity, moderator attribution, and security incidents. All metrics are aggregated directly from the live MongoDB database without estimation.',
      category: 'GENERAL',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendQuery = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const res = await authClient.queryAdminAiAssistant(q);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        category: res.category,
        dataSummary: res.dataSummary,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      showToast('error', err?.message || 'AI inquiry failed.');
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'assistant',
          text: `Inquiry failed: ${err?.message || 'Internal processing error'}`,
          category: 'GENERAL',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-amber-400" />
            AI Admin Assistant (Read-Only Analytics)
          </h1>
          <p className="font-display text-xs uppercase tracking-wider text-slate-400 mt-1">
            Natural language intelligence engine evaluating actual database aggregates
          </p>
        </div>

        {/* Read-Only Safety Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-display text-xs font-bold uppercase tracking-wider text-emerald-300">
            Read-Only Guard Enforced
          </span>
        </div>
      </div>

      {/* Suggested Inquiries Chips */}
      <div className="space-y-2">
        <span className="text-xs font-display uppercase tracking-wider text-slate-400 block">
          Frequent Executive Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset}
              onClick={() => handleSendQuery(preset)}
              disabled={isProcessing}
              className="text-left rounded-xl border border-white/10 bg-[#070b14] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/5 transition-all disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="rounded-2xl border border-white/10 bg-[#070b14] flex flex-col h-[520px] shadow-2xl overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'assistant';

            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                    isAi
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                      : 'border-white/20 bg-white/10 text-slate-200'
                  }`}
                >
                  {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl border space-y-2 leading-relaxed ${
                    isAi
                      ? 'border-white/10 bg-white/[0.02] text-slate-200'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-100 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 gap-4">
                    <span className="font-display uppercase font-bold text-slate-400">
                      {isAi ? 'AI Admin Intelligence' : 'Main Admin'}
                    </span>
                    <span className="font-mono">{m.timestamp}</span>
                  </div>

                  <p className="text-xs whitespace-pre-wrap">{m.text}</p>

                  {/* Optional data summary chips */}
                  {m.dataSummary && Object.keys(m.dataSummary).length > 0 && (
                    <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                      {Object.entries(m.dataSummary).map(([k, v]) => {
                        if (typeof v === 'object') return null;
                        return (
                          <div
                            key={k}
                            className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                          >
                            <span className="text-slate-500">{k}:</span> <span className="font-bold text-white">{String(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex gap-3 max-w-md mr-auto animate-pulse">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] text-slate-400 text-xs flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                Aggregating real-time database records...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-[#070b14]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask an analytical question about sales, subscribers, plan distribution, moderators..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isProcessing}
              className="flex-1 p-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputQuery.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Inquire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
