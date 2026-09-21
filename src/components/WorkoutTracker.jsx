import React, { useState, useEffect, useRef } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { WORKOUT_ROUTINES, EXERCISE_DATABASE, getExerciseById } from '../data/workoutDatabase';
import { 
  calculateProgressiveOverload, 
  calculateOneRepMax, 
  calculateWorkoutVolume, 
  calculateWorkoutRecoveryNutrition 
} from '../utils/aiWorkoutEngine';
import { 
  Dumbbell, 
  Sparkles, 
  Flame, 
  Clock, 
  Check, 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  RefreshCw, 
  X, 
  ChevronDown, 
  ChevronUp,
  Activity,
  ShieldCheck,
  Zap,
  Info,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Workout3DVisualizerModal from './Workout3DVisualizerModal';

// Synthesized Web Audio API Gym Timer Chime (100% reliable, zero external assets)
function playTimerChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

export default function WorkoutTracker() {
  const { 
    workoutLogs = [], 
    activeWorkout, 
    startWorkoutSession, 
    updateActiveWorkout, 
    cancelWorkoutSession, 
    saveWorkoutSession, 
    deleteWorkoutLog,
    syncWorkoutRecoveryMacros,
    setActiveTab,
    goals
  } = useNutrition();

  // Selected routine preview
  const [selectedRoutineId, setSelectedRoutineId] = useState(WORKOUT_ROUTINES[0].id);

  // Rest Timer State
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [restTimerTotal, setRestTimerTotal] = useState(90);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  // Active workout elapsed time
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Substitute Exercise Modal
  const [substituteModalExerciseIndex, setSubstituteModalExerciseIndex] = useState(null);

  // Post-Workout Completion Summary Modal
  const [completedWorkoutSummary, setCompletedWorkoutSummary] = useState(null);

  // 3D Form Visualizer Modal State
  const [selected3DExercise, setSelected3DExercise] = useState(null);

  // Active workout timer effect
  useEffect(() => {
    let interval = null;
    if (activeWorkout) {
      const startTime = activeWorkout.startedAt || Date.now();
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isRestTimerActive && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRestTimerActive(false);
            playTimerChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restSecondsLeft === 0) {
      setIsRestTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restSecondsLeft]);

  // Start rest timer helper
  const handleStartRestTimer = (seconds = 90) => {
    setRestTimerTotal(seconds);
    setRestSecondsLeft(seconds);
    setIsRestTimerActive(true);
  };

  // Find previous session sets for a specific exercise
  const getPreviousSessionSetsForExercise = (exerciseId) => {
    for (const log of workoutLogs) {
      const match = (log.exercises || []).find(e => e.exerciseId === exerciseId);
      if (match && match.sets && match.sets.some(s => s.completed)) {
        return match.sets.filter(s => s.completed);
      }
    }
    return [];
  };

  // Handle Set Value Changes
  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetExercise = { ...updatedExercises[exerciseIndex] };
    const targetSets = [...targetExercise.sets];
    
    targetSets[setIndex] = {
      ...targetSets[setIndex],
      [field]: value
    };

    targetExercise.sets = targetSets;
    updatedExercises[exerciseIndex] = targetExercise;

    updateActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  // Handle Set Completion Toggle
  const handleToggleSetComplete = (exerciseIndex, setIndex) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetExercise = { ...updatedExercises[exerciseIndex] };
    const targetSets = [...targetExercise.sets];
    const currentSet = targetSets[setIndex];

    const newCompleted = !currentSet.completed;

    targetSets[setIndex] = {
      ...currentSet,
      completed: newCompleted,
      // Default to recommended or previous values if user left empty
      weightKg: currentSet.weightKg !== '' ? currentSet.weightKg : 40,
      reps: currentSet.reps !== '' ? currentSet.reps : 8
    };

    targetExercise.sets = targetSets;
    updatedExercises[exerciseIndex] = targetExercise;

    updateActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });

    // Auto-trigger rest timer if completed
    if (newCompleted) {
      handleStartRestTimer(90);
    }
  };

  // Add Set to an exercise
  const handleAddSet = (exerciseIndex) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetExercise = { ...updatedExercises[exerciseIndex] };
    const lastSet = targetExercise.sets[targetExercise.sets.length - 1];

    const newSet = {
      setNumber: targetExercise.sets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : '',
      reps: lastSet ? lastSet.reps : '',
      rpe: 8,
      completed: false
    };

    targetExercise.sets = [...targetExercise.sets, newSet];
    updatedExercises[exerciseIndex] = targetExercise;

    updateActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  // Remove Set from an exercise
  const handleRemoveSet = (exerciseIndex, setIndex) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const targetExercise = { ...updatedExercises[exerciseIndex] };
    if (targetExercise.sets.length <= 1) return;

    targetExercise.sets = targetExercise.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
      ...s,
      setNumber: idx + 1
    }));
    updatedExercises[exerciseIndex] = targetExercise;

    updateActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  // Substitute an exercise in the active session
  const handleSubstituteExercise = (exerciseIndex, newExerciseId) => {
    if (!activeWorkout) return;
    const updatedExercises = [...activeWorkout.exercises];
    const oldExercise = updatedExercises[exerciseIndex];
    const newExData = getExerciseById(newExerciseId);

    updatedExercises[exerciseIndex] = {
      ...oldExercise,
      exerciseId: newExerciseId,
      exerciseName: newExData.name,
      sets: oldExercise.sets.map(s => ({
        ...s,
        weightKg: '',
        reps: '',
        completed: false
      }))
    };

    updateActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
    setSubstituteModalExerciseIndex(null);
  };

  // Finish Workout
  const handleFinishWorkout = () => {
    if (!activeWorkout) return;

    const volumeData = calculateWorkoutVolume(activeWorkout.exercises);
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const completedSession = {
      ...activeWorkout,
      completedAt: Date.now(),
      durationMinutes: durationMins,
      totalVolumeKg: volumeData.totalVolumeKg,
      totalReps: volumeData.totalReps,
      completedSetsCount: volumeData.completedSetsCount
    };

    const recoveryNutrition = calculateWorkoutRecoveryNutrition(completedSession);

    setCompletedWorkoutSummary({
      session: completedSession,
      volume: volumeData,
      recovery: recoveryNutrition
    });

    saveWorkoutSession(completedSession);
  };

  // Apply recovery macros to dashboard
  const handleApplyRecoveryMacros = () => {
    if (completedWorkoutSummary?.recovery) {
      syncWorkoutRecoveryMacros(completedWorkoutSummary.recovery);
    }
    setCompletedWorkoutSummary(null);
    setActiveTab('dashboard');
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const selectedRoutine = WORKOUT_ROUTINES.find(r => r.id === selectedRoutineId) || WORKOUT_ROUTINES[0];

  // Lifetime Volume stats
  const totalLifetimeVolume = workoutLogs.reduce((acc, log) => acc + (log.totalVolumeKg || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* 1. HEADER BANNER */}
      <div className="ios-glass p-6 md:p-8 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-[#54ACBF]/40">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-3.5 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl text-white">
              <Dumbbell className="w-3.5 h-3.5 text-[#A7EBF2]" /> AI Gym Coach & Progressive Overload 5.0
            </span>
            <span className="px-3 py-1 rounded-full bg-[#023859] text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
              <Zap className="w-3 h-3 text-amber-300" /> Autoregulated Double Progression
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#011C40] tracking-tight">
            Adaptive Resistance Training
          </h1>
          <p className="text-[#26658C] text-xs md:text-sm mt-1 font-medium">
            Trained without a personal trainer? Nouriq prescribes exact weights, reps, and rest intervals, then syncs muscle recovery macros to your diet.
          </p>
        </div>

        {/* Global Lifetime Volume Metric Chip */}
        <div className="p-4 rounded-2xl bg-[#E0F7FA]/70 border border-[#54ACBF]/50 text-right shrink-0">
          <span className="text-[10px] font-extrabold text-[#26658C] uppercase tracking-wider block">Total Volume Lifted</span>
          <span className="text-xl font-black text-[#011C40] tracking-tight">{totalLifetimeVolume.toLocaleString()} kg</span>
          <span className="text-[10px] text-[#023859] font-bold block mt-0.5">{workoutLogs.length} Sessions Logged</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE WORKOUT SESSION HUD (WHEN USER IS WORKING OUT ON GYM FLOOR)        */}
      {/* ========================================================================= */}
      {activeWorkout ? (
        <div className="space-y-6">
          
          {/* Top Sticky Session Controller */}
          <div className="sticky top-2 z-40 ios-glass p-4 sm:p-5 rounded-[28px] shadow-xl border border-[#54ACBF] bg-white/95 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-[#023859] text-white flex items-center justify-center shadow-md animate-pulse">
                <Flame className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#26658C]">Live Gym Session</span>
                <h3 className="text-base font-extrabold text-[#011C40]">{activeWorkout.routineName}</h3>
              </div>
            </div>

            {/* Timers & Volume Center */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <span className="text-[10px] text-[#26658C] font-bold block uppercase">Elapsed Time</span>
                <span className="text-sm font-black font-mono text-[#011C40] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#023859]" /> {formatTime(elapsedSeconds)}
                </span>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-[#26658C] font-bold block uppercase">Volume Today</span>
                <span className="text-sm font-black font-mono text-[#011C40]">
                  {calculateWorkoutVolume(activeWorkout.exercises).totalVolumeKg.toLocaleString()} kg
                </span>
              </div>
            </div>

            {/* Finish / Cancel Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={cancelWorkoutSession}
                className="px-3 py-2 rounded-full text-[#26658C] hover:text-rose-600 text-xs font-bold transition-all cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleFinishWorkout}
                className="px-5 py-2.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Finish Workout 🏆</span>
              </button>
            </div>
          </div>

          {/* Live Rest Timer Banner (Floats when active) */}
          {isRestTimerActive && (
            <div className="ios-glass p-4 rounded-2xl border-2 border-[#54ACBF] bg-[#A7EBF2]/30 flex items-center justify-between shadow-md animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#023859] text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-sm">
                  {restSecondsLeft}s
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#011C40]">Resting Between Sets</h4>
                  <p className="text-[11px] text-[#26658C] font-medium">Allow ATP and neuromuscular recovery for peak progressive overload.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRestSecondsLeft(prev => prev + 30)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#54ACBF]/50 text-[#011C40] text-xs font-bold active:scale-95 cursor-pointer"
                >
                  +30s
                </button>
                <button
                  onClick={() => setIsRestTimerActive(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#023859] text-white text-xs font-extrabold active:scale-95 cursor-pointer"
                >
                  Skip Rest
                </button>
              </div>
            </div>
          )}

          {/* Exercise Cards List */}
          <div className="space-y-6">
            {activeWorkout.exercises.map((exerciseItem, exIdx) => {
              const exData = getExerciseById(exerciseItem.exerciseId);
              const pastSets = getPreviousSessionSetsForExercise(exerciseItem.exerciseId);
              const overloadAdvice = calculateProgressiveOverload(exerciseItem.exerciseId, pastSets, exerciseItem.targetReps);

              return (
                <div 
                  key={exerciseItem.exerciseId + exIdx}
                  className="ios-glass p-5 md:p-6 rounded-[28px] space-y-4 shadow-sm border border-[#54ACBF]/40"
                >
                  {/* Exercise Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#54ACBF]/20 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#023859] text-white text-xs font-extrabold flex items-center justify-center">
                          {exIdx + 1}
                        </span>
                        <h3 className="text-base font-extrabold text-[#011C40]">{exData.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#A7EBF2]/60 text-[#023859] text-[10px] font-extrabold">
                          {exData.equipment}
                        </span>
                      </div>
                      <p className="text-xs text-[#26658C] font-medium mt-0.5">
                        Target: <strong className="text-[#011C40]">{exerciseItem.targetSets} sets × {exerciseItem.targetReps} reps</strong> (Target RPE ~{exerciseItem.targetRpe})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      {/* 3D Biomechanical Form Model Trigger */}
                      <button
                        type="button"
                        onClick={() => setSelected3DExercise(exData)}
                        className="px-3 py-1.5 rounded-full bg-[#023859] hover:bg-[#011C40] text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#A7EBF2]" />
                        <span>3D Form Model</span>
                      </button>

                      {/* Exercise Substitute Trigger */}
                      {exData.substitutes && exData.substitutes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSubstituteModalExerciseIndex(exIdx)}
                          className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#26658C] hover:text-[#011C40] text-[11px] font-bold border border-[#54ACBF]/40 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Swap</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Progressive Overload Advice Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#A7EBF2]/40 to-[#E0F7FA]/70 border border-[#54ACBF]/40 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#011C40] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#023859]" /> AI Progressive Prescription
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#023859] text-white text-[10px] font-black tracking-wide">
                        {overloadAdvice.badge}
                      </span>
                    </div>
                    <p className="text-[#26658C] text-[11px] font-medium leading-relaxed">
                      {overloadAdvice.guidanceText}
                    </p>
                  </div>

                  {/* Form Cue Collapsible */}
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-[11px] text-[#26658C] flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#023859] shrink-0 mt-0.5" />
                    <span><strong>Pro Form Cue:</strong> {exData.formCue}</span>
                  </div>

                  {/* Set-by-Set Logging Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#54ACBF]/30 text-[#26658C] text-[10px] uppercase font-extrabold">
                          <th className="py-2 px-2 w-12 text-center">Set</th>
                          <th className="py-2 px-3">Previous</th>
                          <th className="py-2 px-3">Weight (kg)</th>
                          <th className="py-2 px-3">Reps</th>
                          <th className="py-2 px-3">RPE (1-10)</th>
                          <th className="py-2 px-3 text-center">Done</th>
                          <th className="py-2 px-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {exerciseItem.sets.map((set, setIdx) => {
                          const prevSet = pastSets[setIdx];
                          const isDone = set.completed;

                          return (
                            <tr 
                              key={setIdx}
                              className={`transition-colors ${isDone ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'}`}
                            >
                              <td className="py-2.5 px-2 text-center font-mono font-extrabold text-[#011C40]">
                                {set.setNumber}
                              </td>

                              {/* Previous Log Chip */}
                              <td className="py-2.5 px-3">
                                {prevSet ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                                    {prevSet.weightKg}kg × {prevSet.reps}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">—</span>
                                )}
                              </td>

                              {/* Weight Input */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={set.weightKg}
                                    onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weightKg', e.target.value)}
                                    placeholder={overloadAdvice.recommendedWeightKg.toString()}
                                    className="w-18 px-2.5 py-1.5 rounded-xl border border-[#54ACBF]/40 bg-white font-mono font-bold text-center text-[#011C40] focus:outline-none focus:ring-2 focus:ring-[#023859]"
                                  />
                                </div>
                              </td>

                              {/* Reps Input */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                                  placeholder={overloadAdvice.recommendedReps.toString()}
                                  className="w-16 px-2.5 py-1.5 rounded-xl border border-[#54ACBF]/40 bg-white font-mono font-bold text-center text-[#011C40] focus:outline-none focus:ring-2 focus:ring-[#023859]"
                                />
                              </td>

                              {/* RPE Selector */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={set.rpe}
                                  onChange={(e) => handleUpdateSet(exIdx, setIdx, 'rpe', Number(e.target.value))}
                                  className="px-2 py-1.5 rounded-xl border border-[#54ACBF]/40 bg-white font-mono font-bold text-xs text-[#011C40] focus:outline-none"
                                >
                                  <option value={7}>7 (3 reps left)</option>
                                  <option value={8}>8 (2 reps left)</option>
                                  <option value={8.5}>8.5 (1-2 reps left)</option>
                                  <option value={9}>9 (1 rep left)</option>
                                  <option value={9.5}>9.5 (Maybe 1 rep)</option>
                                  <option value={10}>10 (Max Effort / Failure)</option>
                                </select>
                              </td>

                              {/* Complete Checkbox Button */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all mx-auto cursor-pointer ${
                                    isDone 
                                      ? 'bg-emerald-600 text-white shadow-md scale-105' 
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                                  }`}
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                              </td>

                              {/* Remove Set Button */}
                              <td className="py-2.5 px-2 text-right">
                                {exerciseItem.sets.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveSet(exIdx, setIdx)}
                                    className="text-slate-300 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Set Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleAddSet(exIdx)}
                      className="w-full py-2 rounded-xl border border-dashed border-[#54ACBF]/50 hover:border-[#023859] text-[#26658C] hover:text-[#011C40] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Set {exerciseItem.sets.length + 1}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-6 rounded-[28px] ios-glass flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#011C40]">Ready to log session?</span>
              <p className="text-[11px] text-[#26658C]">Nouriq will calculate your progressive overload for next time and adjust your recovery macros.</p>
            </div>
            <button
              onClick={handleFinishWorkout}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Complete & Sync to Nouriq</span>
            </button>
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* ROUTINE & SPLIT SELECTOR VIEW (WHEN USER IS CHOOSING TODAY'S WORKOUT)      */
        /* ========================================================================= */
        <div className="space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="ios-glass p-4 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-extrabold text-[#26658C] uppercase tracking-wider block">Weekly Consistency</span>
              <span className="text-lg font-black text-[#011C40]">4x / Week Target</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Optimal Muscle Stimulus</span>
            </div>

            <div className="ios-glass p-4 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-extrabold text-[#26658C] uppercase tracking-wider block">Double Progression</span>
              <span className="text-lg font-black text-[#011C40]">Active ⚡</span>
              <span className="text-[10px] text-[#023859] font-bold block mt-0.5">Top-Set Auto Weight Lift</span>
            </div>

            <div className="ios-glass p-4 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-extrabold text-[#26658C] uppercase tracking-wider block">Completed Sessions</span>
              <span className="text-lg font-black text-[#011C40]">{workoutLogs.length}</span>
              <span className="text-[10px] text-[#26658C] font-medium block mt-0.5">All History Saved</span>
            </div>

            <div className="ios-glass p-4 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-extrabold text-[#26658C] uppercase tracking-wider block">Nutrition Sync</span>
              <span className="text-lg font-black text-emerald-700">Connected 🔗</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Auto-Refuel Active</span>
            </div>
          </div>

          {/* Routine Tabs Selector */}
          <div className="ios-glass p-6 rounded-[28px] space-y-5 shadow-sm border border-[#54ACBF]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#54ACBF]/20 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#011C40]">Choose Today's Workout Split</h2>
                <p className="text-xs text-[#26658C] font-medium">Science-backed routines designed for natural lifters building muscle without a trainer.</p>
              </div>

              {/* Split Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {WORKOUT_ROUTINES.map(routine => (
                  <button
                    key={routine.id}
                    onClick={() => setSelectedRoutineId(routine.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedRoutineId === routine.id
                        ? 'liquid-glass-btn liquid-glass-btn-active text-white shadow-sm'
                        : 'liquid-glass-btn text-[#011C40] hover:bg-[#E0F7FA]'
                    }`}
                  >
                    {routine.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Routine Detail Card */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#A7EBF2]/30 to-[#E0F7FA]/60 border border-[#54ACBF]/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#023859] text-white text-[10px] font-extrabold uppercase">
                      {selectedRoutine.splitType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#26658C] text-[10px] font-bold border border-[#54ACBF]/30">
                      ⏱️ ~{selectedRoutine.estimatedTimeMin} mins
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      {selectedRoutine.frequency}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#011C40] mt-1">{selectedRoutine.name}</h3>
                  <p className="text-xs text-[#26658C] font-medium mt-0.5">{selectedRoutine.description}</p>
                </div>

                <button
                  onClick={() => startWorkoutSession(selectedRoutine)}
                  className="px-6 py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Live Workout</span>
                </button>
              </div>

              {/* Routine Exercises Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#26658C] px-1 block">
                  Prescribed Exercise Order ({selectedRoutine.exercises.length} Exercises)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRoutine.exercises.map((item, idx) => {
                    const ex = getExerciseById(item.exerciseId);
                    const past = getPreviousSessionSetsForExercise(item.exerciseId);
                    const overload = calculateProgressiveOverload(item.exerciseId, past, item.targetReps);

                    return (
                      <div 
                        key={item.exerciseId + idx}
                        className="ios-glass-card p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-[#54ACBF]/30"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#023859]/10 text-[#023859] text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-[#011C40] truncate">{ex.name}</h4>
                            <span className="text-[10px] text-[#26658C] font-medium block">
                              {item.targetSets} sets × {item.targetReps} reps • {ex.equipment}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelected3DExercise(ex)}
                            className="px-2.5 py-1 rounded-full bg-[#023859] hover:bg-[#011C40] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                            title="View 3D Biomechanical Form Model"
                          >
                            <Eye className="w-3 h-3 text-[#A7EBF2]" />
                            <span>3D Form</span>
                          </button>
                          <span className="px-2 py-0.5 rounded-lg bg-[#A7EBF2]/50 text-[#023859] font-mono text-[10px] font-black">
                            {overload.recommendedWeightKg}kg next
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Past Workout Logs History */}
          {workoutLogs.length > 0 && (
            <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm border border-[#54ACBF]/30">
              <div className="flex items-center justify-between border-b border-[#54ACBF]/20 pb-3">
                <h3 className="text-base font-extrabold text-[#011C40] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#023859]" /> Workout History & PR Ledger
                </h3>
                <span className="text-xs text-[#26658C] font-bold">{workoutLogs.length} Sessions Logged</span>
              </div>

              <div className="space-y-3">
                {workoutLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="p-4 rounded-2xl bg-white/70 border border-[#54ACBF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#26658C]">{log.date}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#023859] text-white text-[9px] font-black uppercase">
                          {log.splitType || 'Hypertrophy'}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-[#011C40]">{log.routineName}</h4>
                      <p className="text-[11px] text-[#26658C]">
                        {log.exercises?.length || 0} Exercises • {(log.totalVolumeKg || 0).toLocaleString()} kg volume • ~{log.durationMinutes || 45} mins
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => deleteWorkoutLog(log.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* EXERCISE SUBSTITUTE MODAL (FOR BUSY GYMS)                                */}
      {/* ========================================================================= */}
      {substituteModalExerciseIndex !== null && activeWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="ios-glass p-6 rounded-[32px] max-w-md w-full space-y-4 shadow-2xl border border-[#54ACBF]/50 bg-white/95">
            <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-[#023859]" />
                <h3 className="text-sm font-extrabold text-[#011C40]">Substitute Exercise</h3>
              </div>
              <button 
                onClick={() => setSubstituteModalExerciseIndex(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-[#26658C] font-medium">
              Gym equipment occupied? Swap <strong className="text-[#011C40]">{getExerciseById(activeWorkout.exercises[substituteModalExerciseIndex].exerciseId).name}</strong> with a biomechanically equivalent exercise:
            </p>

            <div className="space-y-2">
              {getExerciseById(activeWorkout.exercises[substituteModalExerciseIndex].exerciseId).substitutes.map(subId => {
                const subData = getExerciseById(subId);
                return (
                  <button
                    key={subId}
                    onClick={() => handleSubstituteExercise(substituteModalExerciseIndex, subId)}
                    className="w-full p-3 rounded-2xl bg-[#E0F7FA]/50 hover:bg-[#A7EBF2]/40 border border-[#54ACBF]/40 text-left flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs font-extrabold text-[#011C40]">{subData.name}</h4>
                      <span className="text-[10px] text-[#26658C] font-medium">{subData.equipment} • {subData.primaryMuscle}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#023859]" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST-WORKOUT SUMMARY & NUTRITION RECOVERY MODAL                           */}
      {/* ========================================================================= */}
      {completedWorkoutSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="ios-glass p-6 sm:p-7 rounded-[32px] max-w-md w-full text-center space-y-5 shadow-2xl border border-[#54ACBF]/50 bg-white/95">
            
            {/* Trophy Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <Trophy className="w-8 h-8 fill-slate-950" />
            </div>

            <div className="space-y-1">
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider border border-emerald-300">
                Session Completed 🔥
              </span>
              <h3 className="text-xl font-extrabold text-[#011C40]">{completedWorkoutSummary.session.routineName}</h3>
              <p className="text-xs text-[#26658C] font-medium">
                Autoregulation calculations recorded. Next session weights calibrated.
              </p>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Total Volume</span>
                <span className="text-sm font-black text-[#011C40] font-mono">
                  {completedWorkoutSummary.volume.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Duration</span>
                <span className="text-sm font-black text-[#011C40] font-mono">
                  {completedWorkoutSummary.session.durationMinutes}m
                </span>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Sets Hit</span>
                <span className="text-sm font-black text-emerald-600 font-mono">
                  {completedWorkoutSummary.volume.completedSetsCount} sets
                </span>
              </div>
            </div>

            {/* Nutrition Recovery Feedback Card */}
            <div className="p-4 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#011C40] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#023859]" /> Recommended Recovery Refuel
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  +{completedWorkoutSummary.recovery.bonusCalories} kcal
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-[#023859]">
                <span>+{completedWorkoutSummary.recovery.bonusProtein}g Protein</span>
                <span>•</span>
                <span>+{completedWorkoutSummary.recovery.bonusCarbs}g Carbs</span>
              </div>
              <p className="text-[11px] text-[#26658C] font-medium leading-relaxed">
                {completedWorkoutSummary.recovery.mealRecommendation}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleApplyRecoveryMacros}
                className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Sync Recovery Macros to Dashboard</span>
              </button>

              <button
                onClick={() => setCompletedWorkoutSummary(null)}
                className="w-full py-2 rounded-full text-[#26658C] hover:text-[#011C40] font-bold text-xs transition-colors cursor-pointer"
              >
                Keep Default Goals & Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3D BIOMECHANICAL WORKOUT FORM VISUALIZER MODAL */}
      <Workout3DVisualizerModal
        isOpen={!!selected3DExercise}
        exercise={selected3DExercise}
        onClose={() => setSelected3DExercise(null)}
      />

    </div>
  );
}
