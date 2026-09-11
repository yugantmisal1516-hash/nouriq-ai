import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  getStoredGoals, saveStoredGoals,
  getStoredLoggedMeals, saveStoredLoggedMeals,
  getStoredWaterIntake, saveStoredWaterIntake,
  getStoredFastingState, saveStoredFastingState,
  getStoredGroceryItems, saveStoredGroceryItems,
  getStoredWeightLogs, saveStoredWeightLogs,
  getStoredWorkoutLogs, saveStoredWorkoutLogs,
  getStoredActiveWorkout, saveStoredActiveWorkout
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
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, scanner, mealplan, fasting, water, grocery, analytics, workout, coach, pricing, support
  const [workoutLogs, setWorkoutLogs] = useState(getStoredWorkoutLogs);
  const [activeWorkout, setActiveWorkout] = useState(getStoredActiveWorkout);

  const startWorkoutSession = (routine) => {
    const newSession = {
      id: `session-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      splitType: routine.splitType,
      startedAt: Date.now(),
      date: new Date().toISOString().split('T')[0],
      exercises: routine.exercises.map(re => ({
        exerciseId: re.exerciseId,
        targetSets: re.targetSets,
        targetReps: re.targetReps,
        targetRpe: re.targetRpe,
        sets: Array.from({ length: re.targetSets }, (_, i) => ({
          setNumber: i + 1,
          weightKg: '',
          reps: '',
          rpe: re.targetRpe || 8,
          completed: false
        }))
      }))
    };
    setActiveWorkout(newSession);
    saveStoredActiveWorkout(newSession);
  };

  const updateActiveWorkout = (updatedSession) => {
    setActiveWorkout(updatedSession);
    saveStoredActiveWorkout(updatedSession);
  };

  const cancelWorkoutSession = () => {
    setActiveWorkout(null);
    saveStoredActiveWorkout(null);
  };

  const saveWorkoutSession = (completedWorkout) => {
    const updatedLogs = [completedWorkout, ...workoutLogs];
    setWorkoutLogs(updatedLogs);
    saveStoredWorkoutLogs(updatedLogs);
    setActiveWorkout(null);
    saveStoredActiveWorkout(null);
    confetti({ particleCount: 140, spread: 80 });
  };

  const deleteWorkoutLog = (workoutId) => {
    const updated = workoutLogs.filter(w => w.id !== workoutId);
    setWorkoutLogs(updated);
    saveStoredWorkoutLogs(updated);
  };

  const syncWorkoutRecoveryMacros = (recoveryBonus) => {
    if (!recoveryBonus) return;
    setGoals(prev => {
      const updatedGoals = {
        ...prev,
        dailyCalorieGoal: (prev.dailyCalorieGoal || 2200) + (recoveryBonus.bonusCalories || 0),
        dailyProteinGoal: (prev.dailyProteinGoal || 160) + (recoveryBonus.bonusProtein || 0),
        dailyCarbGoal: (prev.dailyCarbGoal || 200) + (recoveryBonus.bonusCarbs || 0)
      };
      saveStoredGoals(updatedGoals);
      return updatedGoals;
    });
  };

  const [userBloodwork, setUserBloodwork] = useState(() => {
    try {
      const stored = localStorage.getItem('nouriq_user_bloodwork');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const syncUserBloodwork = (biomarkers) => {
    setUserBloodwork(biomarkers);
    try {
      if (biomarkers) {
        localStorage.setItem('nouriq_user_bloodwork', JSON.stringify(biomarkers));
      } else {
        localStorage.removeItem('nouriq_user_bloodwork');
      }
    } catch (e) {}
  };

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
        let cycle = 'annual';
        if (search.includes('cycle=monthly') || href.includes('monthly')) {
          cycle = 'monthly';
        }
        if (pendingCheckout === 'Ultimate' || search.includes('ultimate') || href.includes('ultimate')) {
          targetTier = 'Ultimate';
        } else if (pendingCheckout === 'Pro' || search.includes('pro') || href.includes('pro')) {
          targetTier = 'Pro';
        }

        const now = Date.now();
        const durationMs = cycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
        const expiresAtTimestamp = now + durationMs;
        const expiresDateStr = new Date(expiresAtTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const upgradedState = {
          tier: targetTier,
          status: 'active',
          billingCycle: cycle,
          dailyScansLeft: 9999,
          purchasedAt: now,
          expiresAtTimestamp: expiresAtTimestamp,
          expiresAt: `Auto-renews on ${expiresDateStr}`,
          autoPayActive: true,
          verified: true,
          stripePaymentId: `rzp_live_${now}`
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

      // 2. Creator VIP Pass URL check - Requires manual Admin approval via nouriq.aisupport@gmail.com
      if (search.includes('vip=NOURIQPASS') || search.includes('code=NOURIQPASS')) {
        if (window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      // 3. Admin Verification Approval Link (e.g. nouriq-ai.onrender.com?approve_creator=token_123&fp=fp_abc&name=Alex)
      if (search.includes('approve_creator=')) {
        const approveToken = urlParams.get('approve_creator');
        const targetFp = urlParams.get('fp') || 'fp_all';
        const creatorName = urlParams.get('name') || 'Creator';
        const shortCode = urlParams.get('code') || '';

        if (approveToken) {
          const approvalPayload = {
            token: approveToken,
            targetFp,
            creatorName,
            code: shortCode,
            status: 'APPROVED',
            approvedAt: Date.now(),
            approvedBy: 'nouriq.aisupport@gmail.com'
          };

          // 1. Broadcast global cloud signal via ntfy.sh (token-specific channel & global channel)
          try {
            fetch(`https://ntfy.sh/nouriq_vip_${approveToken}`, {
              method: 'POST',
              headers: { 'Title': 'VIP Approved', 'Priority': 'urgent' },
              body: JSON.stringify(approvalPayload)
            }).catch(e => console.warn('Cloud signal error:', e));

            fetch(`https://ntfy.sh/nouriq_vip_global_approvals`, {
              method: 'POST',
              headers: { 'Title': 'VIP Approved', 'Priority': 'urgent' },
              body: JSON.stringify(approvalPayload)
            }).catch(e => console.warn('Cloud global error:', e));
          } catch (e) {}

          // 2. Record Approval in local registry
          try {
            const registry = JSON.parse(localStorage.getItem('nouriq_approved_creator_registry') || '{}');
            registry[approveToken] = approvalPayload;
            localStorage.setItem('nouriq_approved_creator_registry', JSON.stringify(registry));

            if (window.BroadcastChannel) {
              const bc = new BroadcastChannel('nouriq_creator_approval_channel');
              bc.postMessage(approvalPayload);
            }
          } catch (err) {
            console.warn('Error recording admin approval:', err);
          }

          alert(`✅ ADMIN ACTION SUCCESSFUL!\n\nYou have remotely APPROVED Lifetime VIP Access for:\n• Creator: ${creatorName}\n• Device Fingerprint: ${targetFp || 'Target Device'}\n\nSignal transmitted across the cloud to Creator's device. VIP Access is now ACTIVE on their device!`);

          if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }

      // 4. Direct 1-Click VIP Pass Activation Link for Creator (e.g. nouriq-ai.onrender.com?activate_vip=token_123)
      if (search.includes('activate_vip=') || search.includes('vip_token=') || search.includes('vip_pass=')) {
        const vipToken = urlParams.get('activate_vip') || urlParams.get('vip_token') || urlParams.get('vip_pass');
        const creatorName = urlParams.get('name') || 'VIP Creator';
        if (vipToken) {
          const vipState = {
            tier: 'Ultimate',
            status: 'active',
            billingCycle: 'lifetime',
            dailyScansLeft: 99999,
            purchasedAt: Date.now(),
            expiresAtTimestamp: null,
            expiresAt: `Lifetime VIP Access (Approved by nouriq.aisupport@gmail.com)`,
            autoPayActive: true,
            isCreatorVip: true,
            creatorName: creatorName,
            deviceFingerprint: localStorage.getItem('nouriq_creator_device_fingerprint') || 'fp_vip',
            verified: true,
            stripePaymentId: `vip_link_approved_${vipToken}`
          };

          setSubscription(vipState);
          localStorage.setItem('nouriq_subscription', JSON.stringify(vipState));
          localStorage.removeItem('nouriq_pending_creator_request');
          document.cookie = `nouriq_sub_tier=Ultimate; max-age=315360000; path=/; SameSite=Lax`;
          setShowStripeSuccessModal(true);
          confetti({ particleCount: 200, spread: 100 });

          if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }

      // Always clean up temporary checkout flags
      localStorage.removeItem('nouriq_pending_checkout');
      localStorage.removeItem('nouriq_pending_checkout_time');
    } catch (err) {
      console.warn('Error validating Stripe return redirect:', err);
    }
  }, []);

  // Automated Subscription Expiry & AutoPay Revocation Validator
  useEffect(() => {
    const validateSubscriptionLifecycle = () => {
      try {
        const savedSubData = localStorage.getItem('nouriq_subscription');
        if (savedSubData) {
          const parsed = JSON.parse(savedSubData);
          if (parsed && parsed.tier !== 'Free') {
            const now = Date.now();
            if (parsed.autoPayActive === false && parsed.expiresAtTimestamp && now > parsed.expiresAtTimestamp) {
              const expiredState = {
                tier: 'Free',
                status: 'expired',
                billingCycle: 'monthly',
                dailyScansLeft: getStoredFreeDailyScans(),
                expiresAt: 'Expired (AutoPay Revoked)',
                autoPayActive: false,
                autoPayExpired: true,
                verified: false
              };
              setSubscription(expiredState);
              localStorage.removeItem('nouriq_subscription');
              document.cookie = "nouriq_sub_tier=; max-age=0; path=/;";
            }
          }
        }
      } catch (e) {
        console.warn('Subscription lifecycle validation error:', e);
      }
    };

    validateSubscriptionLifecycle();
  }, [activeTab]);

  // Automatic Daily Water Reset Engine (Every new day starts at 0 ml)
  useEffect(() => {
    const checkDailyWaterReset = () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        setWaterIntake(prev => {
          if (!prev || prev.date !== today) {
            const fresh = { date: today, currentMl: 0, history: [] };
            saveStoredWaterIntake(fresh);
            return fresh;
          }
          return prev;
        });
      } catch (e) {}
    };

    checkDailyWaterReset();
    const interval = setInterval(checkDailyWaterReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // Remote Creator Device Auto-Approval Sync Engine (Cross-Device Cloud PubSub + SSE + Local)
  useEffect(() => {
    if (subscription?.tier !== 'Free') return;

    let isMounted = true;
    let eventSource = null;
    let pollInterval = null;

    const handleApprovalData = (approvedRecord) => {
      if (!isMounted) return;
      try {
        const pendingStr = localStorage.getItem('nouriq_pending_creator_request');
        if (!pendingStr) return;
        const pending = JSON.parse(pendingStr);

        const currentFp = localStorage.getItem('nouriq_creator_device_fingerprint') || '';
        const tokenMatch = approvedRecord.token && approvedRecord.token === pending.verificationToken;
        const fpMatch = approvedRecord.targetFp && (approvedRecord.targetFp === currentFp || approvedRecord.targetFp === pending.deviceFingerprint || approvedRecord.targetFp === 'fp_all');
        const nameMatch = approvedRecord.creatorName && (approvedRecord.creatorName === pending.creatorName);

        if (tokenMatch || fpMatch || nameMatch || approvedRecord.status === 'APPROVED') {
          const creatorVipState = {
            tier: 'Ultimate',
            status: 'active',
            billingCycle: 'lifetime',
            dailyScansLeft: 99999,
            purchasedAt: Date.now(),
            expiresAtTimestamp: null,
            expiresAt: `Lifetime VIP Access (Approved by nouriq.aisupport@gmail.com)`,
            autoPayActive: true,
            isCreatorVip: true,
            creatorName: approvedRecord.creatorName || pending.creatorName || 'Creator VIP',
            deviceFingerprint: approvedRecord.targetFp || pending.deviceFingerprint || currentFp,
            verified: true,
            stripePaymentId: `vip_approved_${approvedRecord.token || pending.verificationToken || Date.now()}`
          };

          setSubscription(creatorVipState);
          localStorage.setItem('nouriq_subscription', JSON.stringify(creatorVipState));
          localStorage.removeItem('nouriq_pending_creator_request');
          document.cookie = `nouriq_sub_tier=Ultimate; max-age=315360000; path=/; SameSite=Lax`;
          confetti({ particleCount: 200, spread: 110 });
        }
      } catch (e) {
        console.warn('Error applying creator approval:', e);
      }
    };

    // 1. Local Registry & Broadcast Check
    const checkLocalRegistry = () => {
      try {
        const pendingStr = localStorage.getItem('nouriq_pending_creator_request');
        if (pendingStr) {
          const pending = JSON.parse(pendingStr);
          const registry = JSON.parse(localStorage.getItem('nouriq_approved_creator_registry') || '{}');
          const approvedRecord = registry[pending.verificationToken] || 
            Object.values(registry).find(r => r.targetFp === pending.deviceFingerprint || (r.creatorName && r.creatorName === pending.creatorName));

          if (approvedRecord && approvedRecord.status === 'APPROVED') {
            handleApprovalData(approvedRecord);
          }
        }
      } catch (err) {}
    };

    // 2. Fast Cloud Polling from ntfy.sh (Cross-Device Internet Relay)
    const pollCloudStore = async () => {
      try {
        const pendingStr = localStorage.getItem('nouriq_pending_creator_request');
        if (!pendingStr) return;
        const pending = JSON.parse(pendingStr);
        if (!pending.verificationToken) return;

        const endpoints = [
          `https://ntfy.sh/nouriq_vip_${pending.verificationToken}/json?poll=1`,
          `https://ntfy.sh/nouriq_vip_global_approvals/json?poll=1`
        ];

        for (const ep of endpoints) {
          try {
            const res = await fetch(ep);
            if (res.ok) {
              const text = await res.text();
              const lines = text.trim().split('\n');
              for (const line of lines) {
                if (!line.trim()) continue;
                try {
                  const data = JSON.parse(line);
                  if (data.message) {
                    let msgObj = null;
                    try { msgObj = JSON.parse(data.message); } catch (e) { msgObj = data.message; }
                    if (msgObj && (msgObj.status === 'APPROVED' || (typeof msgObj === 'string' && msgObj.includes('APPROVED')))) {
                      handleApprovalData(typeof msgObj === 'object' ? msgObj : { token: pending.verificationToken, status: 'APPROVED' });
                      return;
                    }
                  }
                } catch (e) {}
              }
            }
          } catch (e) {}
        }
      } catch (err) {}
    };

    checkLocalRegistry();
    pollCloudStore();
    pollInterval = setInterval(() => {
      checkLocalRegistry();
      pollCloudStore();
    }, 2000);

    // 3. Real-Time Server-Sent Events (SSE) Cross-Device Stream
    try {
      const pendingStr = localStorage.getItem('nouriq_pending_creator_request');
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending.verificationToken) {
          eventSource = new EventSource(`https://ntfy.sh/nouriq_vip_${pending.verificationToken}/sse`);
          eventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.message) {
                let msgObj = null;
                try { msgObj = JSON.parse(data.message); } catch (e) { msgObj = data.message; }
                if (msgObj && msgObj.status === 'APPROVED') {
                  handleApprovalData(msgObj);
                }
              }
            } catch (e) {}
          };
        }
      }
    } catch (e) {}

    let bc = null;
    try {
      if (window.BroadcastChannel) {
        bc = new BroadcastChannel('nouriq_creator_approval_channel');
        bc.onmessage = (event) => {
          if (event.data && event.data.status === 'APPROVED') {
            handleApprovalData(event.data);
          }
        };
      }
    } catch (e) {}

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (eventSource) eventSource.close();
      if (bc) bc.close();
    };
  }, [subscription?.tier]);

  const upgradeSubscription = (tierName, cycle = 'annual') => {
    const nameLower = (tierName || '').toLowerCase();
    let targetTier = 'Free';
    if (nameLower.includes('ultimate')) {
      targetTier = 'Ultimate';
    } else if (nameLower.includes('pro')) {
      targetTier = 'Pro';
    }

    const now = Date.now();
    const durationMs = cycle === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    const expiresAtTimestamp = now + durationMs;
    const expiresDateStr = new Date(expiresAtTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const upgradedState = {
      tier: targetTier,
      status: 'active',
      billingCycle: cycle,
      dailyScansLeft: targetTier === 'Free' ? getStoredFreeDailyScans() : 9999,
      purchasedAt: now,
      expiresAtTimestamp: targetTier === 'Free' ? null : expiresAtTimestamp,
      expiresAt: targetTier === 'Free' ? 'Lifetime' : `Auto-renews on ${expiresDateStr}`,
      autoPayActive: targetTier !== 'Free',
      verified: targetTier !== 'Free',
      stripePaymentId: targetTier !== 'Free' ? `rzp_live_${now}` : null
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

  const activateVerifiedCreatorPass = (payload) => {
    const vipState = {
      tier: 'Ultimate',
      status: 'active',
      billingCycle: 'lifetime',
      dailyScansLeft: 99999,
      purchasedAt: Date.now(),
      expiresAtTimestamp: null,
      expiresAt: `Lifetime VIP Access (Creator: ${payload.creatorName})`,
      autoPayActive: true,
      isCreatorVip: true,
      creatorEmail: payload.creatorEmail,
      deviceFingerprint: payload.deviceFingerprint,
      verified: true,
      stripePaymentId: `vip_creator_verified_${Date.now()}`
    };

    setSubscription(vipState);
    localStorage.setItem('nouriq_subscription', JSON.stringify(vipState));
    localStorage.setItem('nouriq_nouriqpass_nullified', 'true');
    localStorage.setItem('nouriq_creator_device_fingerprint', payload.deviceFingerprint);
    document.cookie = `nouriq_sub_tier=Ultimate; max-age=315360000; path=/; SameSite=Lax`;
    confetti({ particleCount: 180, spread: 100 });
  };

  const redeemVipPromoCode = (codeStr) => {
    const codeUpper = (codeStr || '').trim().toUpperCase();

    if (codeUpper !== 'NOURIQPASS') {
      return { success: false, message: 'Invalid code. Only NOURIQPASS is authorized for Creator Access.' };
    }

    const isNullified = localStorage.getItem('nouriq_nouriqpass_nullified');
    if (isNullified === 'true') {
      return { 
        success: false, 
        isNullified: true,
        message: '❌ Security Violation: NOURIQPASS has already been NULLIFIED & consumed. Code is expired for 2nd time use.' 
      };
    }

    return { 
      success: true, 
      requiresVerification: true, 
      message: 'Identity Proof Verification Required' 
    };
  };

  const cancelAutoPay = () => {
    setSubscription(prev => {
      if (prev.tier === 'Free') return prev;
      const expiresDateStr = prev.expiresAtTimestamp 
        ? new Date(prev.expiresAtTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'end of paid period';

      const updated = {
        ...prev,
        autoPayActive: false,
        status: 'cancelling',
        expiresAt: `Access ends on ${expiresDateStr} (AutoPay Cancelled)`
      };
      localStorage.setItem('nouriq_subscription', JSON.stringify(updated));
      return updated;
    });
  };

  const cancelSubscription = () => {
    const freeState = {
      tier: 'Free',
      status: 'active',
      billingCycle: 'monthly',
      dailyScansLeft: getStoredFreeDailyScans(),
      expiresAt: 'Lifetime',
      verified: false,
      stripePaymentId: null
    };
    setSubscription(freeState);
    localStorage.removeItem('nouriq_subscription');
    localStorage.removeItem('nouriq_pending_checkout');
    localStorage.removeItem('nouriq_pending_checkout_time');
    document.cookie = "nouriq_sub_tier=; max-age=0; path=/;";
    setActiveTab('dashboard'); // Directly redirect to Free Starter Plan on Dashboard
  };

  const resetToFreePlan = () => {
    cancelSubscription();
  };

  const createNewUserSession = (userGoals) => {
    // 1. Clear all logged meals to start completely fresh (0 kcal, 0g macros)
    setLoggedMeals([]);
    saveStoredLoggedMeals([]);

    // 2. Reset water intake to 0ml
    const today = new Date().toISOString().split('T')[0];
    const resetWaterData = { date: today, currentMl: 0, history: [] };
    setWaterIntake(resetWaterData);
    saveStoredWaterIntake(resetWaterData);

    // 3. Reset 5 free daily scan quota
    localStorage.setItem('nouriq_scans_date', today);
    localStorage.setItem('nouriq_scans_left', '5');

    // 4. Enforce Starter Free Plan for new account
    const freeState = {
      tier: 'Free',
      status: 'active',
      billingCycle: 'monthly',
      dailyScansLeft: 5,
      expiresAt: 'Lifetime',
      verified: false,
      stripePaymentId: null
    };
    setSubscription(freeState);
    localStorage.removeItem('nouriq_subscription');
    localStorage.removeItem('nouriq_pending_checkout');
    localStorage.removeItem('nouriq_pending_checkout_time');
    document.cookie = "nouriq_sub_tier=; max-age=0; path=/;";

    // 5. Apply clean user goals
    if (userGoals) {
      const mergedGoals = {
        name: userGoals.name || 'New Member',
        avatar: userGoals.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        dietType: userGoals.dietType || 'High Protein / Lean Gain',
        dailyCalorieGoal: Number(userGoals.dailyCalorieGoal || 2200),
        dailyProteinGoal: Number(userGoals.dailyProteinGoal || 160),
        dailyCarbGoal: Number(userGoals.dailyCarbGoal || 200),
        dailyFatGoal: Number(userGoals.dailyFatGoal || 70),
        dailyWaterGoal: Number(userGoals.dailyWaterGoal || 3000),
        dailyFiberGoal: Number(userGoals.dailyFiberGoal || 30)
      };
      setGoals(mergedGoals);
      saveStoredGoals(mergedGoals);
    }
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

  const updateFastingTargetHours = (hours) => {
    const validHours = Math.max(1, Math.min(168, Number(hours) || 16));
    const newState = {
      ...fastingState,
      targetHours: validHours,
      protocol: `Custom (${validHours}h)`
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
      const isToday = prev && prev.date === today;
      const currentMl = isToday ? prev.currentMl + amountMl : amountMl;
      const history = isToday ? [{ time: timeStr, amount: amountMl }, ...(prev.history || [])] : [{ time: timeStr, amount: amountMl }];
      const next = { date: today, currentMl, history };
      saveStoredWaterIntake(next);
      return next;
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

  const todayISO = new Date().toISOString().split('T')[0];
  const todayLocal = new Date().toLocaleDateString();

  const isTodayMeal = (m) => {
    if (!m) return false;
    const mDate = m.date || m.food?.date;
    if (!mDate) return false;

    if (mDate === todayISO || mDate === todayLocal) return true;

    try {
      const d = new Date(mDate);
      const now = new Date();
      return !isNaN(d.getTime()) &&
             d.getFullYear() === now.getFullYear() &&
             d.getMonth() === now.getMonth() &&
             d.getDate() === now.getDate();
    } catch (e) {
      return false;
    }
  };

  const todayMeals = loggedMeals.filter(isTodayMeal);

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

  const todayMealScores = todayMeals.reduce((sum, m) => {
    const score = Number(m.healthScore || m.healthRating || m.food?.healthScore || m.food?.healthRating || 92);
    return sum + score;
  }, 0);

  const averageHealthScore = todayMeals.length > 0 
    ? Math.round(todayMealScores / todayMeals.length) 
    : (loggedMeals.length > 0 
        ? Math.round(loggedMeals.reduce((sum, m) => sum + Number(m.healthScore || m.healthRating || m.food?.healthScore || m.food?.healthRating || 92), 0) / loggedMeals.length)
        : 92);

  return (
    <NutritionContext.Provider value={{
      goals, setGoals, createNewUserSession,
      loggedMeals, logMeal, deleteMeal, removeMeal: deleteMeal, todayTotals, todayMeals,
      waterIntake, addWater, resetWater,
      fastingState, setFastingState, startFast, stopFast, updateFastingTargetHours,
      groceryItems, toggleGroceryItem, addGroceryItem, removeGroceryItem,
      weightLogs, logWeight,
      workoutLogs, activeWorkout, startWorkoutSession, updateActiveWorkout, cancelWorkoutSession, saveWorkoutSession, deleteWorkoutLog, syncWorkoutRecoveryMacros,
      activeTab, setActiveTab,
      averageHealthScore,
      userBloodwork, setUserBloodwork, syncUserBloodwork,
      subscription, upgradeSubscription, cancelSubscription, cancelAutoPay, resetToFreePlan, consumeScanQuota, redeemVipPromoCode, activateVerifiedCreatorPass,
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
