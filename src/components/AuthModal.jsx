import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  User, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Inbox,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthModal({ isOpen, onClose }) {
  const nutrition = useNutrition() || {};
  const { goals = {}, setGoals = () => {}, resetToFreePlan = () => {} } = nutrition;
  const [mode, setMode] = useState('signup'); // 'signin', 'signup', or 'forgot'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Signup State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dietType, setDietType] = useState('High Protein / Lean Gain');
  const [calorieGoal, setCalorieGoal] = useState(2200);
  const [proteinGoal, setProteinGoal] = useState(160);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Google Account Chooser Modal State
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showAddGoogleInput, setShowAddGoogleInput] = useState(false);

  // Welcome Email Preview State
  const [welcomeEmailData, setWelcomeEmailData] = useState(null); // { recipientEmail, recipientName }

  const sampleGoogleAccounts = [
    {
      name: 'Alex Rivera',
      email: 'alex.rivera.fitness@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      dietType: 'High Protein / Lean Gain',
      cal: 2200
    },
    {
      name: 'Sarah Lin',
      email: 'sarah.lin.wellness@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      dietType: 'Keto & Low Carb',
      cal: 1850
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance.pro@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      dietType: 'Fat Loss Deficit',
      cal: 2000
    }
  ];

  if (!isOpen) return null;

  const triggerWelcomeEmailModal = (recipientName, recipientEmail) => {
    setWelcomeEmailData({
      recipientName,
      recipientEmail
    });
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    const userDisplayName = loginEmail ? loginEmail.split('@')[0] : 'Alex Rivera';
    const formattedName = userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1);
    
    setGoals(prev => ({
      ...prev,
      name: formattedName
    }));
    
    setIsSubmitted(true);
    confetti({ particleCount: 80, spread: 60 });
    
    setTimeout(() => {
      setIsSubmitted(false);
      triggerWelcomeEmailModal(formattedName, loginEmail || 'alex.rivera@example.com');
    }, 1000);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Enforce Starter Free Plan for new account creation
    resetToFreePlan();

    setGoals({
      name: name.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      dietType: dietType,
      dailyCalorieGoal: Number(calorieGoal),
      dailyProteinGoal: Number(proteinGoal),
      dailyCarbGoal: 200,
      dailyFatGoal: 70,
      dailyWaterGoal: 3000,
      dailyFiberGoal: 30
    });

    setIsSubmitted(true);
    confetti({ particleCount: 100, spread: 70 });

    setTimeout(() => {
      setIsSubmitted(false);
      triggerWelcomeEmailModal(name.trim(), email.trim());
    }, 1000);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (resetEmail.trim()) {
      setResetSent(true);
      confetti({ particleCount: 60, spread: 50 });
    }
  };

  const handleSelectGoogleAccount = (acc) => {
    // Enforce Starter Free Plan for new Google account creation
    resetToFreePlan();

    setGoals(prev => ({
      ...prev,
      name: acc.name,
      avatar: acc.avatar,
      dietType: acc.dietType || prev.dietType,
      dailyCalorieGoal: acc.cal || prev.dailyCalorieGoal
    }));

    setShowGooglePicker(false);
    setIsSubmitted(true);
    confetti({ particleCount: 90, spread: 60 });

    setTimeout(() => {
      setIsSubmitted(false);
      triggerWelcomeEmailModal(acc.name, acc.email);
    }, 1000);
  };

  const handleAddCustomGoogleAccount = (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;

    const nameFromEmail = customGoogleEmail.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const newAcc = {
      name: formattedName,
      email: customGoogleEmail.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    };

    handleSelectGoogleAccount(newAcc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/60 backdrop-blur-md animate-fade-in">
      
      {/* 1. GOOGLE OAUTH ACCOUNT PICKER MODAL OVERLAY */}
      {showGooglePicker ? (
        <div className="ios-glass w-full max-w-md rounded-[32px] p-6 space-y-5 relative shadow-2xl border border-[#54ACBF]/50">
          <button
            onClick={() => setShowGooglePicker(false)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] font-bold text-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 border-b border-[#54ACBF]/30 pb-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <div>
              <h3 className="font-extrabold text-sm text-[#011C40]">Choose a Google Account</h3>
              <p className="text-[10px] text-[#26658C]">to continue to Nouriq AI Coach</p>
            </div>
          </div>

          <div className="space-y-2">
            {sampleGoogleAccounts.map((acc, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectGoogleAccount(acc)}
                className="p-3 rounded-2xl border border-[#54ACBF]/30 hover:border-[#54ACBF] hover:bg-[#A7EBF2]/30 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <img src={acc.avatar} alt={acc.name} className="w-9 h-9 rounded-full object-cover border border-[#54ACBF]" />
                  <div>
                    <span className="font-extrabold text-xs text-[#011C40] block">{acc.name}</span>
                    <span className="text-[10px] text-[#26658C] block">{acc.email}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#023859]" />
              </div>
            ))}
          </div>

          {!showAddGoogleInput ? (
            <button
              onClick={() => setShowAddGoogleInput(true)}
              className="w-full py-2.5 rounded-full border border-dashed border-[#54ACBF] text-[#023859] font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#A7EBF2]/20"
            >
              <UserPlus className="w-3.5 h-3.5" /> Use another Google email address
            </button>
          ) : (
            <form onSubmit={handleAddCustomGoogleAccount} className="space-y-2 pt-1 border-t border-[#54ACBF]/30">
              <label className="block text-[10px] font-bold text-[#26658C]">Enter Google Email Address</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="flex-1 bg-white border border-[#54ACBF]/50 rounded-xl px-3 py-2 text-xs font-bold text-[#011C40] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#023859] text-white text-xs font-extrabold"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
        </div>
      ) : welcomeEmailData ? (
        /* 2. WELCOME CONFIRMATION RECEIPT MODAL */
        <div className="ios-glass w-full max-w-md rounded-[32px] p-6 sm:p-7 space-y-5 relative shadow-2xl border border-[#54ACBF]/50 text-xs text-[#011C40]">
          <div className="flex items-center space-x-2 border-b border-[#54ACBF]/40 pb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#011C40] block">🎉 Account Created (Free Starter Plan)</span>
              <span className="text-[10px] text-[#26658C]">Confirmation email dispatched to {welcomeEmailData.recipientEmail}</span>
            </div>
          </div>

          <div className="ios-glass-card p-4 rounded-2xl space-y-3 border border-[#54ACBF]/40 bg-white/90">
            <div className="border-b border-[#54ACBF]/30 pb-2 space-y-1 text-[11px]">
              <div><strong className="text-[#023859]">From:</strong> Nouriq AI Support &lt;nouriq.aisupport@gmail.com&gt;</div>
              <div><strong className="text-[#023859]">To:</strong> {welcomeEmailData.recipientName} &lt;{welcomeEmailData.recipientEmail}&gt;</div>
              <div><strong className="text-[#023859]">Plan:</strong> Free Starter Plan (5 AI Scans/day)</div>
            </div>

            <p className="text-xs leading-relaxed text-[#011C40] font-medium">
              Welcome to Nouriq AI! Your free account is active. You can upgrade to Pro or Pro+ Ultimate Coach anytime for unlimited scans, live 1-on-1 AI consultations, and bloodwork parsers.
            </p>
          </div>

          <button
            onClick={() => {
              setWelcomeEmailData(null);
              onClose();
            }}
            className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95"
          >
            🚀 Start Exploring Nouriq Free Starter Plan
          </button>
        </div>
      ) : (
        /* 3. MAIN SIGN IN / SIGN UP MODAL FORM */
        <div className="ios-glass w-full max-w-md rounded-[32px] p-6 sm:p-7 space-y-5 relative shadow-2xl border border-[#54ACBF]/50 text-xs text-[#011C40]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] font-bold text-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 rounded-full bg-[#A7EBF2] text-[#023859] text-[10px] font-black uppercase tracking-wider">
              {mode === 'signup' ? '⚡ Starter Free Account' : mode === 'signin' ? '🔐 Secure Login' : '🔑 Password Recovery'}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#011C40] tracking-tight">
              {mode === 'signup' ? 'Create Your Nouriq Account' : mode === 'signin' ? 'Welcome Back to Nouriq' : 'Reset Your Password'}
            </h2>
            <p className="text-[#26658C] text-xs mt-1 font-medium">
              {mode === 'signup' 
                ? 'Join thousands optimizing daily nutrition, glucose curves & macros.' 
                : mode === 'signin' 
                ? 'Access your saved meal logs, water goals, and AI diet plans.'
                : 'Enter your registered email to receive a secure reset link.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 rounded-full bg-[#A7EBF2]/40 border border-[#54ACBF]/40">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 rounded-full text-xs font-extrabold transition-all ${
                  mode === 'signup'
                    ? 'liquid-glass-btn liquid-glass-btn-active text-white shadow-xs'
                    : 'text-[#26658C] font-semibold'
                }`}
              >
                Sign Up (Free)
              </button>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`py-2 rounded-full text-xs font-extrabold transition-all ${
                  mode === 'signin'
                    ? 'liquid-glass-btn liquid-glass-btn-active text-white shadow-xs'
                    : 'text-[#26658C] font-semibold'
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Quick Google OAuth Sign In Button */}
          {mode !== 'forgot' && (
            <button
              type="button"
              onClick={() => setShowGooglePicker(true)}
              className="w-full py-3 rounded-full bg-white border border-[#54ACBF] text-[#011C40] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          {/* Form Content */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-[#26658C] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#26658C] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@example.com"
                  className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#26658C] font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95 mt-2 flex items-center justify-center gap-2"
              >
                <span>{isSubmitted ? 'Creating Starter Account...' : 'Create Free Starter Account'}</span>
                <ArrowRight className="w-4 h-4 text-[#A7EBF2]" />
              </button>
            </form>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-[#26658C] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="alex.rivera@example.com"
                  className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#26658C] font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-[#023859] font-bold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95 mt-2 flex items-center justify-center gap-2"
              >
                <span>{isSubmitted ? 'Logging In...' : 'Log In to Account'}</span>
                <ArrowRight className="w-4 h-4 text-[#A7EBF2]" />
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              {!resetSent ? (
                <>
                  <div>
                    <label className="block text-[#26658C] font-semibold mb-1">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="alex.rivera@example.com"
                      className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-[#A7EBF2]" />
                    <span>Send Password Reset Email</span>
                  </button>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <span className="font-extrabold text-xs text-emerald-950 block">Password Reset Link Sent!</span>
                  <p className="text-[10px] text-emerald-800 font-medium">Check your inbox ({resetEmail}) for instructions to reset your password.</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMode('signin')}
                className="w-full py-2.5 rounded-full liquid-glass-btn text-[#011C40] font-extrabold text-xs flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#023859]" />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
