import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  Flame, 
  Dumbbell, 
  UtensilsCrossed, 
  Droplets, 
  Camera, 
  Timer, 
  Plus, 
  Trash2, 
  Award, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const nutrition = useNutrition() || {};
  const { 
    goals = { dailyCalorieGoal: 2200, dailyProteinGoal: 160, dailyCarbGoal: 200, dailyFatGoal: 70, dailyFiberGoal: 30, name: 'Alex Rivera', dietType: 'High Protein' }, 
    todayMeals = [], 
    todayTotals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }, 
    averageHealthScore = 92,
    removeMeal = () => {}, 
    waterIntake = { currentMl: 0, history: [] }, 
    addWater = () => {},
    fastingState = { isFasting: false }, 
    setActiveTab = () => {} 
  } = nutrition;

  const protGoal = goals?.dailyProteinGoal || 160;
  const carbGoal = goals?.dailyCarbGoal || 200;
  const fatGoal = goals?.dailyFatGoal || 70;
  const fiberGoal = goals?.dailyFiberGoal || 30;
  const calGoal = goals?.dailyCalorieGoal || 2200;

  const protVal = todayTotals?.protein || 0;
  const carbVal = todayTotals?.carbs || 0;
  const fatVal = todayTotals?.fats || 0;
  const fiberVal = todayTotals?.fiber || 0;
  const calVal = todayTotals?.calories || 0;

  const proteinPercent = Math.min(100, Math.round((protVal / protGoal) * 100));
  const carbsPercent = Math.min(100, Math.round((carbVal / carbGoal) * 100));
  const fatPercent = Math.min(100, Math.round((fatVal / fatGoal) * 100));
  const fiberPercent = Math.min(100, Math.round((fiberVal / fiberGoal) * 100));

  const caloriesLeft = calGoal - calVal;
  const caloriePercent = Math.min(100, Math.round((calVal / calGoal) * 100));

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[28px] ios-glass p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3.5 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-white" /> AI Coach Active
              </span>
              <span className="text-xs text-[#26658C] font-semibold">{goals.dietType}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#011C40] tracking-tight">
              Good day, <span className="bg-gradient-to-r from-[#011C40] via-[#023859] to-[#54ACBF] bg-clip-text text-transparent">{goals.name}</span>
            </h1>
            <p className="text-[#26658C] text-xs sm:text-sm mt-1 max-w-xl font-medium leading-relaxed">
              Logged {todayMeals.length} meals today with an average Health Rating of{' '}
              <button 
                onClick={() => setActiveTab('analytics')}
                className="text-[#023859] font-extrabold underline hover:text-[#011C40] transition-colors cursor-pointer"
                title="Click to view full analytics report"
              >
                {averageHealthScore}/100
              </button>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center space-x-2 px-5 py-2.5 liquid-glass-btn liquid-glass-btn-active font-extrabold text-xs transition-all shadow-sm active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Food Photo</span>
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className="flex items-center space-x-2 px-4.5 py-2.5 liquid-glass-btn text-[#011C40] font-bold text-xs transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#023859]" />
              <span>Ask AI Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calorie Ring Card */}
        <div className="ios-glass p-6 rounded-[28px] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" /> Daily Calorie Goal
            </h3>
            <span className="text-xs font-extrabold px-3 py-1 liquid-glass-btn text-[#011C40]">
              {caloriePercent}% Goal
            </span>
          </div>

          <div className="relative w-40 h-40 mx-auto my-3 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="stroke-[#E0F7FA]" strokeWidth="8" fill="transparent" />
              <circle
                cx="50" cy="50" r="42"
                className="stroke-[#023859] transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * caloriePercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-[#011C40] block tracking-tight">
                {todayTotals.calories}
              </span>
              <span className="text-[11px] text-[#26658C] font-semibold">
                of {goals.dailyCalorieGoal} kcal
              </span>
              <div className="mt-1 text-[11px] font-extrabold text-[#023859]">
                {caloriesLeft >= 0 ? `${caloriesLeft} kcal left` : `${Math.abs(caloriesLeft)} kcal over`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#54ACBF]/30 text-center text-xs">
            <div className="ios-glass-card p-3 rounded-2xl">
              <span className="text-[#26658C] block font-medium">Consumed</span>
              <span className="font-extrabold text-[#011C40]">{todayTotals.calories} kcal</span>
            </div>
            <div className="ios-glass-card p-3 rounded-2xl">
              <span className="text-[#26658C] block font-medium">Burned</span>
              <span className="font-extrabold text-[#023859]">450 kcal</span>
            </div>
          </div>
        </div>

        {/* Macro Distribution Bars */}
        <div className="ios-glass p-6 rounded-[28px] lg:col-span-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#023859]" /> Macro Targets Breakdown
              </h3>
              <p className="text-xs text-[#26658C] font-medium">Target completion for protein, carbs, fats, & fiber</p>
            </div>
            <span className="px-3 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-xs font-extrabold">
              {goals.dietType}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Protein - #023859 */}
            <div className="ios-glass-card p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-bold text-[#011C40] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#023859]" /> Protein
                </span>
                <span className="text-[#26658C] font-semibold">{todayTotals.protein.toFixed(1)} / {goals.dailyProteinGoal}g</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                <div className="bg-[#023859] h-full rounded-full transition-all duration-700" style={{ width: `${proteinPercent}%` }} />
              </div>
              <div className="flex justify-between text-[11px] mt-1.5 text-[#26658C]">
                <span>{proteinPercent}% target</span>
                <span>{Math.max(0, goals.dailyProteinGoal - todayTotals.protein).toFixed(1)}g left</span>
              </div>
            </div>

            {/* Carbs - #26658C */}
            <div className="ios-glass-card p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-bold text-[#011C40] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#26658C]" /> Carbs
                </span>
                <span className="text-[#26658C] font-semibold">{todayTotals.carbs.toFixed(1)} / {goals.dailyCarbGoal}g</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                <div className="bg-[#26658C] h-full rounded-full transition-all duration-700" style={{ width: `${carbsPercent}%` }} />
              </div>
              <div className="flex justify-between text-[11px] mt-1.5 text-[#26658C]">
                <span>{carbsPercent}% target</span>
                <span>{Math.max(0, goals.dailyCarbGoal - todayTotals.carbs).toFixed(1)}g left</span>
              </div>
            </div>

            {/* Fats - #54ACBF */}
            <div className="ios-glass-card p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-bold text-[#011C40] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#54ACBF]" /> Fats
                </span>
                <span className="text-[#26658C] font-semibold">{todayTotals.fats.toFixed(1)} / {goals.dailyFatGoal}g</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                <div className="bg-[#54ACBF] h-full rounded-full transition-all duration-700" style={{ width: `${fatPercent}%` }} />
              </div>
              <div className="flex justify-between text-[11px] mt-1.5 text-[#26658C]">
                <span>{fatPercent}% target</span>
                <span>{Math.max(0, goals.dailyFatGoal - todayTotals.fats).toFixed(1)}g left</span>
              </div>
            </div>

            {/* Fiber - #A7EBF2 */}
            <div className="ios-glass-card p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-bold text-[#011C40] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#54ACBF]" /> Fiber
                </span>
                <span className="text-[#26658C] font-semibold">{todayTotals.fiber.toFixed(1)} / {goals.dailyFiberGoal}g</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                <div className="bg-[#54ACBF] h-full rounded-full transition-all duration-700" style={{ width: `${fiberPercent}%` }} />
              </div>
              <div className="flex justify-between text-[11px] mt-1.5 text-[#26658C]">
                <span>{fiberPercent}% target</span>
                <span>{Math.max(0, goals.dailyFiberGoal - todayTotals.fiber).toFixed(1)}g left</span>
              </div>
            </div>

          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-[#023859] shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold text-[#011C40]">Health Rating: Grade A Superfood</span>
                <p className="text-[#26658C] text-[11px] font-medium">Optimal anti-inflammatory balance and high protein ratio.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-bold text-[#023859] hover:underline flex items-center gap-1 shrink-0"
            >
              View Full Analytics Report <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Logged Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="ios-glass p-6 rounded-[28px] lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#023859]" /> Today's Logged Meals
              </h3>
              <p className="text-xs text-[#26658C] font-medium">Meals analyzed with calorie & macro breakdown</p>
            </div>
            <button
              onClick={() => setActiveTab('scanner')}
              className="px-3.5 py-1.5 liquid-glass-btn text-[#011C40] text-xs font-extrabold flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Log Meal
            </button>
          </div>

          {todayMeals.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#54ACBF]/50 rounded-3xl">
              <Camera className="w-10 h-10 text-[#26658C] mx-auto mb-2" />
              <h4 className="text-xs font-bold text-[#011C40]">No Meals Logged Today Yet</h4>
              <p className="text-xs text-[#26658C] mb-4 max-w-sm mx-auto">Snap or upload a photo of your meal for instant AI estimation.</p>
              <button
                onClick={() => setActiveTab('scanner')}
                className="px-4 py-2 liquid-glass-btn liquid-glass-btn-active font-extrabold text-xs"
              >
                Scan Meal Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayMeals.map((item) => (
                <div key={item.id} className="ios-glass-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.food.image} 
                      alt={item.food.name} 
                      className="w-14 h-14 rounded-2xl object-cover ring-1 ring-[#54ACBF]/40 shadow-xs" 
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-[#011C40]">
                          {item.time}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#023859] text-white">
                          Health Score: {item.food.healthScore}/100 ({item.food.grade})
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#011C40] mt-1">{item.food.name}</h4>
                      <div className="flex items-center space-x-3 text-[11px] text-[#26658C] mt-1 font-medium">
                        <span><strong className="text-[#011C40]">{item.food.calories}</strong> kcal</span>
                        <span>P: <strong className="text-[#023859]">{item.food.macros?.protein}g</strong></span>
                        <span>C: <strong className="text-[#26658C]">{item.food.macros?.carbs}g</strong></span>
                        <span>F: <strong className="text-[#54ACBF]">{item.food.macros?.fats}g</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#54ACBF]/30">
                    <button
                      onClick={() => removeMeal(item.id)}
                      className="w-7 h-7 liquid-glass-btn liquid-glass-circle text-[#26658C] hover:text-rose-600 transition-colors flex items-center justify-center"
                      title="Remove Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side Modules */}
        <div className="space-y-6">
          
          <div className="ios-glass p-5 rounded-[28px] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#023859]" /> Liquid Hydration
              </h4>
              <button 
                onClick={() => setActiveTab('water')}
                className="text-[11px] font-bold text-[#023859] hover:underline"
              >
                Tracker
              </button>
            </div>
            
            <div className="ios-glass-card p-3.5 rounded-2xl mb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#26658C] font-medium">Consumed Today</span>
                <p className="text-base font-extrabold text-[#011C40]">{waterIntake.currentMl} <span className="text-xs text-[#26658C] font-normal">/ {goals.dailyWaterGoal} ml</span></p>
              </div>
              <div className="w-9 h-9 rounded-full liquid-glass-btn liquid-glass-btn-active flex items-center justify-center font-extrabold text-xs">
                {Math.round((waterIntake.currentMl / goals.dailyWaterGoal) * 100)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addWater(250)}
                className="py-2 px-3 liquid-glass-btn text-[#011C40] font-extrabold text-xs transition-all text-center shadow-xs active:scale-95"
              >
                + 250 ml Glass
              </button>
              <button
                onClick={() => addWater(500)}
                className="py-2 px-3 liquid-glass-btn text-[#011C40] font-extrabold text-xs transition-all text-center shadow-xs active:scale-95"
              >
                + 500 ml Bottle
              </button>
            </div>
          </div>

          <div className="ios-glass p-5 rounded-[28px] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#023859]" /> Fasting Timer ({fastingState.protocol})
              </h4>
              <button 
                onClick={() => setActiveTab('fasting')}
                className="text-[11px] font-bold text-[#023859] hover:underline"
              >
                Controls
              </button>
            </div>

            <div className="ios-glass-card p-3.5 rounded-2xl">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#26658C]">Current Metabolic Stage</span>
                <span className="text-[#011C40] font-extrabold">Ketosis State 🔥</span>
              </div>
              <p className="text-xs text-[#26658C] font-medium">10h 30m elapsed of 16h target</p>
              <div className="w-full bg-[#E0F7FA] rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-[#023859] h-2 rounded-full w-[65%]" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
