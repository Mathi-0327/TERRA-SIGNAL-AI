'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ApiClient } from '@/lib/api-client';
import { AIAnalystResponse } from '@/types/api';
import { formatINR, getDecisionStyle } from '@/lib/formatting';
import {
  Activity,
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  Database,
  HelpCircle,
  MapPin,
  MessageSquare,
  Radio,
  Send,
  ShieldAlert,
  Sparkles,
  User,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  structuredResponse?: AIAnalystResponse;
  timestamp: string;
}

const PRESET_PROMPTS = [
  'Should I consider investing in OMR right now?',
  'Compare OMR and Tambaram trade-offs and growth.',
  'Why is the risk score high in Velachery?',
  'What happens if buyer demand falls 15% in OMR?',
  'Which Chennai micro-market has the best rental yield?',
  'Explain why the decision shifted from BUY to WAIT.'
];

export default function AIAnalystPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello. I am the TerraSignal AI Decision Intelligence Analyst. Every recommendation is strictly grounded in verified database tables, ML valuation model weights, and 8-dimensional multi-factor risk matrices. How can I assist your real estate portfolio allocation today?',
      timestamp: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText: string) => {
    const textToSend = queryText.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res: AIAnalystResponse = await ApiClient.queryAIAnalyst({
        question: textToSend
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer,
        structuredResponse: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI Analyst query error:', err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'An error occurred while querying platform telemetry. Please ensure the backend server is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  AI Decision Intelligence Analyst
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-financial">
                  Grounded RAG
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Zero-hallucination intelligence citing NHB RESIDEX indices, TNRERA registries & ML models
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 font-financial bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Zero Hallucination Grounding</span>
          </div>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-financial">
            Suggested Analysis Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-xs text-slate-700 transition-all text-left flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Stream Window */}
        <div className="panel p-6 min-h-[500px] flex flex-col justify-between shadow-sm space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[580px] pr-2 scrollbar-none">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-xl max-w-3xl space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {/* Primary text */}
                  <p className="whitespace-pre-line text-sm leading-relaxed">{msg.text}</p>

                  {/* Structured Assistant Breakdown Card */}
                  {msg.structuredResponse && (
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      {/* Decision Posture Tag */}
                      {msg.structuredResponse.recommendation && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 uppercase font-bold font-financial">Recommendation:</span>
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider font-financial border ${getDecisionStyle(msg.structuredResponse.recommendation).bg}`}>
                            {msg.structuredResponse.recommendation}
                          </span>
                          <span className="text-xs text-slate-600 font-financial font-semibold">
                            ({(msg.structuredResponse.confidence * 100).toFixed(0)}% Confidence)
                          </span>
                        </div>
                      )}

                      {/* WHY Causal explanation */}
                      {msg.structuredResponse.why && (
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-financial">
                            Causal Intelligence Reasoning:
                          </span>
                          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                            {msg.structuredResponse.why}
                          </p>
                        </div>
                      )}

                      {/* DATA Grounded Citations Table */}
                      {msg.structuredResponse.data && Object.keys(msg.structuredResponse.data).length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block font-financial">
                            Grounded Data Citations:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(msg.structuredResponse.data).map(([k, v]) => (
                              <div key={k} className="p-2 rounded-lg bg-white border border-slate-200">
                                <span className="text-[10px] text-slate-400 uppercase block truncate font-financial">
                                  {k.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs font-bold text-slate-800 font-financial">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* RISKS */}
                      {msg.structuredResponse.risks && msg.structuredResponse.risks.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider block font-financial">
                            Identified Risk Factors:
                          </span>
                          <div className="space-y-0.5 text-slate-700">
                            {msg.structuredResponse.risks.map((r, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs">
                                <span className="text-rose-500 font-bold">•</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Source Footnote */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-financial">
                        <span>Data Freshness: {msg.structuredResponse.data_freshness}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="font-financial text-xs text-blue-700">
                      Querying SQL tables, ML models, and risk matrices...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="pt-3 border-t border-slate-100 flex gap-2.5"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about Chennai properties, micro-markets, risk triggers, or what-if scenarios..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Consult</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
