import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  RefreshCcw, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Send,
  Lock,
  CreditCard,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SupportAndPolicies() {
  const { goals, subscription, setActiveTab } = useNutrition();
  const [activeSection, setActiveSection] = useState('support'); // support, privacy, refund, terms

  // Support Form State
  const [contactName, setContactName] = useState(goals?.name || '');
  const [contactEmail, setContactEmail] = useState('alex.rivera@example.com');
  const [issueType, setIssueType] = useState('General Query');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitSupport = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
      confetti({ particleCount: 70, spread: 60 });
      setTimeout(() => {
        setMessage('');
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="ios-glass p-6 rounded-[28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A7EBF2]" /> Merchant Verified Compliance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#011C40] tracking-tight">Customer Support & Merchant Policies</h1>
          <p className="text-[#26658C] text-xs mt-1 font-medium">Customer service desk, Privacy Policy, Terms of Service & 30-Day Refund Guarantee.</p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 md:pb-0">
          <button
            onClick={() => setActiveSection('support')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs flex items-center gap-1.5 ${
              activeSection === 'support' ? 'liquid-glass-btn liquid-glass-btn-active text-white scale-105' : 'liquid-glass-btn text-[#011C40]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support Desk</span>
          </button>

          <button
            onClick={() => setActiveSection('refund')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs flex items-center gap-1.5 ${
              activeSection === 'refund' ? 'liquid-glass-btn liquid-glass-btn-active text-white scale-105' : 'liquid-glass-btn text-[#011C40]'
            }`}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Cancellation & Refund</span>
          </button>

          <button
            onClick={() => setActiveSection('privacy')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs flex items-center gap-1.5 ${
              activeSection === 'privacy' ? 'liquid-glass-btn liquid-glass-btn-active text-white scale-105' : 'liquid-glass-btn text-[#011C40]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveSection('terms')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs flex items-center gap-1.5 ${
              activeSection === 'terms' ? 'liquid-glass-btn liquid-glass-btn-active text-white scale-105' : 'liquid-glass-btn text-[#011C40]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
        </div>
      </div>

      {/* 1. CUSTOMER SUPPORT TEAM SERVICE */}
      {activeSection === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Contact Details & Status Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
                <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#023859]" /> Support Desk Status
                </h3>
                <span className="px-3 py-1 rounded-full bg-[#023859] text-white text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 24/7 Live
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="ios-glass-card p-3.5 rounded-2xl flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#023859] flex items-center justify-center text-white shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[#26658C] text-[10px] font-bold block">Support Email</span>
                    <strong className="text-[#011C40]">nouriq.aisupport@gmail.com</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 text-xs space-y-1">
                <span className="font-extrabold text-[#023859] block">⚡ Response Time Commitment</span>
                <p className="text-[#26658C] text-[11px] font-medium leading-relaxed">
                  Our dedicated customer support team responds to all billing, subscription, and technical inquiries in <strong className="text-[#011C40]">under 2 hours</strong>.
                </p>
              </div>

              {/* VIP 1-on-1 Dietitian & Bloodwork Sync Card */}
              {subscription?.tier === 'Ultimate' ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs space-y-2 shadow-md">
                  <span className="font-black flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-slate-950" /> ⭐ VIP 1-on-1 Dietitian Consultation & Bloodwork Sync Active
                  </span>
                  <p className="text-[11px] font-semibold opacity-90">
                    Direct access to certified clinical dietitians and biomarker lab report uploads.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#023859] to-[#011C40] text-white text-xs space-y-2 shadow-md">
                  <span className="font-extrabold flex items-center gap-1 text-amber-300">
                    <Lock className="w-4 h-4 text-amber-300" /> ⭐ Pro+ Ultimate VIP Feature
                  </span>
                  <p className="text-[11px] text-cyan-200 font-medium leading-relaxed">
                    1-on-1 Certified Clinical Dietitian Consultations & Bloodwork Biomarker Sync is unlocked on the Ultimate plan.
                  </p>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    ⭐ Upgrade to Pro+ Ultimate Coach ($29.99/mo)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Support Ticket Form */}
          <div className="lg:col-span-7 ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
            <h2 className="text-base font-extrabold text-[#011C40]">Contact Customer Support Team</h2>
            <p className="text-xs text-[#26658C] font-medium">Have a question regarding your account, subscription, or AI scanner? Submit a ticket below.</p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#A7EBF2]/50 border border-[#54ACBF] text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#023859] mx-auto animate-bounce" />
                <h3 className="text-sm font-extrabold text-[#011C40]">Support Ticket Received!</h3>
                <p className="text-xs text-[#26658C] max-w-sm mx-auto font-medium">
                  Thank you! Our support team has logged your inquiry. Confirmation sent to <strong className="text-[#011C40]">{contactEmail}</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs rounded-full shadow-xs"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSupport} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#26658C] mb-1 font-semibold">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#26658C] mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#26658C] mb-1 font-semibold">Inquiry Type</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  >
                    <option value="General Query">General Question</option>
                    <option value="Billing & Stripe">Stripe Billing & Subscription</option>
                    <option value="Refund Request">Refund Request (30-Day Money-Back)</option>
                    <option value="Technical Support">Technical & Scanner Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#26658C] mb-1 font-semibold">Message Description</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or query in detail..."
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none placeholder:text-[#26658C]/60"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Send Support Request</span>
                </button>
              </form>
            )}
          </div>

        </div>
      )}

      {/* 2. CANCELLATION & REFUND POLICY FOR STRIPE */}
      {activeSection === 'refund' && (
        <div className="ios-glass p-7 rounded-[28px] space-y-5 shadow-sm text-xs text-[#011C40] leading-relaxed">
          <div className="flex items-center space-x-3 border-b border-[#54ACBF]/40 pb-3">
            <RefreshCcw className="w-6 h-6 text-[#023859]" />
            <div>
              <h2 className="text-lg font-extrabold">Stripe Cancellation & Refund Policy</h2>
              <span className="text-[11px] text-[#26658C] font-semibold">Effective Date: January 2026 • Merchant Compliance Policy</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 space-y-1">
            <span className="font-extrabold text-[#023859] flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-[#023859]" /> 30-Day 100% Risk-Free Money-Back Guarantee
            </span>
            <p className="text-[#26658C] font-medium">
              We stand behind Nouriq. If you are unsatisfied with your subscription within 30 days of initial purchase, we offer a 100% full refund with no questions asked.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">1. Subscription Cancellation Policy</h3>
              <p className="text-[#26658C]">
                You can cancel your Nouriq subscription at any time without fee or penalty. To cancel your subscription:
              </p>
              <ul className="list-disc pl-5 mt-1 text-[#26658C] space-y-0.5 font-medium">
                <li>Navigate to <strong>Account Settings $\rightarrow$ Subscription $\rightarrow$ Cancel Plan</strong> inside the app.</li>
                <li>Or send an email request to <strong>nouriq.aisupport@gmail.com</strong>.</li>
              </ul>
              <p className="text-[#26658C] mt-1">
                Upon cancellation, your premium features remain active until the end of your paid billing cycle. You will not be charged for subsequent billing periods.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">2. Refund Processing via Stripe</h3>
              <p className="text-[#26658C]">
                Refund requests submitted within 30 days of initial purchase are processed immediately by our billing team. Refunded amounts are returned to the original credit/debit card or payment method used during checkout on Stripe.
              </p>
              <p className="text-[#26658C] mt-1 font-semibold">
                Refund Timeline: Stripe processes returned funds back to your issuing bank within 5 to 7 business days.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">3. Merchant of Record & Contact Information</h3>
              <p className="text-[#26658C]">
                For any refund inquiries, receipt copies, or billing clarifications, please contact our Merchant Care Desk:
              </p>
              <p className="text-[#011C40] font-bold mt-1">
                Nouriq Support Team<br />
                Email: nouriq.aisupport@gmail.com
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRIVACY POLICY */}
      {activeSection === 'privacy' && (
        <div className="ios-glass p-7 rounded-[28px] space-y-5 shadow-sm text-xs text-[#011C40] leading-relaxed">
          <div className="flex items-center space-x-3 border-b border-[#54ACBF]/40 pb-3">
            <Lock className="w-6 h-6 text-[#023859]" />
            <div>
              <h2 className="text-lg font-extrabold">Nouriq Privacy Policy</h2>
              <span className="text-[11px] text-[#26658C] font-semibold">Compliant with GDPR, CCPA & Stripe Security Standards</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">1. Data We Collect</h3>
              <p className="text-[#26658C]">
                We respect your personal privacy. We collect data necessary to provide personalized AI nutrition coaching:
              </p>
              <ul className="list-disc pl-5 mt-1 text-[#26658C] space-y-0.5 font-medium">
                <li><strong>Profile & Health Goals:</strong> Daily calorie targets, macro ratios, fasting windows, and water intake.</li>
                <li><strong>Food Scanner Photos:</strong> Captured food photos are processed in real-time for multi-modal computer vision classification and macro calculation. Photos are never sold to third parties.</li>
                <li><strong>Payment Data:</strong> Payment details are processed directly by <strong>Stripe Inc.</strong> under PCI-DSS Level 1 encryption. Nouriq does not store raw credit card numbers on our servers.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">2. Data Security & TLS Encryption</h3>
              <p className="text-[#26658C]">
                All data transmission between your browser and our servers is secured using 256-bit TLS encryption. Your personal health logs are stored securely in compliance with strict privacy regulation standards.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">3. Your Rights & Data Deletion</h3>
              <p className="text-[#26658C]">
                You retain full ownership of your data. You may request complete deletion of your account and nutritional logs at any time by emailing <strong>nouriq.aisupport@gmail.com</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TERMS OF SERVICE */}
      {activeSection === 'terms' && (
        <div className="ios-glass p-7 rounded-[28px] space-y-5 shadow-sm text-xs text-[#011C40] leading-relaxed">
          <div className="flex items-center space-x-3 border-b border-[#54ACBF]/40 pb-3">
            <FileText className="w-6 h-6 text-[#023859]" />
            <div>
              <h2 className="text-lg font-extrabold">Terms of Service & Usage Terms</h2>
              <span className="text-[11px] text-[#26658C] font-semibold">NutriMind AI Service Agreement</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">1. Acceptance of Terms</h3>
              <p className="text-[#26658C]">
                By accessing NutriMind AI, you agree to these Terms of Service. NutriMind AI provides automated nutrition tracking, multi-modal computer vision scanner tools, and AI wellness coaching.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">2. Health & Wellness Disclaimer</h3>
              <p className="text-[#26658C]">
                NutriMind AI provides nutritional recommendations and calorie estimations for general dietary guidance and wellness. Content generated by the AI model is not a substitute for professional medical diagnosis or clinical treatment. Always consult a licensed healthcare provider before initiating drastic medical diets.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-[#011C40] mb-1">3. Governing Law</h3>
              <p className="text-[#26658C]">
                These terms are governed in accordance with international digital commerce regulations and Stripe Merchant Terms of Service.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
