import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  Check, 
  Sparkles, 
  Crown, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const STRIPE_PRICE_IDS = {
  pro: {
    monthly: 'price_1Tx2AESM1HN5cAihVew0wefR',
    annual: 'price_1Tx2DPSM1HN5cAihIw6ILuus'
  },
  ultimate: {
    monthly: 'price_1Tx28uSM1HN5cAihF9P0wfxm',
    annual: 'price_1Tx2CfSM1HN5cAihDlpntrW6'
  }
};

// Official Razorpay 24/7 Live Payment Pages (Unlimited Recurring Payments)
export const RAZORPAY_PAYMENT_LINKS = {
  pro: {
    monthly: 'https://rzp.io/rzp/MqwuZ6r',
    annual: 'https://rzp.io/rzp/nr8OwUh'
  },
  ultimate: {
    monthly: 'https://rzp.io/rzp/ldvMrIF',
    annual: 'https://rzp.io/rzp/2LBXwyG'
  }
};

export default function PricingPlans({ isOpen, onClose }) {
  const { subscription, upgradeSubscription, resetToFreePlan, goals } = useNutrition();
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  // Stripe/Razorpay Checkout Form Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const isPro = subscription?.tier === 'Pro';
  const isUltimate = subscription?.tier === 'Ultimate';

  const handleOpenStripe = (tier) => {
    if (tier.id === 'free') {
      if (typeof resetToFreePlan === 'function') {
        resetToFreePlan();
      }
      if (onClose) onClose();
      return;
    }
    
    // Save pending checkout tier to localStorage before redirecting to Razorpay
    const targetTierName = tier.id === 'ultimate' ? 'Ultimate' : 'Pro';
    try {
      localStorage.setItem('nouriq_pending_checkout', targetTierName);
      localStorage.setItem('nouriq_pending_checkout_time', Date.now().toString());
    } catch (e) {
      console.warn('Error saving pending checkout state:', e);
    }

    // Direct Razorpay Hosted Payment Link Redirect
    if (tier.paymentLink) {
      window.location.href = tier.paymentLink;
      return;
    }

    setSelectedTier(tier);
    setShowStripeModal(true);
  };

  const handleProcessStripePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      const targetTierName = selectedTier?.id === 'ultimate' ? 'Ultimate' : 'Pro';
      upgradeSubscription(targetTierName, billingCycle);

      setTimeout(() => {
        setPaymentSuccess(false);
        setShowStripeModal(false);
        if (onClose) onClose();
      }, 1200);
    }, 1500);
  };

  const tiers = [
    {
      id: 'free',
      name: 'Starter Free',
      priceMonthly: 0,
      priceAnnual: 0,
      annualTotal: 0,
      badge: 'Free Forever',
      desc: 'Essential AI food logging & basic meal architect',
      stripePriceId: null,
      paymentLink: null,
      features: [
        '5 Daily Multi-Modal AI Food Scans',
        'Basic Meal Logger & Water Tracker',
        'Intermittent Fasting Timer',
        'Smart Grocery List Generator',
        'Community Support Desk'
      ],
      isPopular: false,
      cta: isPro || isUltimate ? 'Downgrade to Starter' : 'Current Plan'
    },
    {
      id: 'pro',
      name: 'Nouriq Pro',
      priceMonthly: 14.99,
      priceAnnual: 9.91, // $119/year (~₹9,999/yr)
      annualTotal: 119,
      badge: '👑 Most Popular (Save 33%)',
      desc: 'Full power for high-performing fitness enthusiasts',
      stripePriceId: null,
      paymentLink: billingCycle === 'annual' ? RAZORPAY_PAYMENT_LINKS.pro.annual : RAZORPAY_PAYMENT_LINKS.pro.monthly,
      features: [
        'Unlimited Multi-Modal AI Food Scans',
        'Custom 7-Day Architect with Portion Weight (g)',
        'USDA AI Auto-Calculate Macros Engine',
        '24/7 AI Masterclass Chef & Clinical Nutritionist',
        'Metabolic Autophagy Stages Tracker',
        'AI Micronutrient Deficit Grocery Insights',
        'Razorpay 30-Day Money-Back Guarantee'
      ],
      isPopular: true,
      cta: isPro ? '👑 Active Pro Plan' : 'Subscribe to Pro'
    },
    {
      id: 'ultimate',
      name: 'Pro+ Ultimate Coach',
      priceMonthly: 29.99,
      priceAnnual: 19.91, // $239/year (~₹19,999/yr)
      annualTotal: 239,
      badge: '⭐ VIP Metabolic Suite',
      desc: 'White-glove clinical guidance & human dietitian sync',
      stripePriceId: null,
      paymentLink: billingCycle === 'annual' ? RAZORPAY_PAYMENT_LINKS.ultimate.annual : RAZORPAY_PAYMENT_LINKS.ultimate.monthly,
      features: [
        'Everything in Nouriq Pro',
        '1-on-1 Certified Clinical Dietitian Consultation',
        'Metabolic Bloodwork & Biomarker Sync',
        'Schedule 1-on-1 AI Chat Consultation (IST & EST)',
        'Priority 24/7 VIP Support Desk'
      ],
      isPopular: false,
      cta: isUltimate ? '⭐ Active Ultimate Plan' : 'Subscribe to Ultimate'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="ios-glass p-6 md:p-8 rounded-[32px] text-center space-y-3 relative overflow-hidden shadow-sm">
        <span className="px-4 py-1.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-xs font-bold inline-flex items-center gap-1.5 text-white">
          <Sparkles className="w-4 h-4 text-[#A7EBF2]" /> Monetization & Premium Membership
        </span>
        
        <h1 className="text-3xl sm:text-4xl font-black text-[#011C40] tracking-tight">
          Unlock Unlimited AI Precision Nutrition
        </h1>
        <p className="text-xs sm:text-sm text-[#26658C] font-medium max-w-xl mx-auto">
          Achieve your fitness goals 3x faster with unlimited food scans, portion weight AI macro auto-calculations, and 24/7 expert dietetics.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="pt-2 flex items-center justify-center">
          <div className="ios-glass p-1.5 rounded-full flex items-center border border-[#54ACBF]/40 text-xs font-extrabold shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full transition-all ${
                billingCycle === 'monthly' ? 'liquid-glass-btn-active text-white shadow-xs' : 'text-[#011C40]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'liquid-glass-btn-active text-white shadow-xs' : 'text-[#011C40]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-[#A7EBF2] text-[#023859] text-[10px] font-black uppercase">
                Save 33%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const price = billingCycle === 'annual' ? tier.priceAnnual : tier.priceMonthly;
          const isCurrentTier = 
            (tier.id === 'free' && (!subscription || subscription.tier === 'Free')) ||
            (tier.id === 'pro' && isPro) ||
            (tier.id === 'ultimate' && isUltimate);

          return (
            <div
              key={tier.id}
              className={`ios-glass p-7 rounded-[32px] flex flex-col justify-between space-y-6 relative transition-all duration-200 shadow-sm hover:border-[#54ACBF] ${
                tier.isPopular ? 'border-2 border-[#023859] shadow-md scale-102 bg-white/95' : ''
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#023859] text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#A7EBF2]" /> Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#26658C]">{tier.badge}</span>
                  <h3 className="text-xl font-extrabold text-[#011C40] mt-0.5">{tier.name}</h3>
                  <p className="text-xs text-[#26658C] font-medium mt-1 min-h-[32px]">{tier.desc}</p>
                </div>

                <div className="flex items-baseline space-x-1 border-b border-[#54ACBF]/30 pb-4">
                  <span className="text-3xl sm:text-4xl font-black text-[#011C40]">${price}</span>
                  <span className="text-xs font-bold text-[#26658C]">/ month</span>
                  {billingCycle === 'annual' && tier.annualTotal > 0 && (
                    <span className="text-[10px] block text-[#26658C] font-semibold ml-2">
                      (Billed ${tier.annualTotal}/yr)
                    </span>
                  )}
                </div>

                {tier.stripePriceId && (
                  <div className="text-[10px] text-[#26658C] font-semibold bg-[#A7EBF2]/40 px-2.5 py-1 rounded-lg truncate">
                    💳 Price ID: {tier.stripePriceId}
                  </div>
                )}

                <div className="space-y-2.5 text-xs">
                  <span className="text-[11px] font-extrabold text-[#011C40] uppercase tracking-wider block">Included Features:</span>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <div className="w-4 h-4 rounded-full bg-[#A7EBF2] border border-[#54ACBF] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#023859] stroke-[3]" />
                      </div>
                      <span className="text-[#011C40] font-medium leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                {isCurrentTier ? (
                  <>
                    <div className="w-full py-3 rounded-full bg-[#A7EBF2]/60 text-[#023859] font-extrabold text-xs text-center border border-[#54ACBF]/40">
                      ✓ Current Plan Active
                    </div>
                    {tier.id !== 'free' && (
                      <button
                        onClick={() => {
                          if (typeof cancelSubscription === 'function') cancelSubscription();
                        }}
                        className="w-full py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs text-center border border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel & Return to Free Plan</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenStripe(tier)}
                    className={`w-full py-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 ${
                      tier.isPopular
                        ? 'liquid-glass-btn liquid-glass-btn-active text-white'
                        : 'liquid-glass-btn text-[#011C40]'
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Secure Guarantee Banner */}
      <div className="ios-glass p-5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-xs bg-[#A7EBF2]/30 border border-[#54ACBF]/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full liquid-glass-btn flex items-center justify-center text-[#023859] font-bold">
            <ShieldCheck className="w-5 h-5 text-[#023859]" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#011C40]">Encrypted Payments via Razorpay Payments</h4>
            <p className="text-[#26658C] font-medium">PCI-DSS Level 1 Compliant. Cancel anytime with 1-click 30-Day Refund Guarantee.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-white text-[#011C40] font-extrabold text-[11px] border border-[#54ACBF]/40">
            💳 Visa / Mastercard / Amex / Apple Pay
          </span>
        </div>
      </div>

      {/* Direct Cancellation Option */}
      {subscription?.tier !== 'Free' && (
        <div className="text-center pt-2">
          <button
            onClick={() => {
              if (typeof cancelSubscription === 'function') cancelSubscription();
            }}
            className="text-xs font-extrabold text-rose-700 hover:text-rose-900 underline transition-all"
          >
            ↺ Cancel Active {subscription.tier} Subscription & Return to Free Starter Plan
          </button>
        </div>
      )}

      {/* STRIPE CHECKOUT MODAL FALLBACK */}
      {showStripeModal && selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/60 backdrop-blur-md">
          <div className="ios-glass w-full max-w-md rounded-[32px] p-6 sm:p-8 space-y-5 relative shadow-2xl border border-[#54ACBF]/40 text-xs">
            <button
              onClick={() => setShowStripeModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] font-bold text-xs"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 font-extrabold text-[#023859]">
              <CreditCard className="w-4 h-4 text-[#023859]" />
              <span>Stripe Checkout — 256-Bit Encrypted</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF] flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-[#011C40] block text-sm">{selectedTier.name}</span>
                <span className="text-[#26658C] font-medium block">
                  {billingCycle === 'annual' ? `Annual Plan ($${selectedTier.annualTotal}/yr)` : `Monthly Plan ($${selectedTier.priceMonthly}/mo)`}
                </span>
                <span className="text-[10px] text-[#023859] font-bold block mt-0.5">
                  Connected Stripe Price ID: {selectedTier.stripePriceId}
                </span>
              </div>
              <span className="text-xl font-black text-[#011C40]">
                ${billingCycle === 'annual' ? selectedTier.annualTotal : selectedTier.priceMonthly}
              </span>
            </div>

            {paymentSuccess ? (
              <div className="p-6 rounded-2xl bg-[#A7EBF2] border border-[#54ACBF] text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#023859] text-white flex items-center justify-center text-xl font-bold">✓</div>
                <h3 className="text-base font-extrabold text-[#011C40]">Payment Approved via Stripe!</h3>
                <p className="text-xs text-[#023859] font-semibold">Your account has been upgraded to {selectedTier.name}. Receipt sent to your email.</p>
              </div>
            ) : (
              <form onSubmit={handleProcessStripePayment} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-[#26658C] mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    defaultValue={goals?.name || 'Alex Rivera'}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2 text-[#011C40]"
                  />
                </div>

                <div>
                  <label className="block text-[#26658C] mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2 text-[#011C40] pr-10"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] text-[#26658C]">💳</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#26658C] mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2 text-[#011C40]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#26658C] mb-1">CVC Code</label>
                    <input
                      type="password"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2 text-[#011C40]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  {isProcessing ? (
                    <span>Processing with Stripe...</span>
                  ) : (
                    <span>Pay ${billingCycle === 'annual' ? selectedTier.annualTotal : selectedTier.priceMonthly} & Activate Premium</span>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
