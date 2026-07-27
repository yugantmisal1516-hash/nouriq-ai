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
      <div className="w-full beige-dock rounded-[24px] sm:rounded-[28px] px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-sm border border-[#54ACBF]/40">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
        >
          <img 
            src="/nouriq_logo.jpg" 
            alt="Nouriq Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#54ACBF]/50 shadow-xs group-hover:scale-105 transition-transform" 
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#011C40] font-sans">
                Nouriq
              </span>
            </div>
            <p className="text-[10px] text-[#26658C] font-medium hidden sm:block">Your AI Nutrition & Wellness Coach</p>
          </div>
        </div>

        {/* Interactive Stats Badges (Desktop MD+) */}
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
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Mobile Upgrade Badge */}
          <button
            onClick={() => setActiveTab('pricing')}
            className="md:hidden flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-xs active:scale-95 shrink-0"
          >
            <Crown className="w-3 h-3 text-slate-950 fill-slate-950 shrink-0" />
            <span>{isPro ? 'PRO' : 'UPGRADE'}</span>
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 sm:w-9 sm:h-9 liquid-glass-btn hover:scale-105 active:scale-95 text-[#011C40] flex items-center justify-center shadow-xs shrink-0"
            title="Adjust Goal Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Login / Sign Up Button & Profile Pill */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 sm:pl-2 border-l border-[#54ACBF]/40">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 liquid-glass-btn liquid-glass-btn-active text-white hover:scale-105 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#A7EBF2] shrink-0" />
              <span className="whitespace-nowrap hidden xs:inline">Log In / Sign Up</span>
              <span className="whitespace-nowrap xs:hidden">Log In</span>
            </button>

            <div 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 cursor-pointer group shrink-0"
              title="Click to switch account or sign up new user"
            >
              <img 
                src={goals.avatar} 
                alt={goals.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#54ACBF]/50 shadow-xs group-hover:scale-105 transition-transform shrink-0" 
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
              <label className="block text-[#26658C] font-semibold mb-1">Daily Calorie Target (kcal)</label>
              <input
                type="number"
                value={goals.dailyCalorieGoal}
                onChange={(e) => setGoals({ ...goals, dailyCalorieGoal: Number(e.target.value) })}
                className="w-full bg-white/80 border border-[#54ACBF]/40 rounded-xl px-3 py-2 font-bold text-[#011C40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#26658C] font-semibold mb-1">Daily Protein Target (g)</label>
              <input
                type="number"
                value={goals.dailyProteinGoal}
                onChange={(e) => setGoals({ ...goals, dailyProteinGoal: Number(e.target.value) })}
                className="w-full bg-white/80 border border-[#54ACBF]/40 rounded-xl px-3 py-2 font-bold text-[#011C40] focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-2.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-bold shadow-xs mt-2"
            >
              Save Targets
            </button>
          </div>
        </div>
      )}

      {/* Health Score Breakdown Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/60 backdrop-blur-md animate-fade-in">
          <div className="ios-glass w-full max-w-md rounded-[32px] p-6 space-y-4 border border-[#54ACBF]/50 text-xs text-[#011C40] relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#023859]" />
                <span className="font-extrabold text-sm text-[#011C40]">Health Rating Engine Score</span>
              </div>
              <button 
                onClick={() => setShowScoreModal(false)}
                className="w-7 h-7 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 text-center space-y-1">
              <span className="text-3xl font-black text-[#011C40] block">{averageHealthScore} / 100</span>
              <span className="text-xs text-[#023859] font-extrabold block">
                {averageHealthScore >= 90 ? '🌟 Optimal Nutritional Density' : '👍 Good Balance - Increase Whole Foods'}
              </span>
            </div>

            <div className="space-y-2 text-[#26658C] font-medium leading-relaxed">
              <p>Your Health Rating score evaluates glycemic index, protein bioavailability, fiber density, and processing level across your logged meals.</p>
            </div>

            <button
              onClick={() => setShowScoreModal(false)}
              className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Fasting Quick Controls Modal */}
      {showFastingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/60 backdrop-blur-md animate-fade-in">
          <div className="ios-glass w-full max-w-md rounded-[32px] p-6 space-y-4 border border-[#54ACBF]/50 text-xs text-[#011C40] relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#023859]" />
                <span className="font-extrabold text-sm text-[#011C40]">Intermittent Fasting Status</span>
              </div>
              <button 
                onClick={() => setShowFastingModal(false)}
                className="w-7 h-7 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-[#54ACBF]/40 space-y-2 text-center">
              <span className="text-xs text-[#26658C] font-bold block">Active Protocol: {fastingState?.protocol || '16:8'}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-block ${
                fastingState?.isFasting ? 'bg-[#023859] text-white' : 'bg-[#A7EBF2] text-[#023859]'
              }`}>
                {fastingState?.isFasting ? '● Fast in Progress' : '○ Eating Window Active'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  if (fastingState?.isFasting) stopFast();
                  else startFast('16:8', 16);
                  setShowFastingModal(false);
                }}
                className="flex-1 py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs"
              >
                {fastingState?.isFasting ? 'Stop Fasting' : 'Start 16:8 Fast'}
              </button>

              <button
                onClick={() => {
                  setShowFastingModal(false);
                  setActiveTab('fasting');
                }}
                className="flex-1 py-3 rounded-full liquid-glass-btn text-[#011C40] font-extrabold text-xs shadow-xs"
              >
                Open Fasting Tracker
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
