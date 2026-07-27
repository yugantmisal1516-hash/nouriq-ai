import React, { useState, useEffect } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { FASTING_PROTOCOLS, METABOLIC_STAGES } from '../data/fastingProtocols';
import { Play, Square, Sparkles, CheckCircle2, Flame, Droplets, Zap, ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FastingTimer() {
  const nutrition = useNutrition() || {};
  const { 
    fastingState = { isFasting: false, protocol: '16:8', startTime: Date.now(), targetHours: 16 }, 
    startFast = () => {}, 
    stopFast = () => {}, 
    subscription = { tier: 'Free' }, 
    setActiveTab = () => {} 
  } = nutrition;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isPro = subscription?.tier === 'Pro' || subscription?.tier === 'Ultimate';

  // Live Timer Ticker Interval (Calculates exact elapsed time continuously)
  useEffect(() => {
    let interval = null;
    if (fastingState?.isFasting && fastingState?.startTime) {
      const updateElapsed = () => {
        const diff = Math.max(0, Math.floor((Date.now() - fastingState.startTime) / 1000));
        setElapsedSeconds(diff);
      };
      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fastingState]);

  const targetHours = fastingState?.targetHours || 16;
  const targetSeconds = targetHours * 3600;
  const elapsedHours = elapsedSeconds / 3600;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  const stagesList = METABOLIC_STAGES || [
    { id: '1', name: 'Glycogen Depletion', minHours: 0, maxHours: 4, description: 'Blood glucose stabilizes as insulin levels gradually lower.' },
    { id: '2', name: 'Early Ketosis & Fat Oxidation', minHours: 4, maxHours: 12, description: 'Body transitions to burning stored lipids for ATP energy.' },
    { id: '3', name: 'Deep Autophagy & Cellular Repair', minHours: 12, maxHours: 24, description: 'Damaged proteins and cellular debris are cleared by lysosomes.' }
  ];

  const currentStage = stagesList.find(
    stage => elapsedHours >= stage.minHours && elapsedHours < stage.maxHours
  ) || stagesList[stagesList.length - 1];

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartFast = (protocolId = '16:8', hours = 16) => {
    setElapsedSeconds(0);
    startFast(protocolId, hours);
    confetti({ particleCount: 70, spread: 60 });
  };

  const handleEndFast = () => {
    stopFast();
    confetti({ particleCount: 100, spread: 70 });
  };

  const handleResetFast = () => {
    setElapsedSeconds(0);
    startFast(fastingState?.protocol || '16:8', targetHours);
    confetti({ particleCount: 50, spread: 50 });
  };

  const protocolsList = FASTING_PROTOCOLS || [
    { id: '16:8', name: '16:8 LeanGains', fastHours: 16, eatHours: 8 },
    { id: '18:6', name: '18:6 Fat Loss', fastHours: 18, eatHours: 6 },
    { id: '20:4', name: '20:4 Warrior', fastHours: 20, eatHours: 4 },
    { id: '24h OMAD', name: '24h One Meal A Day', fastHours: 24, eatHours: 1 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="ios-glass p-6 rounded-[28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-[#54ACBF]/40">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Metabolic Autophagy Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#011C40] tracking-tight">Intermittent Fasting Tracker</h1>
          <p className="text-[#26658C] text-xs mt-1 font-medium">Track real-time metabolic transitions: fat oxidation, ketosis activation & autophagy cellular renewal.</p>
        </div>

        {/* Fasting Protocol Selectors */}
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-2 md:pb-0">
          {protocolsList.map((p) => (
            <button
              key={p.id}
              onClick={() => handleStartFast(p.id, p.fastHours)}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs active:scale-95 liquid-glass-btn ${
                fastingState?.protocol === p.id && fastingState?.isFasting
                  ? 'liquid-glass-btn-active scale-105'
                  : 'text-[#011C40]'
              }`}
            >
              {p.id} ({p.fastHours}h)
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timer Main Panel */}
        <div className="lg:col-span-7 ios-glass p-8 rounded-[28px] flex flex-col items-center justify-between text-center space-y-6 shadow-sm border border-[#54ACBF]/40">
          <div className="w-full flex items-center justify-between border-b border-[#54ACBF]/30 pb-4">
            <div className="text-left">
              <span className="text-xs text-[#26658C] font-semibold block">Active Fasting Window</span>
              <h3 className="text-base font-extrabold text-[#011C40]">{fastingState?.protocol || '16:8'} Protocol ({targetHours} Target Hours)</h3>
            </div>
            <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold liquid-glass-btn ${
              fastingState?.isFasting ? 'liquid-glass-btn-active text-white' : 'text-[#26658C]'
            }`}>
              {fastingState?.isFasting ? '● FAST IN PROGRESS' : '○ EATING WINDOW'}
            </span>
          </div>

          {/* Circular Countdown Progress Gauge */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="stroke-[#E0F7FA]" strokeWidth="7" fill="transparent" />
              <circle
                cx="50" cy="50" r="42"
                className="stroke-[#023859] transition-all duration-500 ease-linear"
                strokeWidth="7"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute text-center space-y-1">
              <span className="text-4xl font-extrabold text-[#011C40] font-mono tracking-tight block">
                {fastingState?.isFasting ? formatTime(elapsedSeconds) : '00:00:00'}
              </span>
              <span className="text-xs text-[#26658C] font-semibold block">
                {progressPercent}% Target Completed
              </span>
              <div className="inline-block px-3.5 py-1 rounded-full text-[11px] font-extrabold liquid-glass-btn liquid-glass-btn-active text-white shadow-xs">
                {currentStage?.name || 'Glycogen Depletion'}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="w-full max-w-sm grid grid-cols-2 gap-3">
            {!fastingState?.isFasting ? (
              <button
                onClick={() => handleStartFast(fastingState?.protocol || '16:8', targetHours)}
                className="col-span-2 py-3.5 px-6 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-sm active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Fasting Window</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleEndFast}
                  className="py-3.5 px-4 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Complete Fast</span>
                </button>

                <button
                  onClick={handleResetFast}
                  className="py-3.5 px-4 rounded-full liquid-glass-btn text-[#011C40] font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#023859]" />
                  <span>Reset Fast</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Metabolic Stages Progression */}
        <div className="lg:col-span-5 space-y-4">
          <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm border border-[#54ACBF]/40">
            <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
              <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" /> Metabolic Stages Progression
              </h3>
              {!isPro && (
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs">
                  <Lock className="w-3 h-3 text-slate-950" /> ⭐ Pro Plan Only
                </span>
              )}
            </div>

            {!isPro ? (
              <div className="p-5 rounded-2xl ios-glass-card text-center space-y-3 border border-[#54ACBF]/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-sm">
                  <Lock className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#011C40]">Metabolic Autophagy Stages Locked</h4>
                  <p className="text-[11px] text-[#26658C] font-medium mt-1 leading-relaxed">
                    Detailed cellular autophagy, deep ketosis transition, and metabolic stage tracking are exclusive to <strong className="text-[#023859]">Pro & Pro+ Ultimate Coach</strong> subscribers.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>👑 Upgrade to Pro to Unlock Metabolic Stages ($14.99/mo)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stagesList.map((stage) => {
                  const isActiveStage = currentStage?.name === stage.name && fastingState?.isFasting;
                  return (
                    <div 
                      key={stage.id} 
                      className={`p-3.5 rounded-2xl border transition-all text-xs ${
                        isActiveStage ? 'bg-[#A7EBF2]/40 border-[#54ACBF] ring-2 ring-[#54ACBF]/30 shadow-xs' : 'ios-glass-card opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-[#011C40]">{stage.name}</span>
                        <span className="text-[10px] text-[#26658C] font-semibold">{stage.minHours}h - {stage.maxHours}h</span>
                      </div>
                      <p className="text-[#26658C] text-[11px] font-medium mt-1 leading-relaxed">{stage.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
