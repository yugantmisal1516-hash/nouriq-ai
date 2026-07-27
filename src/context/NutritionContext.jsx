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

  // Persistent Subscription State Engine (Remembers Pro & Ultimate tier across browser refreshes!)
  const [subscription, setSubscription] = useState(() => {
    try {
      // 1. Check if user is returning directly from Stripe Checkout with payment success URL params
      const search = (window.location.search || '').toLowerCase();
      const href = (window.location.href || '').toLowerCase();
      
      if (search.includes('payment=success') || search.includes('session_id=') || search.includes('stripe_success=true') || href.includes('payment=success')) {
        const targetTier = (search.includes('ultimate') || href.includes('ultimate')) ? 'Ultimate' : 'Pro';
        const upgradedState = {
          tier: targetTier,
          status: 'active',
          billingCycle: 'annual',
          dailyScansLeft: 9999,
          expiresAt: 'Auto-renews next year',
          verified: true
        };
        localStorage.setItem('nouriq_subscription', JSON.stringify(upgradedState));
        return upgradedState;
      }

      // 2. Check if a paid subscription (Pro or Ultimate) is already saved in localStorage
      const stored = localStorage.getItem('nouriq_subscription');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.verified === true && (parsed.tier === 'Pro' || parsed.tier === 'Ultimate')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored subscription on initialization:', e);
    }

    // 3. Default to Free Starter Plan for new non-paid visitors
    return {
      tier: 'Free',
      status: 'active',
      billingCycle: 'annual',
      dailyScansLeft: 5,
      expiresAt: 'Lifetime',
      verified: false
    };
  });

  const [showStripeSuccessModal, setShowStripeSuccessModal] = useState(false);

  // Save subscription changes to localStorage whenever state updates
  useEffect(() => {
    try {
      if (subscription && subscription.verified === true && (subscription.tier === 'Pro' || subscription.tier === 'Ultimate')) {
        localStorage.setItem('nouriq_subscription', JSON.stringify(subscription));
      } else {
        localStorage.removeItem('nouriq_subscription');
      }
    } catch (e) {
      console.warn('Error persisting subscription to localStorage:', e);
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
      dailyScansLeft: targetTier === 'Free' ? 5 : 9999,
      expiresAt: targetTier === 'Free' ? 'Lifetime' : 'Auto-renews next year',
      verified: targetTier !== 'Free'
    };

    setSubscription(upgradedState);
    if (targetTier !== 'Free') {
      localStorage.setItem('nouriq_subscription', JSON.stringify(upgradedState));
    } else {
      localStorage.removeItem('nouriq_subscription');
    }
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
    localStorage.removeItem('nouriq_subscription');
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
    localStorage.removeItem('nouriq_pending_checkout_time');
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
        dailyScansLeft: prev.dailyScansLeft - 1
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

  const toggleGroceryItem = (id) => {
    setGroceryItems(prev => prev.map(item => item.id === id ? { ...item, bought: !item.bought } : item));
  };

  const addGroceryItem = (item) => {
    const newItem = {
      ...item,
      id: `g-${Date.now()}`,
      bought: false
    };
    setGroceryItems(prev => [newItem, ...prev]);
  };

  const logWeight = (weight) => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setWeightLogs(prev => [...prev, { date: todayStr, weight: parseFloat(weight) }]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = loggedMeals.filter(m => m.date === todayStr);
  const todayTotals = todayMeals.reduce((acc, curr) => {
    const f = curr.food || {};
    return {
      calories: acc.calories + (f.calories || 0),
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fats: acc.fats + (f.fats || 0),
      fiber: acc.fiber + (f.fiber || 0)
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

  const totalMealScores = loggedMeals.reduce((sum, m) => sum + (m.food?.healthRating || 90), 0);
  const averageHealthScore = loggedMeals.length > 0 ? Math.round(totalMealScores / loggedMeals.length) : 92;

  return (
    <NutritionContext.Provider value={{
      goals, setGoals,
      loggedMeals, logMeal, deleteMeal, todayTotals,
      waterIntake, addWater,
      fastingState, setFastingState,
      groceryItems, toggleGroceryItem, addGroceryItem,
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
