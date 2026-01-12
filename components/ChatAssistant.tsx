
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, ShieldCheck } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'مرحباً بك في Aura Smart Nodes. أنا مساعدك الذكي، كيف يمكنني مساعدتك في تنمية أرباحك اليوم؟ يمكنك سؤالي عن طرق الإيداع أو كيفية حساب الأرباح.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    const botText = await getGeminiResponse(userText);
    setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-5 bg-amber-500 text-black rounded-full shadow-2xl hover:scale-110 transition-transform z-50 aura-shadow group"
      >
        <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-600"></span>
        </span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[550px] glass rounded-[2.5rem] shadow-2xl flex flex-col z-50 overflow-hidden border border-amber-500/30 animate-in slide-in-from-bottom-8 duration-300">
          <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 flex justify-between items-center">
            <div className="flex items-center gap-3 text-black font-black">
              <div className="bg-black/20 p-1.5 rounded-lg"><Bot className="w-5 h-5" /></div>
              <div>
                <div className="text-sm">Aura Smart Assistant</div>
                <div className="text-[10px] flex items-center gap-1 opacity-70"><ShieldCheck className="w-3 h-3"/> متصل وآمن</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-6 h-6 text-black" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-900/40">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl flex flex-col gap-1 ${m.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-amber-500/10 border border-amber-500/20 text-slate-100 rounded-tl-none shadow-lg'}`}>
                   <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                   <span className="text-[9px] opacity-40 self-end mt-1">{new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-amber-500/10 p-4 rounded-2xl animate-pulse text-amber-500 text-xs font-bold">Aura Bot يكتب الآن...</div>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-white/5 bg-slate-900/60 flex gap-3 items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اطلب الإيداع أو اسأل عن الأرباح..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
            />
            <button onClick={handleSend} className="p-3 bg-amber-500 text-black rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </>
  );
};
