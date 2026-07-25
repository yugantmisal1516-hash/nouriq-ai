import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Flame, Award, Clock, SlidersHorizontal, User, Sparkles, CheckCircle2, ChevronRight, LogIn, UserPlus, Crown } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const nutrition = useNutrition() || {};
  const { 
    goals = { name: 'Alex Rivera', dailyCalorieGoal: 2200, dailyProteinGoal: 160, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', dietType: 'High Protein' }, 
    setGoals = () => {}, 
    todayTotals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }, 
    fastingState = { isFasting: false, protocol: '16:8' }, 
    startFast = () => {}, 
    stopFast = () => {}, 
    averageHealthScore = 92, 
    setActiveTab = () => {}, 
    loggedMeals = [], 
    subscription = { tier: 'Free' } 
  } = nutrition;

  const [showSettings, setShowSettings] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showFastingModal, setShowFastingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isPro = subscription?.tier === 'Pro' || subscription?.tier === 'Ultimate';
  const calGoal = goals?.dailyCalorieGoal || 2200;
  const calConsumed = todayTotals?.calories || 0;
  const calPercent = Math.min(100, Math.round((calConsumed / calGoal) * 100));

  return (
    <header className="relative z-50">
      <div className="w-full beige-dock rounded-[28px] px-5 py-3 flex items-center justify-between gap-3 flex-wrap shadow-sm border border-[#54ACBF]/40">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
        >
          <img 
            src="/nouriq_logo.jpg" 
            alt="Nouriq Logo" 
            className="w-10 h-10 rounded-full object-cover border border-[#54ACBF]/50 shadow-xs group-hover:scale-105 transition-transform" 
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-[#011C40] font-sans">
                Nouriq
              </span>
            </div>
            <p className="text-[10px] text-[#26658C] font-medium hidden sm:block">Your AI Nutrition & Wellness Coach</p>
          </div>
        </div>

        {/* Interactive Stats Badges */}
        <div className="hidden md:flex items-center gap-2.5 flex-wrap">
          
          {/* Calorie Pill */}
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-2 px-3.5 py-1.5 liquid-glass-btn hover:scale-105 active:scale-95 text-[#011C40] transition-all shrink-0"
            title="Click to edit daily calorie goal"
          >
            <Flame className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
            <div className="text-xs font-sans whitespace-nowrap">
              <span className="text-[#26658C] font-medium">Calories: </span>
              <span className="font-extrabold text-[#011C40]">{todayTotals.calories}</span>
              <span className="text-[#26658C]"> / {goals.dailyCalorieGoal} kcal ({calPercent}%)</span>
            </div>
          </button>

          {/* Health Score Pill */}
          <button 
            onClick={() => setShowScoreModal(true)}
            className="flex items-center space-x-2 px-3.5 py-1.5 liquid-glass-btn hover:scale-105 active:scale-95 text-[#011C40] transition-all shrink-0"
            title="Click to view Health Rating breakdown"
          >
            <Award className="w-4 h-4 text-[#023859] shrink-0" />
            <div className="text-xs font-sans whitespace-nowrap">
              <span className="text-[#26658C] font-medium">Health Rating: </span>
              <span className="font-extrabold text-[#011C40]">{averageHealthScore}/100</span>
            </div>
          </button>

          {/* Fasting Pill */}
          <button 
            onClick={() => setShowFastingModal(true)}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shrink-0 ${
              fastingState?.isFasting
                ? 'liquid-glass-btn liquid-glass-btn-active text-white'
                : 'liquid-glass-btn text-[#011C40]'
            }`}
            title="Click to manage Intermittent Fasting"
          >
            <Clock className={`w-4 h-4 shrink-0 ${fastingState?.isFasting ? 'text-white animate-spin' : 'text-[#54ACBF]'}`} style={{ animationDuration: '8s' }} />
            <span className="whitespace-nowrap">Fasting ({fastingState?.protocol || '16:8'})</span>
          </button>

          {/* Monetization / Pro Subscription Badge Button */}
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all hover:scale-105 active:scale-95 shrink-0 ${
              subscription?.tier === 'Ultimate'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-md'
                : subscription?.tier === 'Pro'
                ? 'liquid-glass-btn liquid-glass-btn-active text-white border border-[#011C40]'
                : 'bg-gradient-to-r from-[#A7EBF2] to-[#54ACBF] text-[#023859] shadow-xs'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 shrink-0 ${subscription?.tier === 'Ultimate' ? 'text-slate-950 fill-slate-950' : 'text-amber-400 fill-amber-400'}`} />
            <span className="whitespace-nowrap">
              {subscription?.tier === 'Ultimate' ? '⭐ ULTIMATE VIP' : subscription?.tier === 'Pro' ? '👑 PRO MEMBER' : '⚡ Upgrade Pro'}
            </span>
          </button>

        </div>

        {/* User Account & Login / Signup Trigger */}
        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-9 h-9 liquid-glass-btn hover:scale-105 active:scale-95 text-[#011C40] flex items-center justify-center shadow-xs shrink-0"
            title="Adjust Goal Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Login / Sign Up Button & Profile Pill */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#54ACBF]/40">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 liquid-glass-btn liquid-glass-btn-active text-white hover:scale-105 active:scale-95 transition-all text-xs font-bold shadow-xs shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#A7EBF2] shrink-0" />
              <span className="whitespace-nowrap">Log In / Sign Up</span>
            </button>

            <div 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 cursor-pointer group shrink-0"
              title="Click to switch account or sign up new user"
            >
              <img 
                src={goals.avatar} 
                alt={goals.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#54ACBF]/50 shadow-xs group-hover:scale-105 transition-transform shrink-0" 
              />
              <div className="text-left hidden xl:block">
                <p className="text-xs font-bold text-[#011C40] truncate max-w-[100px]">{goals.name}</p>
                <p className="text-[10px] text-[#26658C] font-semibold truncate max-w-[100px]">{goals.dietType}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Goal & Calorie Settings Modal */}
      {showSettings && (
        <div className="absolute right-0 top-14 w-80 ios-glass p-5 rounded-[24px] shadow-lg z-50 text-[#011C40] border border-[#54ACBF]/40">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#011C40] flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" /> Calorie & Macro Target Settings
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-xs text-[#26658C] hover:text-[#011C40]">✕</button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#26658C] mb-1 font-semibold">Daily Calorie Goal (kcal)</label>
              <input 
                type="number" 
                value={goals.dailyCalorieGoal}
                onChange={(e) => setGoals({ ...goals, dailyCalorieGoal: Number(e.target.value) })}
                className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3 py-2 text-[#011C40] font-bold focus:outline-none focus:ring-2 focus:ring-[#023859]/30"
              />
            </div>
            <div>
              <label className="block text-[#26658C] mb-1 font-semibold">Daily Protein Target (g)</label>
              <input 
                type="number" 
                value={goals.dailyProteinGoal}
                onChange={(e) => setGoals({ ...goals, dailyProteinGoal: Number(e.target.value) })}
                className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3 py-2 text-[#011C40] font-bold focus:outline-none focus:ring-2 focus:ring-[#023859]/30"
              />
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="w-full mt-2 py-2.5 liquid-glass-btn liquid-glass-btn-active font-extrabold text-xs transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Save Goal Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* Health Score Breakdown Modal */}
      {showScoreModal && (
        <div className="absolute right-12 top-14 w-80 ios-glass p-5 rounded-[24px] shadow-lg z-50 text-[#011C40] border border-[#54ACBF]/40">
          <div className="flex justify-between items-center mb-3 border-b border-[#54ACBF]/30 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#011C40] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#023859]" /> Health Rating Score Breakdown
            </h3>
            <button onClick={() => setShowScoreModal(false)} className="text-xs text-[#26658C] hover:text-[#011C40]">✕</button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl liquid-glass-btn liquid-glass-btn-active">
              <div>
                <span className="text-2xl font-black text-white">{averageHealthScore}/100</span>
                <p className="text-[10px] text-[#A7EBF2] font-semibold">Nutri-Score Grade A+ Average</p>
              </div>
              <Sparkles className="w-6 h-6 text-[#A7EBF2]" />
            </div>

            <p className="text-[11px] text-[#26658C] leading-relaxed font-medium">
              Calculated dynamically from logged meal nutrient densities, fiber-to-carb ratios, and anti-inflammatory whole food scores.
            </p>

            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowScoreModal(false);
                setActiveTab('analytics');
              }}
              className="w-full mt-2 py-2.5 liquid-glass-btn text-[#011C40] font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              <span>View Full Analytics Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Fasting Quick Protocol Switcher Modal */}
      {showFastingModal && (
        <div className="absolute right-24 top-14 w-80 ios-glass p-5 rounded-[24px] shadow-lg z-50 text-[#011C40] border border-[#54ACBF]/40">
          <div className="flex justify-between items-center mb-3 border-b border-[#54ACBF]/30 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#011C40] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#023859]" /> Fasting Window Protocol
            </h3>
            <button onClick={() => setShowFastingModal(false)} className="text-xs text-[#26658C] hover:text-[#011C40]">✕</button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 text-center">
              <span className="text-xs font-extrabold text-[#011C40] block">Current Status</span>
              <span className="text-sm font-black text-[#023859]">
                {fastingState?.isFasting ? `● FASTING (${fastingState?.protocol || '16:8'})` : '○ EATING WINDOW'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-bold">
              <button 
                onClick={() => { startFast('16:8', 16); setShowFastingModal(false); }}
                className={`p-2.5 rounded-xl text-center border transition-all ${
                  fastingState?.protocol === '16:8' && fastingState?.isFasting ? 'liquid-glass-btn-active text-white' : 'liquid-glass-btn text-[#011C40]'
                }`}
              >
                16:8 LeanGains (16h)
              </button>

              <button 
                onClick={() => { startFast('18:6', 18); setShowFastingModal(false); }}
                className={`p-2.5 rounded-xl text-center border transition-all ${
                  fastingState?.protocol === '18:6' && fastingState?.isFasting ? 'liquid-glass-btn-active text-white' : 'liquid-glass-btn text-[#011C40]'
                }`}
              >
                18:6 Fat Loss (18h)
              </button>
            </div>

            {fastingState?.isFasting ? (
              <button 
                onClick={() => { stopFast(); setShowFastingModal(false); }}
                className="w-full py-2.5 rounded-full bg-rose-600 text-white font-extrabold text-xs shadow-xs"
              >
                End Current Fasting Window
              </button>
            ) : (
              <button 
                onClick={() => { startFast('16:8', 16); setShowFastingModal(false); }}
                className="w-full py-2.5 liquid-glass-btn liquid-glass-btn-active font-extrabold text-xs shadow-xs"
              >
                Start 16:8 Fasting Window
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
