import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getStoredGoals, saveStoredGoals,
  getStoredLoggedMeals, saveStoredLoggedMeals,
  getStoredWaterIntake, saveStoredWaterIntake,
  getStoredFastingState, saveStoredFastingState,
  getStoredGroceryItems, saveStoredGroceryItems,
  getStoredWeightLogs, saveStoredWeightLogs
} from '../utils/storage';

const NutritionContext = createContext(null);

export const NutritionProvider = ({ children }) => {
  const [goals, setGoals] = useState(getStoredGoals);
  const [loggedMeals, setLoggedMeals] = useState(getStoredLoggedMeals);
  const [waterIntake, setWaterIntake] = useState(getStoredWaterIntake);
  const [fastingState, setFastingState] = useState(getStoredFastingState);
  const [groceryItems, setGroceryItems] = useState(getStoredGroceryItems);
  const [weightLogs, setWeightLogs] = useState(getStoredWeightLogs);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, scanner, mealplan, fasting, water, grocery, analytics, coach, pricing, support

  // Global Subscription & Monetization State
  const [subscription, setSubscription] = useState({
    tier: 'Free', // Free, Pro, Ultimate
    status: 'active',
    billingCycle: 'annual',
    dailyScansLeft: 5,
    expiresAt: 'Lifetime'
  });

  const upgradeSubscription = (tierName, cycle = 'annual') => {
    const nameLower = (tierName || '').toLowerCase();
    let targetTier = 'Free';
    if (nameLower.includes('ultimate')) {
      targetTier = 'Ultimate';
    } else if (nameLower.includes('pro')) {
      targetTier = 'Pro';
    }

    setSubscription({
      tier: targetTier,
      status: 'active',
      billingCycle: cycle,
      dailyScansLeft: 9999,
      expiresAt: 'Auto-renews next year'
    });
  };

  const cancelSubscription = () => {
    setSubscription({
      tier: 'Free',
      status: 'cancelled',
      billingCycle: 'monthly',
      dailyScansLeft: 5,
      expiresAt: 'Expired'
    });
  };

  // Save changes to localStorage
  useEffect(() => { saveStoredGoals(goals); }, [goals]);
  useEffect(() => { saveStoredLoggedMeals(loggedMeals); }, [loggedMeals]);
  useEffect(() => { saveStoredWaterIntake(waterIntake); }, [waterIntake]);
  useEffect(() => { saveStoredFastingState(fastingState); }, [fastingState]);
  useEffect(() => { saveStoredGroceryItems(groceryItems); }, [groceryItems]);
  useEffect(() => { saveStoredWeightLogs(weightLogs); }, [weightLogs]);

  const consumeScanQuota = () => {
    if (subscription.tier === 'Free') {
      if (subscription.dailyScansLeft <= 0) {
        return false;
      }
      setSubscription(prev => ({
        ...prev,
        dailyScansLeft: Math.max(0, prev.dailyScansLeft - 1)
      }));
      return true;
    }
    return true;
  };

  // Log a new food item
  const logMeal = (foodItem) => {
    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      food: foodItem
    };
    setLoggedMeals(prev => [newLog, ...prev]);
  };

  // Delete a meal log
  const removeMeal = (id) => {
    setLoggedMeals(prev => prev.filter(m => m.id !== id));
  };

  // Hydration Actions
  const addWater = (amountMl) => {
    setWaterIntake(prev => {
      const newAmount = prev.currentMl + amountMl;
      const newHistory = [
        ...prev.history,
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount: amountMl }
      ];
      return { ...prev, currentMl: newAmount, history: newHistory };
    });
  };

  const resetWater = () => {
    const today = new Date().toISOString().split('T')[0];
    setWaterIntake({ date: today, currentMl: 0, history: [] });
  };

  // Fasting Actions
  const startFast = (protocol = '16:8', hours = 16) => {
    setFastingState({
      isFasting: true,
      protocol: protocol,
      startTime: Date.now(),
      targetHours: hours,
      completedFasts: fastingState.completedFasts || 0
    });
  };

  const stopFast = () => {
    setFastingState(prev => ({
      ...prev,
      isFasting: false,
      completedFasts: (prev.completedFasts || 0) + 1
    }));
  };

  // Grocery Actions
  const toggleGroceryItem = (id) => {
    setGroceryItems(prev => prev.map(item => item.id === id ? { ...item, bought: !item.bought } : item));
  };

  const addGroceryItem = (item) => {
    setGroceryItems(prev => [
      { id: `g-${Date.now()}`, bought: false, ...item },
      ...prev
    ]);
  };

  const removeGroceryItem = (id) => {
    setGroceryItems(prev => prev.filter(item => item.id !== id));
  };

  // Today's total macro calculations
  const todayDate = new Date().toISOString().split('T')[0];
  const todayMeals = loggedMeals.filter(m => m.date === todayDate);

  const todayTotals = todayMeals.reduce((acc, curr) => {
    const m = curr.food.macros || {};
    return {
      calories: acc.calories + (curr.food.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fats: acc.fats + (m.fats || 0),
      fiber: acc.fiber + (m.fiber || 0),
      healthScoreSum: acc.healthScoreSum + (curr.food.healthScore || 80),
      count: acc.count + 1
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, healthScoreSum: 0, count: 0 });

  const averageHealthScore = todayTotals.count > 0 ? Math.round(todayTotals.healthScoreSum / todayTotals.count) : 92;

  return (
    <NutritionContext.Provider value={{
      goals, setGoals,
      loggedMeals, logMeal, removeMeal,
      todayMeals, todayTotals, averageHealthScore,
      waterIntake, addWater, resetWater,
      fastingState, startFast, stopFast, setFastingState,
      groceryItems, toggleGroceryItem, addGroceryItem, removeGroceryItem,
      weightLogs, setWeightLogs,
      activeTab, setActiveTab,
      subscription, upgradeSubscription, cancelSubscription, consumeScanQuota
    }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => useContext(NutritionContext);
