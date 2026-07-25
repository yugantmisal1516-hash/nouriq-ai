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
  const { goals, setGoals } = useNutrition();
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

          <div className="text-center space-y-1">
            <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <h3 className="text-base font-extrabold text-[#011C40]">Choose a Google Account</h3>
            <p className="text-xs text-[#26658C] font-medium">to continue to <strong className="text-[#023859]">Nouriq</strong></p>
          </div>

          {/* Accounts List */}
          <div className="space-y-2 text-xs">
            {sampleGoogleAccounts.map((acc, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectGoogleAccount(acc)}
                className="w-full p-3 rounded-2xl ios-glass-card hover:bg-[#A7EBF2]/50 transition-all flex items-center justify-between border border-[#54ACBF]/30 group text-left"
              >
                <div className="flex items-center space-x-3">
                  <img src={acc.avatar} alt={acc.name} className="w-9 h-9 rounded-full object-cover border border-[#54ACBF]" />
                  <div>
                    <span className="font-extrabold text-[#011C40] block">{acc.name}</span>
                    <span className="text-[10px] text-[#26658C] font-medium">{acc.email}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#023859] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}

            {showAddGoogleInput ? (
              <form onSubmit={handleAddCustomGoogleAccount} className="pt-2 space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your google email (e.g. user@gmail.com)"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full bg-white border border-[#54ACBF]/60 rounded-xl px-3.5 py-2 text-xs font-bold text-[#011C40] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-bold"
                >
                  Log In with Google Email
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddGoogleInput(true)}
                className="w-full py-2.5 rounded-2xl liquid-glass-btn text-[#011C40] font-extrabold text-xs flex items-center justify-center gap-1.5"
              >
                <span>+ Add another Google Account</span>
              </button>
            )}
          </div>

          <p className="text-[10px] text-center text-[#26658C]">
            To continue, Google will share your name, email address, and profile picture with Nouriq.
          </p>
        </div>
      ) : welcomeEmailData ? (
        /* 2. WELCOME EMAIL NOTIFICATION & PREVIEW MODAL */
        <div className="ios-glass w-full max-w-lg rounded-[32px] p-6 sm:p-7 space-y-5 relative shadow-2xl border border-[#54ACBF]/50 text-xs text-[#011C40]">
          <div className="flex items-center justify-between border-b border-[#54ACBF]/40 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#023859] text-white flex items-center justify-center shrink-0">
                <Inbox className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-[#011C40] block">📨 Welcome Email Delivered!</span>
                <span className="text-[10px] text-[#26658C]">Sent to {welcomeEmailData.recipientEmail}</span>
              </div>
            </div>
            <button
              onClick={() => { setWelcomeEmailData(null); onClose(); }}
              className="w-8 h-8 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] font-bold text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Email Preview Container */}
          <div className="ios-glass-card p-5 rounded-2xl space-y-3 border border-[#54ACBF]/40">
            <div className="border-b border-[#54ACBF]/30 pb-2 space-y-1 text-[11px]">
              <div><strong className="text-[#023859]">From:</strong> Nouriq AI &lt;nouriq.aisupport@gmail.com&gt;</div>
              <div><strong className="text-[#023859]">To:</strong> {welcomeEmailData.recipientName} &lt;{welcomeEmailData.recipientEmail}&gt;</div>
              <div><strong className="text-[#023859]">Subject:</strong> 🚀 Welcome to Nouriq — Your AI Nutrition & Wellness Coach!</div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-[#011C40] font-medium">
              <p>Hello <strong className="text-[#023859]">{welcomeEmailData.recipientName}</strong>,</p>
              <p>Welcome aboard! 🌟 Thank you for signing up for <strong>Nouriq</strong> — your AI-powered multi-modal nutrition and wellness companion.</p>
              
              <div className="p-3 rounded-xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 space-y-1">
                <span className="font-extrabold text-[#023859] block flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#023859]" /> 5 Free Daily AI Food Scans Activated!
                </span>
                <p className="text-[11px] text-[#26658C]">You can now snap any meal photo to auto-calculate calories, macro ratios, and Nutri-Scores with zero margin of error.</p>
              </div>

              <p>If you ever have any questions or need medical diet support, email our team anytime at <strong>nouriq.aisupport@gmail.com</strong>.</p>
              <p className="font-extrabold text-[#023859]">To health & high performance,<br />The Nouriq AI Engineering Team</p>
            </div>
          </div>

          <button
            onClick={() => { setWelcomeEmailData(null); onClose(); }}
            className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#A7EBF2]" />
            <span>Open Nouriq Dashboard</span>
          </button>
        </div>
      ) : (
        /* MAIN AUTH MODAL */
        <div className="ios-glass w-full max-w-lg rounded-[32px] p-6 sm:p-8 space-y-5 relative shadow-2xl border border-[#54ACBF]/40">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] hover:text-[#011C40] transition-all font-bold text-xs"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Brand Header */}
          <div className="text-center space-y-1">
            <img 
              src="/nouriq_logo.jpg" 
              alt="Nouriq Logo" 
              className="w-14 h-14 mx-auto rounded-full object-cover border-2 border-[#54ACBF] shadow-md" 
            />
            <h2 className="text-xl font-extrabold text-[#011C40] tracking-tight">
              Welcome to <span className="text-[#26658C]">Nouriq</span>
            </h2>
            <p className="text-xs text-[#26658C] font-medium">
              Your AI Nutrition & Wellness Coach
            </p>
          </div>

          {/* Mode Selector */}
          {mode !== 'forgot' && (
            <div className="ios-glass p-1.5 rounded-full flex items-center justify-between border border-[#54ACBF]/30 text-xs font-bold">
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-full transition-all text-center ${
                  mode === 'signup' ? 'liquid-glass-btn-active text-white shadow-xs' : 'text-[#011C40] hover:text-[#023859]'
                }`}
              >
                Create New Account
              </button>
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 rounded-full transition-all text-center ${
                  mode === 'signin' ? 'liquid-glass-btn-active text-white shadow-xs' : 'text-[#011C40] hover:text-[#023859]'
                }`}
              >
                Log In Existing User
              </button>
            </div>
          )}

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-[#A7EBF2]/50 border border-[#54ACBF] text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#023859] mx-auto animate-bounce" />
              <h3 className="text-base font-extrabold text-[#011C40]">Account Authenticated!</h3>
              <p className="text-xs text-[#26658C] font-medium">
                Welcome, <strong className="text-[#011C40]">{goals.name}</strong>. Sending welcome email & loading dashboard...
              </p>
            </div>
          ) : mode === 'forgot' ? (
            /* FORGOT PASSWORD FORM */
            <div className="space-y-4 text-xs">
              <button
                onClick={() => { setMode('signin'); setResetSent(false); }}
                className="flex items-center gap-1 text-[#26658C] hover:text-[#011C40] font-extrabold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
              </button>

              <div className="text-center space-y-1">
                <KeyRound className="w-8 h-8 text-[#023859] mx-auto" />
                <h3 className="text-sm font-extrabold text-[#011C40]">Reset Your Password</h3>
                <p className="text-xs text-[#26658C]">Enter your registered email address and we'll send you a password reset link.</p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-2xl bg-[#A7EBF2]/50 border border-[#54ACBF] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#023859] mx-auto" />
                  <strong className="text-[#011C40] block font-extrabold">Reset Link Sent!</strong>
                  <p className="text-xs text-[#26658C]">
                    We sent a password reset link to <strong className="text-[#011C40]">{resetEmail}</strong>. Please check your inbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[#26658C] mb-1 font-semibold">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#26658C] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-white border border-[#54ACBF]/50 rounded-2xl pl-10 pr-4 py-2.5 text-[#011C40] font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </form>
              )}
            </div>
          ) : mode === 'signup' ? (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#26658C] mb-1 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#26658C] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-2xl pl-10 pr-4 py-2.5 text-[#011C40] font-bold focus:outline-none placeholder:text-[#26658C]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#26658C] mb-1 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#26658C] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-2xl pl-10 pr-4 py-2.5 text-[#011C40] font-bold focus:outline-none placeholder:text-[#26658C]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#26658C] mb-1 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#26658C] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-2xl pl-10 pr-4 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#26658C] mb-1 font-semibold">Fitness Protocol</label>
                  <select
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-2xl px-3 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  >
                    <option value="High Protein / Lean Gain">High Protein / Lean Muscle</option>
                    <option value="Keto & Low Carb">Keto / Low Carb</option>
                    <option value="Fat Loss Deficit">Fat Loss / Calorie Deficit</option>
                    <option value="Intermittent Fasting 16:8">Intermittent Fasting 16:8</option>
                    <option value="Mediterranean Clean">Mediterranean Clean</option>
                    <option value="Vegan Plant Power">Vegan Plant Power</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#26658C] mb-1 font-semibold">Daily Target (kcal)</label>
                  <input
                    type="number"
                    value={calorieGoal}
                    onChange={(e) => setCalorieGoal(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-2xl px-3 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <span>Create Account & Send Welcome Email</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>
          ) : (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#26658C] mb-1 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#26658C] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-2xl pl-10 pr-4 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#26658C] mb-1 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#26658C] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-2xl pl-10 pr-4 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[#26658C] font-semibold text-[11px]">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#023859]" />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="hover:underline text-[#023859] font-extrabold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Log In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              {/* Social Logins: Google Account Chooser & Twitter */}
              <div className="pt-3 border-t border-[#54ACBF]/30 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-[#26658C] block text-center">
                  Or Continue With Social Single Sign-On
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGooglePicker(true)}
                    className="py-2.5 px-3 rounded-2xl liquid-glass-btn text-[#011C40] text-[11px] font-extrabold flex items-center justify-center gap-2 shadow-xs active:scale-95"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google Log In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount({ name: 'Alex Rivera (X)', email: 'alex.rivera@x.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' })}
                    className="py-2.5 px-3 rounded-2xl liquid-glass-btn text-[#011C40] text-[11px] font-extrabold flex items-center justify-center gap-2 shadow-xs active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 fill-[#011C40]" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>X / Twitter</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#26658C] font-semibold pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#023859]" />
            <span>256-bit TLS Encrypted Account Security</span>
          </div>

        </div>
      )}
    </div>
  );
}
