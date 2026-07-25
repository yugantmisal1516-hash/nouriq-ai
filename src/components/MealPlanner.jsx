import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { SAMPLE_MEAL_PLANS, MEAL_PLAN_DIETS } from '../data/mealTemplates';
import { calculateAIMacrosByWeight } from '../utils/aiNutritionistKnowledge';
import { 
  Sparkles, 
  Plus, 
  ShoppingCart, 
  Check, 
  Clock,
  Calendar,
  Utensils,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealPlanner() {
  const { goals, logMeal, addGroceryItem, addGrocery, subscription, setActiveTab } = useNutrition();
  
  const [selectedDiet, setSelectedDiet] = useState('High Protein');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [addedGroceryNames, setAddedGroceryNames] = useState([]);
  const [loggedMealNames, setLoggedMealNames] = useState([]);

  // Custom Meal Form State with Food Portion Weight (Grams) & AI Auto-Calculate
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customMealsMap, setCustomMealsMap] = useState({});
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('Lunch');
  const [customWeightGrams, setCustomWeightGrams] = useState(250);
  const [customCalories, setCustomCalories] = useState(420);
  const [customProtein, setCustomProtein] = useState(38);
  const [customCarbs, setCustomCarbs] = useState(32);
  const [customFat, setCustomFat] = useState(14);
  const [customPrepTime, setCustomPrepTime] = useState('12 min');
  const [aiCalculatedBadge, setAiCalculatedBadge] = useState(false);

  const currentPlan = SAMPLE_MEAL_PLANS[selectedDiet] || SAMPLE_MEAL_PLANS['High Protein'];
  const baseDayPlan = (currentPlan.days && currentPlan.days[selectedDayIndex]) 
    ? currentPlan.days[selectedDayIndex] 
    : (currentPlan.days ? currentPlan.days[0] : { day: DAYS_OF_WEEK[selectedDayIndex], meals: [] });

  const dayName = DAYS_OF_WEEK[selectedDayIndex];
  const userAddedMeals = customMealsMap[dayName] || [];
  const combinedMeals = [...(baseDayPlan.meals || []), ...userAddedMeals];

  const [showProUpgradeModal, setShowProUpgradeModal] = useState(false);

  const handleAiAutoCalculate = () => {
    if (subscription?.tier === 'Free') {
      setShowProUpgradeModal(true);
      return;
    }
    if (!customName.trim()) return;
    const computed = calculateAIMacrosByWeight(customName, customWeightGrams);
    setCustomCalories(computed.calories);
    setCustomProtein(computed.protein);
    setCustomCarbs(computed.carbs);
    setCustomFat(computed.fat);
    setAiCalculatedBadge(true);
    confetti({ particleCount: 50, spread: 50 });
    setTimeout(() => setAiCalculatedBadge(false), 3500);
  };

  const handleAddCustomMeal = (e) => {
    e.preventDefault();
    if (subscription?.tier === 'Free') {
      setShowProUpgradeModal(true);
      return;
    }
    if (!customName.trim()) return;

    const newMeal = {
      name: `${customName.trim()} (${customWeightGrams}g)`,
      type: customType,
      weightGrams: Number(customWeightGrams),
      calories: Number(customCalories),
      protein: Number(customProtein),
      carbs: Number(customCarbs),
      fat: Number(customFat),
      prepTime: customPrepTime || '10 min',
      isCustom: true
    };

    setCustomMealsMap(prev => ({
      ...prev,
      [dayName]: [...(prev[dayName] || []), newMeal]
    }));

    setCustomName('');
    setShowCustomForm(false);
    confetti({ particleCount: 70, spread: 60 });
  };

  const handleAddToGrocery = (meal) => {
    if (addedGroceryNames.includes(meal.name)) return;

    if (typeof addGroceryItem === 'function') {
      addGroceryItem({
        name: meal.name,
        category: meal.type || 'Meal Prep Ingredients',
        quantity: '1 Meal Set',
        recommendedReason: `Derived from 7-Day ${selectedDiet} Meal Plan (${meal.type})`
      });
    }

    if (typeof addGrocery === 'function') {
      addGrocery(meal.name, meal.type || 'Meal Prep Ingredients', '1 Meal Set');
    }

    setAddedGroceryNames(prev => [...prev, meal.name]);
    confetti({ particleCount: 50, spread: 50 });
  };

  const handleLogPlanMeal = (meal) => {
    if (loggedMealNames.includes(meal.name)) return;

    logMeal({
      id: `plan-${Date.now()}`,
      name: meal.name,
      calories: Number(meal.calories),
      category: meal.type || 'Meal Plan',
      healthScore: 96,
      grade: 'A+',
      image: meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      macros: {
        protein: Number(meal.protein || 0),
        carbs: Number(meal.carbs || 0),
        fats: Number(meal.fat || meal.fats || 0),
        fiber: 6.5
      }
    });

    setLoggedMealNames(prev => [...prev, meal.name]);
    confetti({ particleCount: 70, spread: 60 });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="ios-glass p-6 rounded-[28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-white" /> AI 7-Day Architect
            </span>
            {subscription?.tier === 'Ultimate' ? (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-black shadow-xs">
                ⭐ VIP Disease & Biomarker Protocols
              </span>
            ) : subscription?.tier === 'Pro' ? (
              <span className="px-3 py-1 rounded-full bg-[#023859] text-white text-xs font-extrabold shadow-xs">
                👑 Nouriq Pro Custom Architect
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#A7EBF2] text-[#023859] text-xs font-extrabold border border-[#54ACBF]">
                ⚡ Starter 7-Day Templates
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-[#011C40] tracking-tight">AI 7-Day Meal Planner</h1>
          <p className="text-[#26658C] text-xs mt-1 font-medium">
            {subscription?.tier === 'Free'
              ? `Basic 7-Day Templates for ${goals.dailyCalorieGoal} kcal target. Upgrade to Pro for Custom Portion Weight (g) & USDA AI Auto-Calc.`
              : `Custom 7-Day Meal Architect tuned for ${goals.dailyCalorieGoal} kcal daily target.`}
          </p>
        </div>

        {/* Diet Template Selectors */}
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-2 md:pb-0">
          {MEAL_PLAN_DIETS.map((diet) => (
            <button
              key={diet}
              onClick={() => {
                setSelectedDiet(diet);
                setSelectedDayIndex(0);
              }}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs active:scale-95 liquid-glass-btn ${
                selectedDiet === diet 
                  ? 'liquid-glass-btn-active scale-105' 
                  : 'text-[#011C40]'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      {/* 7-Day Day Selector Bar */}
      <div className="ios-glass p-3 rounded-[24px] shadow-sm flex items-center space-x-2 overflow-x-auto">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 text-[#26658C] font-extrabold text-xs shrink-0 border-r border-[#54ACBF]/30 mr-1">
          <Calendar className="w-4 h-4 text-[#023859]" />
          <span>7-Day Cycle:</span>
        </div>
        
        {DAYS_OF_WEEK.map((day, idx) => (
          <button
            key={day}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 active:scale-95 ${
              selectedDayIndex === idx
                ? 'liquid-glass-btn liquid-glass-btn-active text-white scale-105 shadow-md'
                : 'liquid-glass-btn text-[#011C40] hover:bg-[#E0F7FA]'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Day Overview Summary Badge & Custom Meal Add Button */}
      <div className="ios-glass px-5 py-4 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs bg-[#A7EBF2]/30 border border-[#54ACBF]/40">
        <div>
          <span className="text-xs font-extrabold text-[#011C40]">
            📅 {dayName} Menu — {selectedDiet} Plan
          </span>
          <p className="text-[11px] text-[#26658C] font-medium">
            {currentPlan.description} ({combinedMeals.length} Meals Scheduled)
          </p>
        </div>

        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="px-4 py-2 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Add Custom Meal</span>
          {showCustomForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Custom Meal Creator Form with Weight (g) & AI Auto-Calculator */}
      {showCustomForm && (
        <form onSubmit={handleAddCustomMeal} className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm border border-[#54ACBF]/40 text-xs">
          <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
            <h3 className="font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#023859]" /> Create Custom Meal for {dayName}
            </h3>
            <span className="text-[10px] text-[#26658C] font-bold">World Standard AI Dietetics</span>
          </div>

          {aiCalculatedBadge && (
            <div className="p-3 rounded-2xl bg-[#A7EBF2]/60 border border-[#54ACBF] text-[#023859] font-extrabold text-xs flex items-center gap-2 animate-bounce">
              <Zap className="w-4 h-4 fill-[#023859]" />
              <span>✨ AI Auto-Calculated exact macros for {customWeightGrams}g portion based on USDA & Global Dietetic Standards!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[#26658C] mb-1 font-semibold">Meal Title / Dish Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Coastal Pomfret Fish Fry, Chicken Biryani..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2 text-[#011C40] font-bold focus:outline-none placeholder:text-[#26658C]/50"
              />
            </div>

            <div>
              <label className="block text-[#26658C] mb-1 font-semibold">Food Portion Weight (Grams)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={customWeightGrams}
                  onChange={(e) => setCustomWeightGrams(e.target.value)}
                  className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2 text-[#011C40] font-bold focus:outline-none pr-8"
                />
                <span className="absolute right-3 top-2 text-[#26658C] font-bold text-xs">g</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="w-full sm:w-1/2">
              <label className="block text-[#26658C] mb-1 font-semibold">Meal Category / Type</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2 text-[#011C40] font-bold focus:outline-none"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snack">Snack</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAiAutoCalculate}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 sm:mt-5"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>⚡ AI Auto-Calculate Macros by Weight</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 text-xs pt-2">
            <div>
              <label className="block text-[#26658C] mb-1 font-semibold">Calories (kcal)</label>
              <input
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3 py-2 text-[#011C40] font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#26658C] mb-1 font-semibold">Protein (g)</label>
              <input
                type="number"
                value={customProtein}
                onChange={(e) => setCustomProtein(e.target.value)}
                className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3 py-2 text-[#011C40] font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#26658C] mb-1 font-semibold">Carbs (g)</label>
              <input
                type="number"
                value={customCarbs}
                onChange={(e) => setCustomCarbs(e.target.value)}
                className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3 py-2 text-[#011C40] font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#26658C] mb-1 font-semibold">Fats (g)</label>
              <input
                type="number"
                value={customFat}
                onChange={(e) => setCustomFat(e.target.value)}
                className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3 py-2 text-[#011C40] font-bold focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs active:scale-95 flex items-center justify-center gap-1.5 mt-2"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Save & Add {customWeightGrams}g Custom Meal to {dayName}</span>
          </button>
        </form>
      )}

      {/* Meal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {combinedMeals.map((meal, index) => {
          const isGroceryAdded = addedGroceryNames.includes(meal.name);
          const isMealLogged = loggedMealNames.includes(meal.name);

          return (
            <div key={index} className="ios-glass p-6 rounded-[28px] flex flex-col justify-between space-y-4 shadow-sm hover:border-[#54ACBF] transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full liquid-glass-btn text-[#011C40]">
                      {meal.type}
                    </span>
                    {meal.isCustom && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#023859] text-white">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#26658C] flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#023859]" /> {meal.prepTime}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-[#011C40]">{meal.name}</h3>

                <div className="flex items-center space-x-3 text-xs mt-3 pt-3 border-t border-[#54ACBF]/30 font-medium">
                  <span className="text-[#011C40] font-extrabold">{meal.calories} kcal</span>
                  <span className="text-[#26658C]">P: <strong className="text-[#023859] font-extrabold">{meal.protein}g</strong></span>
                  <span className="text-[#26658C]">C: <strong className="text-[#26658C] font-extrabold">{meal.carbs}g</strong></span>
                  <span className="text-[#26658C]">F: <strong className="text-[#54ACBF] font-extrabold">{meal.fat || meal.fats}g</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#54ACBF]/30">
                <button
                  onClick={() => handleLogPlanMeal(meal)}
                  disabled={isMealLogged}
                  className={`py-2.5 px-3 rounded-full font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 ${
                    isMealLogged 
                      ? 'liquid-glass-btn text-[#011C40] bg-[#A7EBF2]/60 cursor-default'
                      : 'liquid-glass-btn liquid-glass-btn-active text-white'
                  }`}
                >
                  {isMealLogged ? <Check className="w-3.5 h-3.5 text-[#023859]" /> : <Plus className="w-3.5 h-3.5 text-white" />}
                  <span>{isMealLogged ? 'Logged' : 'Log Today'}</span>
                </button>

                <button
                  onClick={() => handleAddToGrocery(meal)}
                  disabled={isGroceryAdded}
                  className={`py-2.5 px-3 rounded-full font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 ${
                    isGroceryAdded
                      ? 'liquid-glass-btn text-[#011C40] bg-[#A7EBF2]/60 cursor-default'
                      : 'liquid-glass-btn text-[#011C40]'
                  }`}
                >
                  {isGroceryAdded ? <Check className="w-3.5 h-3.5 text-[#023859]" /> : <ShoppingCart className="w-3.5 h-3.5 text-[#023859]" />}
                  <span>{isGroceryAdded ? 'Added' : 'Grocery List'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Upgrade Pop-Out Modal for Custom Meal Form */}
      {showProUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/80 backdrop-blur-md">
          <div className="ios-glass p-7 rounded-[32px] max-w-md w-full space-y-4 text-center border border-[#54ACBF]/50 shadow-2xl relative">
            <button 
              onClick={() => setShowProUpgradeModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/40 text-[#011C40] font-bold flex items-center justify-center hover:bg-white text-sm"
            >
              ✕
            </button>
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-md">
              <Zap className="w-7 h-7 text-slate-950 fill-slate-950" />
            </div>
            <h3 className="text-xl font-black text-[#011C40]">Nouriq Pro Feature Locked</h3>
            <p className="text-xs text-[#26658C] font-medium leading-relaxed">
              Custom Meal Portion Weight (g) & USDA AI Auto-Calculate Engine is exclusive to <strong className="text-[#023859]">Nouriq Pro</strong>. Upgrade now to craft custom 7-day meal plans!
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowProUpgradeModal(false);
                  setActiveTab('pricing');
                }}
                className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>👑 Upgrade to Nouriq Pro ($14.99/mo)</span>
              </button>
              <button
                onClick={() => setShowProUpgradeModal(false)}
                className="w-full py-2.5 rounded-full liquid-glass-btn text-[#011C40] font-extrabold text-xs"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
