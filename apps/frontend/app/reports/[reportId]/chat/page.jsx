'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Bot, User, Globe, Sparkles, AlertCircle } from 'lucide-react';
import { chatApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

const SUGGESTIONS = [
  'Is this car safe to buy?',
  'What major repairs should I expect?',
  'Are there any red flags?',
  'क्या यह कार खरीदना सुरक्षित है?',
];

export default function ChatPage() {
  const params = useParams();
  const { initialize } = useAuthStore();
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('en');

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    setLoading(true);
    chatApi.createConversation(params.reportId)
      .then((data) => {
        setConvId(data.conversation.id);
        setMessages(data.conversation.messages || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.reportId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (content) => {
    if (!content.trim() || !convId || sending) return;
    const tempId = `temp-${Date.now()}`;
    const userMsg = { id: tempId, role: 'user', content, createdAt: new Date().toISOString() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const data = await chatApi.sendMessage(convId, { content, language: lang });
      setMessages((p) => [...p.filter((m) => m.id !== tempId), data.userMessage, data.assistantMessage]);
    } catch (err) {
      setMessages((p) => p.filter((m) => m.id !== tempId));
      setError(err.isPaymentRequired ? 'Chat quota exceeded. Upgrade your plan.' : (err.message || 'Failed to send.'));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-800 glass-effect sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <Link href={`/reports/${params.reportId}`} className="flex items-center gap-2 text-surface-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Report
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-white">AI Chat</span>
            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="btn-ghost btn-sm ml-2">
              <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'हिंदी' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 && !sending && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/10 mb-5">
              <Bot className="w-8 h-8 text-accent-400" />
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-2">Ask about this vehicle</h2>
            <p className="text-sm text-surface-400 mb-8 max-w-md mx-auto">I have full context of your report. Ask me anything.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((q) => (
                <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full bg-surface-800 text-sm text-surface-300 hover:bg-surface-700 hover:text-white border border-surface-700 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-accent-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-br-md' : 'bg-surface-800 text-surface-200 rounded-bl-md'}`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-2xs mt-2 ${msg.role === 'user' ? 'text-brand-200' : 'text-surface-500'}`}>
                {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-brand-400" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center"><Bot className="w-4 h-4 text-accent-400" /></div>
            <div className="bg-surface-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-surface-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20">
            <AlertCircle className="w-4 h-4 text-danger-400" />
            <p className="text-sm text-danger-400 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-danger-400 text-xs">✕</button>
          </div>
        </div>
      )}

      <div className="border-t border-surface-800 glass-effect px-4 py-3">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="max-w-3xl mx-auto flex items-center gap-3">
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                 placeholder={lang === 'en' ? 'Ask about this vehicle...' : 'इस वाहन के बारे में पूछें...'}
                 className="input flex-1" disabled={sending} autoFocus />
          <button type="submit" disabled={!input.trim() || sending} className="btn-primary btn-icon flex-shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
