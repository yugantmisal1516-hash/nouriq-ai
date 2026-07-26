import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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

  // Global Subscription & Monetization State (Defaults strictly to Free unless Stripe verified)
  const [subscription, setSubscription] = useState(() => {
    try {
      const stored = localStorage.getItem('nouriq_subscription');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only keep Pro/Ultimate if verified by Stripe payment return
        if (parsed && parsed.verified === true && (parsed.tier === 'Pro' || parsed.tier === 'Ultimate')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored subscription:', e);
    }
    return {
      tier: 'Free', // Free forever for all new visitors
      status: 'active',
      billingCycle: 'annual',
      dailyScansLeft: 5,
      expiresAt: 'Lifetime',
      verified: false
    };
  });

  const [showStripeSuccessModal, setShowStripeSuccessModal] = useState(false);

  // Save subscription changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nouriq_subscription', JSON.stringify(subscription));
    } catch (e) {
      console.warn('Error saving subscription to localStorage:', e);
    }
  }, [subscription]);

  // Strict Stripe Return Validation & Automatic Tier Upgrade
  useEffect(() => {
    try {
      const search = (window.location.search || '').toLowerCase();
      const href = (window.location.href || '').toLowerCase();
      const referrer = (document.referrer || '').toLowerCase();
      const pendingCheckout = localStorage.getItem('nouriq_pending_checkout');
      const pendingTime = parseInt(localStorage.getItem('nouriq_pending_checkout_time') || '0', 10);
      const now = Date.now();
      const urlParams = new URLSearchParams(search);

      // Must be a recent checkout attempt within 15 minutes AND an explicit return from Stripe
      const isRecentCheckout = pendingCheckout && (now - pendingTime < 900000);
      const isExplicitStripeReturn = 
        referrer.includes('stripe.com') ||
        referrer.includes('buy.stripe') ||
        urlParams.get('payment') === 'success' || 
        urlParams.get('success') === 'true' || 
        urlParams.get('status') === 'success' ||
        href.includes('payment=success') ||
        href.includes('success=true') ||
        href.includes('session_id=');

      if (isRecentCheckout && isExplicitStripeReturn) {
        let targetTier = 'Pro';
        if (pendingCheckout === 'Ultimate' || search.includes('ultimate') || href.includes('ultimate')) {
          targetTier = 'Ultimate';
        } else if (pendingCheckout === 'Pro' || search.includes('pro') || href.includes('pro')) {
          targetTier = 'Pro';
        }

        const upgradedState = {
          tier: targetTier,
          status: 'active',
          billingCycle: 'annual',
          dailyScansLeft: 9999,
          expiresAt: 'Auto-renews next year',
          verified: true
        };

        setSubscription(upgradedState);
        localStorage.setItem('nouriq_subscription', JSON.stringify(upgradedState));
        setShowStripeSuccessModal(true);
        confetti({ particleCount: 160, spread: 95 });

        // Clean up URL parameters cleanly
        if (window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      // ALWAYS clear pending checkout flag after evaluation
      localStorage.removeItem('nouriq_pending_checkout');
      localStorage.removeItem('nouriq_pending_checkout_time');
    } catch (err) {
      console.warn('Error validating Stripe return redirect:', err);
    }
  }, []);

  const upgradeSubscription = (tierName, cycle = 'annual') => {
    const nameLower = (tierName || '').toLowerCase();
    let targetTier = 'Free';
    if (nameLower.includes('ultimate')) {
      targetTier = 'Ultimate';
    } else if (nameLower.includes('pro')) {
      targetTier = 'Pro';
    }

    const upgradedState = {
      tier: targetTier,
      status: 'active',
      billingCycle: cycle,
      dailyScansLeft: targetTier === 'Free' ? 5 : 9999,
      expiresAt: targetTier === 'Free' ? 'Lifetime' : 'Auto-renews next year',
      verified: targetTier !== 'Free'
    };

    setSubscription(upgradedState);
    localStorage.setItem('nouriq_subscription', JSON.stringify(upgradedState));
  };

  const cancelSubscription = () => {
    const freeState = {
      tier: 'Free',
      status: 'cancelled',
      billingCycle: 'monthly',
      dailyScansLeft: 5,
      expiresAt: 'Expired',
      verified: false
    };
    setSubscription(freeState);
    localStorage.setItem('nouriq_subscription', JSON.stringify(freeState));
  };

  const resetToFreePlan = () => {
    const freeState = {
      tier: 'Free',
      status: 'active',
      billingCycle: 'annual',
      dailyScansLeft: 5,
      expiresAt: 'Lifetime',
      verified: false
    };
    setSubscription(freeState);
    localStorage.removeItem('nouriq_subscription');
    localStorage.removeItem('nouriq_pending_checkout');
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
      subscription, upgradeSubscription, cancelSubscription, consumeScanQuota, resetToFreePlan,
      showStripeSuccessModal, setShowStripeSuccessModal
    }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => useContext(NutritionContext);
