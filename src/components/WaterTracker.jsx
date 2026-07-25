import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Droplet, Plus, RefreshCw, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WaterTracker() {
  const { waterIntake, addWater, resetWater, goals } = useNutrition();
  const [customMl, setCustomMl] = useState(300);
  const [soundAlert, setSoundAlert] = useState(true);

  const percent = Math.min(100, Math.round((waterIntake.currentMl / goals.dailyWaterGoal) * 100));

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

    if (waterIntake.currentMl + ml >= goals.dailyWaterGoal) {
      confetti({ particleCount: 90, spread: 60 });
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="ios-glass p-6 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-sky-900 text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Hydration Alert Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Liquid Hydration & Reminders</h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">Log water intake, set reminder intervals, and optimize cellular hydration.</p>
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
            onClick={resetWater}
            className="px-4 py-2.5 rounded-full text-xs font-extrabold liquid-glass-btn text-stone-700 flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
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
              <span className="text-3xl font-black">{waterIntake.currentMl}</span>
              <span className="text-xs font-semibold text-stone-600">of {goals.dailyWaterGoal} ml</span>
              <span className="mt-2 text-xs font-extrabold bg-white/90 px-3 py-1 rounded-full text-sky-700 border border-sky-200 shadow-sm">{percent}% Completed</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-4 font-semibold">
            {percent >= 100 ? '🎉 Daily Target Reached!' : `${goals.dailyWaterGoal - waterIntake.currentMl} ml remaining today.`}
          </p>
        </div>

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
