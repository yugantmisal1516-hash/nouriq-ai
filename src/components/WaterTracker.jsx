import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Droplet, Plus, RefreshCw, Sparkles, Volume2, Target, Check, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WaterTracker() {
  const nutrition = useNutrition() || {};
  const { 
    waterIntake = { currentMl: 0, history: [] }, 
    addWater = () => {}, 
    resetWater = () => {}, 
    goals = { dailyWaterGoal: 3000 },
    setGoals = () => {}
  } = nutrition;

  const [customMl, setCustomMl] = useState(300);
  const [soundAlert, setSoundAlert] = useState(true);
  const [customGoalInput, setCustomGoalInput] = useState(goals?.dailyWaterGoal || 3000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const currentTarget = goals?.dailyWaterGoal || 3000;
  const currentMl = waterIntake?.currentMl || 0;
  const percent = Math.min(100, Math.round((currentMl / currentTarget) * 100));

  const presetGoals = [2000, 2500, 3000, 3500, 4000];

  const handleUpdateGoal = (newGoal) => {
    const validGoal = Math.max(500, Math.min(10000, Number(newGoal) || 3000));
    setGoals(prev => ({
      ...prev,
      dailyWaterGoal: validGoal
    }));
    setCustomGoalInput(validGoal);
    setIsEditingGoal(false);
    confetti({ particleCount: 50, spread: 50 });
  };

  const handleAdd = (ml) => {
    addWater(ml);

    if (soundAlert) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {}
    }

    if (currentMl + ml >= currentTarget) {
      confetti({ particleCount: 90, spread: 60 });
    }
  };

  const handleResetLog = () => {
    resetWater();
    confetti({ particleCount: 40, spread: 40 });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="ios-glass p-6 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-sky-900 text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Hydration Alert Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Liquid Hydration & Reminders</h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">Log water intake, customize target volume, and optimize cellular hydration.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundAlert(!soundAlert)}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 liquid-glass-btn ${
              soundAlert ? 'liquid-glass-btn-active text-sky-900' : ''
            }`}
          >
            <Volume2 className="w-4 h-4 text-sky-600" /> {soundAlert ? 'Sound On' : 'Muted'}
          </button>
          <button
            onClick={handleResetLog}
            className="px-4 py-2.5 rounded-full text-xs font-extrabold liquid-glass-btn text-stone-700 flex items-center gap-1.5 shadow-sm active:scale-95 hover:bg-rose-50 hover:text-rose-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Log
          </button>
        </div>
      </div>

      {/* CUSTOMIZABLE DAILY WATER GOAL SELECTOR BAR */}
      <div className="ios-glass p-5 rounded-[28px] space-y-3 shadow-md border border-[#54ACBF]/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#54ACBF]/30 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#023859] text-white flex items-center justify-center">
              <Target className="w-4 h-4 text-[#A7EBF2]" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider">Customize Preferred Daily Hydration Target</h2>
              <span className="text-[11px] text-[#26658C] font-semibold">Active Goal: <strong className="text-[#023859]">{currentTarget} ml</strong> per day</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isEditingGoal ? (
              <button
                onClick={() => setIsEditingGoal(true)}
                className="px-3.5 py-1.5 rounded-full liquid-glass-btn text-[#023859] font-extrabold text-xs flex items-center gap-1.5 shadow-xs hover:scale-105 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#023859]" /> Custom Goal
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="100"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  placeholder="e.g. 3200"
                  className="bg-white border border-[#54ACBF] rounded-full px-3.5 py-1 text-xs text-[#011C40] font-extrabold focus:outline-none w-28"
                />
                <button
                  onClick={() => handleUpdateGoal(customGoalInput)}
                  className="px-3 py-1 rounded-full bg-[#023859] text-white font-extrabold text-xs flex items-center gap-1 hover:bg-[#011C40]"
                >
                  <Check className="w-3.5 h-3.5 text-[#A7EBF2]" /> Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Goal Preset Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
          <span className="text-[11px] text-[#26658C] font-bold shrink-0 mr-1">Presets:</span>
          {presetGoals.map((val) => (
            <button
              key={val}
              onClick={() => handleUpdateGoal(val)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 active:scale-95 ${
                currentTarget === val
                  ? 'bg-[#023859] text-white shadow-sm ring-2 ring-[#023859]/30'
                  : 'ios-glass-card text-[#011C40] hover:bg-[#A7EBF2]/50 border-[#54ACBF]/30'
              }`}
            >
              {val} ml
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Animated Water Cylinder Gauge */}
        <div className="lg:col-span-5 ios-glass p-8 rounded-[32px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
          <div className="w-44 h-64 rounded-3xl border-4 border-sky-300/80 bg-white/40 relative overflow-hidden flex flex-col justify-end shadow-inner">
            <div 
              className="w-full bg-gradient-to-t from-sky-500 via-sky-400 to-cyan-300 transition-all duration-700 relative"
              style={{ height: `${percent}%` }}
            >
              <div className="water-wave" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-900 drop-shadow-sm z-10">
              <Droplet className="w-8 h-8 text-sky-600 animate-bounce mb-1" />
              <span className="text-3xl font-black">{currentMl}</span>
              <span className="text-xs font-semibold text-stone-600">of {currentTarget} ml</span>
              <span className="mt-2 text-xs font-extrabold bg-white/90 px-3 py-1 rounded-full text-sky-700 border border-sky-200 shadow-sm">{percent}% Completed</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-4 font-semibold">
            {percent >= 100 ? '🎉 Daily Target Reached!' : `${currentTarget - currentMl} ml remaining today.`}
          </p>
        </div>

        {/* Portion Logging Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="ios-glass p-6 rounded-[32px] space-y-4 shadow-2xl">
            <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">Quick Log Portion</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleAdd(250)}
                className="p-4 rounded-2xl liquid-glass-btn text-center transition-all shadow-sm group active:scale-95 hover:scale-105"
              >
                <Droplet className="w-5 h-5 text-sky-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs text-stone-900 block">+ 250 ml</span>
                <span className="text-[10px] text-stone-400 font-medium">Glass</span>
              </button>

              <button
                onClick={() => handleAdd(500)}
                className="p-4 rounded-2xl liquid-glass-btn text-center transition-all shadow-sm group active:scale-95 hover:scale-105"
              >
                <Droplet className="w-6 h-6 text-sky-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs text-stone-900 block">+ 500 ml</span>
                <span className="text-[10px] text-stone-400 font-medium">Bottle</span>
              </button>

              <button
                onClick={() => handleAdd(750)}
                className="p-4 rounded-2xl liquid-glass-btn text-center transition-all shadow-sm group active:scale-95 hover:scale-105"
              >
                <Droplet className="w-7 h-7 text-sky-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs text-stone-900 block">+ 750 ml</span>
                <span className="text-[10px] text-stone-400 font-medium">Sports Bottle</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <input
                type="number"
                value={customMl}
                onChange={(e) => setCustomMl(Number(e.target.value))}
                className="bg-white/80 border border-white rounded-2xl px-4 py-2.5 text-xs text-stone-900 font-bold focus:outline-none w-32 shadow-sm"
                placeholder="Custom ml"
              />
              <button
                onClick={() => handleAdd(customMl)}
                className="flex-1 py-3 px-4 rounded-full liquid-glass-btn liquid-glass-btn-active text-emerald-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Amount
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
