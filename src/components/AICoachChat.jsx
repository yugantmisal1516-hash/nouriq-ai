import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { generateAINutritionistResponse } from '../utils/aiNutritionistKnowledge';
import { Bot, Send, User, RefreshCw, Lightbulb, Sparkles, Globe, ShieldCheck } from 'lucide-react';

export default function AICoachChat() {
  const nutrition = useNutrition() || {};
  const { 
    goals = { name: 'Alex' }, 
    todayTotals = { calories: 0 }, 
    averageHealthScore = 92, 
    subscription = { tier: 'Free' } 
  } = nutrition;

  const isPro = subscription?.tier === 'Pro' || subscription?.tier === 'Ultimate';
  const isUltimate = subscription?.tier === 'Ultimate';

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${goals.name || 'Alex'}! I am your Nouriq AI Global Culinary & Clinical Nutrition Coach.\nToday you've consumed ${todayTotals.calories || 0} kcal with an average Health Rating of ${averageHealthScore}/100.\n\n${
        isUltimate 
          ? '⭐ [VIP Ultimate Mode Active]: Ask me any clinical dietetics, disease protocol, biomarker optimization, or Michelin-star recipe question. I will ask diagnostic questions to craft your world-class personalized plan!' 
          : isPro 
          ? '👑 [Nouriq Pro Mode Active]: Ask me for detailed USDA macro science, clinical meal portioning, and step-by-step masterclass recipes with custom follow-up questions!' 
          : '⚡ [Starter Mode Active]: Ask me any recipe, macro guidance, or cooking tip!'
      }`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const presetPrompts = [
    'How to make Crispy Pomfret Fish Fry?',
    'Give me a High Protein Chicken Biryani recipe',
    'How do I lower the glycemic load of sourdough bread?',
    'What is the best 16:8 fasting protocol for fat loss?'
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAINutritionistResponse(text, goals, todayTotals, subscription);

      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="ios-glass p-6 rounded-[28px] flex items-center justify-between shadow-sm border border-[#54ACBF]/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full liquid-glass-btn liquid-glass-btn-active flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-[#011C40] tracking-tight">AI Nutritionist & Masterclass Chef</h1>
              {isUltimate ? (
                <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-xs">
                  ⭐ VIP 1-on-1 Clinical Desk
                </span>
              ) : isPro ? (
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#023859] text-white">
                  👑 Pro Masterclass Engine
                </span>
              ) : (
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#A7EBF2] text-[#023859] border border-[#54ACBF]">
                  ⚡ Starter AI Coach
                </span>
              )}
            </div>
            <p className="text-xs text-[#26658C] font-medium">Ask for recipes, step-by-step cooking, macro science, or fasting protocols</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3.5 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-bold items-center gap-1.5 backdrop-blur-xl hidden sm:flex">
            <Globe className="w-3.5 h-3.5 text-[#A7EBF2]" /> World AI Search Active
          </span>
        </div>
      </div>

      {/* Preset Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {presetPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-4 py-2.5 rounded-full liquid-glass-btn text-[#011C40] text-xs font-semibold shrink-0 transition-all shadow-xs flex items-center gap-1.5 active:scale-95 hover:scale-105"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#023859]" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Chat Conversation Box */}
      <div className="ios-glass rounded-[28px] p-6 space-y-4 min-h-[420px] max-h-[540px] overflow-y-auto flex flex-col justify-between shadow-sm border border-[#54ACBF]/40">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'ai' ? 'liquid-glass-btn liquid-glass-btn-active text-white' : 'bg-[#011C40] text-white'
              }`}>
                {msg.sender === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
              </div>

              <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                msg.sender === 'ai'
                  ? 'ios-glass-card text-[#011C40] shadow-xs border-[#54ACBF]/40'
                  : 'bg-[#023859] text-white font-medium shadow-xs'
              }`}>
                <p>{msg.text}</p>
                <span className={`text-[10px] block mt-1.5 text-right ${msg.sender === 'ai' ? 'text-[#26658C]' : 'text-slate-200'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-[#011C40] bg-[#A7EBF2]/40 p-3 rounded-2xl border border-[#54ACBF]/40 w-fit shadow-xs font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#023859]" />
              <span>
                {isUltimate 
                  ? '⭐ AI VIP Clinical Engine & Michelin Masterclass formulating world-class response...' 
                  : isPro 
                  ? '👑 AI Pro Clinical Engine calculating exact USDA macros & diagnostic questions...' 
                  : '⚡ AI Coach formulating response...'}
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-3 pt-4 border-t border-[#54ACBF]/40"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isUltimate 
                ? 'Reply to diagnostic questions or ask any VIP clinical dietetics query...' 
                : isPro 
                ? 'Reply to questions or ask for detailed macro science & masterclass recipes...' 
                : 'Ask AI Nutritionist for any recipe, macro guidance, or cooking tip...'
            }
            className="flex-1 bg-white border border-[#54ACBF]/50 rounded-2xl px-4 py-3 text-xs text-[#011C40] font-bold focus:outline-none shadow-xs placeholder:text-[#26658C]/70"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-bold flex items-center justify-center transition-all shadow-xs active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
        <p className="text-[10px] text-[#26658C]/80 font-medium text-center pt-1">
          Nouriq AI can make mistakes. Check important medical & dietary info.
        </p>
      </div>

    </div>
  );
}
