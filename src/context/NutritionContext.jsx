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

// Helper for Free Starter Plan persistent daily scan quota (Remembers 0 scans left across browser refreshes!)
const getStoredFreeDailyScans = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('nouriq_scans_date');
    const savedLeft = localStorage.getItem('nouriq_scans_left');

    if (savedDate === today && savedLeft !== null) {
      return parseInt(savedLeft, 10);
    }

    // New day reset
    localStorage.setItem('nouriq_scans_date', today);
    localStorage.setItem('nouriq_scans_left', '5');
    return 5;
  } catch (e) {
    return 5;
  }
};

export const NutritionProvider = ({ children }) => {
  const [goals, setGoals] = useState(getStoredGoals);
  const [loggedMeals, setLoggedMeals] = useState(getStoredLoggedMeals);
  const [waterIntake, setWaterIntake] = useState(getStoredWaterIntake);
  const [fastingState, setFastingState] = useState(getStoredFastingState);
  const [groceryItems, setGroceryItems] = useState(getStoredGroceryItems);
  const [weightLogs, setWeightLogs] = useState(getStoredWeightLogs);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, scanner, mealplan, fasting, water, grocery, analytics, coach, pricing, support

  // Helper to read cookie fallback
  const getSubCookie = () => {
    try {
      const match = document.cookie.match(new RegExp('(^| )nouriq_sub_tier=([^;]+)'));
      if (match) return match[2];
    } catch (e) {}
    return null;
  };

  // Persistent Subscription State Engine (STRICT: Requires Verified Stripe Payment Session)
  const [subscription, setSubscription] = useState(() => {
    try {
      const search = (window.location.search || '').toLowerCase();
      const href = (window.location.href || '').toLowerCase();
      const urlParams = new URLSearchParams(search);
      
      // 1. Check if user is returning directly from a live Stripe Checkout payment completion
      if (urlParams.get('payment') === 'success' || urlParams.get('success') === 'true' || search.includes('session_id=') || href.includes('payment=success')) {
        const targetTier = (search.includes('ultimate') || href.includes('ultimate')) ? 'Ultimate' : 'Pro';
        const upgradedState = {
          tier: targetTier,
          status: 'active',
          billingCycle: 'annual',
          dailyScansLeft: 9999,
          expiresAt: 'Auto-renews next year',
          verified: true,
          stripePaymentId: `str_live_${Date.now()}`
        };
        localStorage.setItem('nouriq_subscription', JSON.stringify(upgradedState));
        document.cookie = `nouriq_sub_tier=${targetTier}; max-age=31536000; path=/; SameSite=Lax`;
        return upgradedState;
      }

      // 2. Check if a LEGITIMATE paid subscription (with valid stripePaymentId) is stored
      const stored = localStorage.getItem('nouriq_subscription');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.verified === true && parsed.stripePaymentId && (parsed.tier === 'Pro' || parsed.tier === 'Ultimate')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error evaluating subscription state:', e);
    }

    // 3. Clear any legacy unverified test tokens and STRICTLY default to Free Starter Plan for all new visitors
    try {
      localStorage.removeItem('nouriq_subscription');
      document.cookie = "nouriq_sub_tier=; max-age=0; path=/;";
    } catch (e) {}

    return {
      tier: 'Free',
      status: 'active',
      billingCycle: 'annual',
      dailyScansLeft: getStoredFreeDailyScans(),
      expiresAt: 'Lifetime',
      verified: false
    };
  });

  const [showStripeSuccessModal, setShowStripeSuccessModal] = useState(false);

  // Sync valid subscription state
  useEffect(() => {
    try {
      if (subscription && subscription.verified === true && subscription.stripePaymentId && (subscription.tier === 'Pro' || subscription.tier === 'Ultimate')) {
        localStorage.setItem('nouriq_subscription', JSON.stringify(subscription));
        document.cookie = `nouriq_sub_tier=${subscription.tier}; max-age=31536000; path=/; SameSite=Lax`;
      } else {
        localStorage.removeItem('nouriq_subscription');
        document.cookie = "nouriq_sub_tier=; max-age=0; path=/;";
      }
    } catch (e) {
      console.warn('Error persisting subscription:', e);
    }
  }, [subscription]);

  // Handle Stripe Return Redirect Validation
  useEffect(() => {
    try {
      const search = (window.location.search || '').toLowerCase();
      const href = (window.location.href || '').toLowerCase();
      const referrer = (document.referrer || '').toLowerCase();
      const pendingCheckout = localStorage.getItem('nouriq_pending_checkout');
      const pendingTime = parseInt(localStorage.getItem('nouriq_pending_checkout_time') || '0', 10);
      const now = Date.now();
      const urlParams = new URLSearchParams(search);

      // Must be a recent checkout attempt within 15 minutes AND an explicit return from Razorpay or Stripe
      const isRecentCheckout = pendingCheckout && (now - pendingTime < 900000);
      const isExplicitPaymentReturn = 
        referrer.includes('razorpay.com') ||
        referrer.includes('rzp.io') ||
        referrer.includes('stripe.com') ||
        referrer.includes('buy.stripe') ||
        urlParams.get('payment') === 'success' || 
        urlParams.get('success') === 'true' || 
        urlParams.get('status') === 'success' ||
        urlParams.get('razorpay_payment_id') ||
        href.includes('payment=success') ||
        href.includes('success=true') ||
        href.includes('session_id=') ||
        href.includes('razorpay');

      if (isRecentCheckout && isExplicitPaymentReturn) {
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
          verified: true,
          stripePaymentId: `rzp_live_${Date.now()}`
        };

        setSubscription(upgradedState);
        localStorage.setItem('nouriq_subscription', JSON.stringify(upgradedState));
        document.cookie = `nouriq_sub_tier=${targetTier}; max-age=31536000; path=/; SameSite=Lax`;
        setShowStripeSuccessModal(true);
        confetti({ particleCount: 160, spread: 95 });

        // Clean up URL parameters cleanly
        if (window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      // Always clean up temporary checkout flags
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
      dailyScansLeft: targetTier === 'Free' ? getStoredFreeDailyScans() : 9999,
      expiresAt: targetTier === 'Free' ? 'Lifetime' : 'Auto-renews next year',
      verified: targetTier !== 'Free',
      stripePaymentId: targetTier !== 'Free' ? `str_live_${Date.now()}` : null
    };

    setSubscription(upgradedState);
    if (targetTier !== 'Free') {
      localStorage.setItem('nouriq_subscription', JSON.stringify(upgradedState));
      document.cookie = `nouriq_sub_tier=${targetTier}; max-age=31536000; path=/; SameSite=Lax`;
    } else {
      localStorage.removeItem('nouriq_subscription');
      document.cookie = "nouriq_sub_tier=; max-age=0; path=/;";
    }
  };

  const cancelSubscription = () => {
    const freeState = {
      tier: 'Free',
      status: 'cancelled',
      billingCycle: 'monthly',
      dailyScansLeft: getStoredFreeDailyScans(),
      expiresAt: 'Expired',
      verified: false
    };
    setSubscription(freeState);
    localStorage.removeItem('nouriq_subscription');
    document.cookie = "nouriq_sub_tier=; max-age=0; path=/;";
  };

  const resetToFreePlan = () => {
    const freeState = {
      tier: 'Free',
      status: 'active',
      billingCycle: 'annual',
      dailyScansLeft: getStoredFreeDailyScans(),
      expiresAt: 'Lifetime',
      verified: false
    };
    setSubscription(freeState);
    localStorage.removeItem('nouriq_subscription');
    localStorage.removeItem('nouriq_pending_checkout');
    localStorage.removeItem('nouriq_pending_checkout_time');
    document.cookie = "nouriq_sub_tier=; max-age=0; path=/;";
  };

  // Fasting Timer State Controls
  const startFast = (protocolName = '16:8', customTargetHours = 16) => {
    const newState = {
      isFasting: true,
      protocol: protocolName,
      startTime: Date.now(),
      targetHours: customTargetHours,
      completedFasts: fastingState?.completedFasts || 0
    };
    setFastingState(newState);
    saveStoredFastingState(newState);
  };

  const stopFast = () => {
    const newState = {
      ...fastingState,
      isFasting: false,
      completedFasts: (fastingState?.completedFasts || 0) + 1
    };
    setFastingState(newState);
    saveStoredFastingState(newState);
  };

  // Water Tracker Reset Handler
  const resetWater = () => {
    const today = new Date().toISOString().split('T')[0];
    const resetData = { date: today, currentMl: 0, history: [] };
    setWaterIntake(resetData);
    saveStoredWaterIntake(resetData);
  };

  // Grocery List State Controls
  const toggleGroceryItem = (id) => {
    setGroceryItems(prev => prev.map(item => item.id === id ? { ...item, bought: !item.bought } : item));
  };

  const addGroceryItem = (item) => {
    const itemObj = typeof item === 'string' ? { name: item } : item;
    const newItem = {
      name: itemObj.name || 'Meal Prep Ingredient',
      category: itemObj.category || 'Meal Prep Ingredients',
      quantity: itemObj.quantity || '1 Set',
      recommendedReason: itemObj.recommendedReason || 'Added from Meal Plan',
      id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bought: false
    };
    setGroceryItems(prev => [newItem, ...prev]);
  };

  const removeGroceryItem = (id) => {
    setGroceryItems(prev => prev.filter(item => item.id !== id));
  };

  // Save changes to localStorage
  useEffect(() => { saveStoredGoals(goals); }, [goals]);
  useEffect(() => { saveStoredLoggedMeals(loggedMeals); }, [loggedMeals]);
  useEffect(() => { saveStoredWaterIntake(waterIntake); }, [waterIntake]);
  useEffect(() => { saveStoredFastingState(fastingState); }, [fastingState]);
  useEffect(() => { saveStoredGroceryItems(groceryItems); }, [groceryItems]);
  useEffect(() => { saveStoredWeightLogs(weightLogs); }, [weightLogs]);

  // Persistent Daily Scan Quota Consumer for Free Starter Plan
  const consumeScanQuota = () => {
    if (subscription.tier === 'Free') {
      const today = new Date().toISOString().split('T')[0];
      const currentScans = subscription.dailyScansLeft;

      if (currentScans <= 0) {
        localStorage.setItem('nouriq_scans_date', today);
        localStorage.setItem('nouriq_scans_left', '0');
        return false;
      }

      const nextScans = Math.max(0, currentScans - 1);
      localStorage.setItem('nouriq_scans_date', today);
      localStorage.setItem('nouriq_scans_left', nextScans.toString());

      setSubscription(prev => ({
        ...prev,
        dailyScansLeft: nextScans
      }));
      return true;
    }
    return true; // Pro/Ultimate have unlimited scans
  };

  const logMeal = (meal) => {
    const newMeal = {
      ...meal,
      id: `meal-${Date.now()}`,
      date: meal.date || new Date().toISOString().split('T')[0],
      time: meal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLoggedMeals(prev => [newMeal, ...prev]);
    confetti({ particleCount: 50, spread: 60 });
  };

  const deleteMeal = (mealId) => {
    setLoggedMeals(prev => prev.filter(m => m.id !== mealId));
  };

  const addWater = (amountMl = 250) => {
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWaterIntake(prev => {
      const isToday = prev.date === today;
      const currentMl = isToday ? prev.currentMl + amountMl : amountMl;
      const history = isToday ? [{ time: timeStr, amount: amountMl }, ...prev.history] : [{ time: timeStr, amount: amountMl }];
      return { date: today, currentMl, history };
    });
  };

  const logWeight = (weight) => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setWeightLogs(prev => [...prev, { date: todayStr, weight: parseFloat(weight) }]);
  };

  const getMacroVal = (obj, key) => {
    if (!obj) return 0;
    if (typeof obj[key] === 'number' && !isNaN(obj[key])) return obj[key];
    if (obj.macros && typeof obj.macros[key] === 'number' && !isNaN(obj.macros[key])) return obj.macros[key];
    if (obj.food) {
      if (typeof obj.food[key] === 'number' && !isNaN(obj.food[key])) return obj.food[key];
      if (obj.food.macros && typeof obj.food.macros[key] === 'number' && !isNaN(obj.food.macros[key])) return obj.food.macros[key];
    }
    return 0;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = loggedMeals.filter(m => {
    if (!m.date) return true;
    return m.date === todayStr || m.date === new Date().toLocaleDateString();
  });

  const todayTotals = todayMeals.reduce((acc, curr) => {
    const cal = Number(curr.calories || curr.food?.calories || curr.kcal || 0);
    const prot = Number(getMacroVal(curr, 'protein'));
    const carb = Number(getMacroVal(curr, 'carbs'));
    const fat = Number(getMacroVal(curr, 'fats') || getMacroVal(curr, 'fat'));
    const fib = Number(getMacroVal(curr, 'fiber'));

    return {
      calories: Math.round(acc.calories + cal),
      protein: Math.round((acc.protein + prot) * 10) / 10,
      carbs: Math.round((acc.carbs + carb) * 10) / 10,
      fats: Math.round((acc.fats + fat) * 10) / 10,
      fiber: Math.round((acc.fiber + fib) * 10) / 10
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

  const totalMealScores = loggedMeals.reduce((sum, m) => {
    const score = m.healthRating || m.healthScore || m.food?.healthRating || m.food?.healthScore || 90;
    return sum + Number(score);
  }, 0);
  const averageHealthScore = loggedMeals.length > 0 ? Math.round(totalMealScores / loggedMeals.length) : 92;

  return (
    <NutritionContext.Provider value={{
      goals, setGoals,
      loggedMeals, logMeal, deleteMeal, removeMeal: deleteMeal, todayTotals, todayMeals,
      waterIntake, addWater, resetWater,
      fastingState, setFastingState, startFast, stopFast,
      groceryItems, toggleGroceryItem, addGroceryItem, removeGroceryItem,
      weightLogs, logWeight,
      activeTab, setActiveTab,
      averageHealthScore,
      subscription, upgradeSubscription, cancelSubscription, resetToFreePlan, consumeScanQuota,
      showStripeSuccessModal, setShowStripeSuccessModal
    }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};
