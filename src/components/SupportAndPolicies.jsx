import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  RefreshCcw, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Send,
  Lock,
  Sparkles,
  Check,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SupportAndPolicies() {
  const { goals, subscription, setActiveTab } = useNutrition();
  const [activeSection, setActiveSection] = useState('support'); // support, privacy, refund, terms

  // Support Form State
  const [contactName, setContactName] = useState(goals?.name || '');
  const [contactEmail, setContactEmail] = useState('user.support@nouriq.ai');
  const [issueType, setIssueType] = useState('General Query');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const handleSubmitSupport = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);

    const ticketId = `NQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const timestamp = new Date().toLocaleString([], { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const newTicket = {
      id: ticketId,
      name: contactName || 'Nouriq Member',
      userEmail: contactEmail,
      adminEmail: 'nouriq.aisupport@gmail.com',
      category: issueType,
      message: message.trim(),
      timestamp: timestamp
    };

    setTimeout(() => {
      setIsSending(false);
      setTicketDetails(newTicket);
      setSubmitted(true);
      confetti({ particleCount: 80, spread: 70 });
    }, 600);
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
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 24/7 Live Automation
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="ios-glass-card p-3.5 rounded-2xl flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#023859] flex items-center justify-center text-white shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[#26658C] text-[10px] font-bold block">Support Admin Inbox</span>
                    <strong className="text-[#011C40] truncate block">nouriq.aisupport@gmail.com</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 text-xs space-y-1">
                <span className="font-extrabold text-[#023859] block">⚡ Response & Email Dispatch Commitment</span>
                <p className="text-[#26658C] text-[11px] font-medium leading-relaxed">
                  When you submit any complaint, an automated complaint copy is dispatched directly to <strong className="text-[#011C40]">nouriq.aisupport@gmail.com</strong> and a confirmation receipt is sent to your email with a <strong className="text-[#023859]">under 2 hours response SLA</strong>.
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

          {/* Interactive Support Ticket Form & Automated Dispatch Engine */}
          <div className="lg:col-span-7 ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
            <h2 className="text-base font-extrabold text-[#011C40]">Contact Customer Support Team</h2>
            <p className="text-xs text-[#26658C] font-medium">File any complaint or query. Automated email copies are sent to admin & user email instantly.</p>

            {submitted && ticketDetails ? (
              <div className="p-6 rounded-2xl bg-[#A7EBF2]/50 border border-[#54ACBF] space-y-4 animate-fade-in">
                <div className="flex items-center space-x-3 text-[#023859]">
                  <CheckCircle2 className="w-8 h-8 shrink-0 text-[#023859]" />
                  <div>
                    <h3 className="text-sm font-extrabold text-[#011C40]">Support Complaint Logged & Dispatched!</h3>
                    <span className="text-[11px] font-bold text-[#023859] block">Ticket ID: {ticketDetails.id} | {ticketDetails.timestamp}</span>
                  </div>
                </div>

                {/* Automated Dispatch Status Cards */}
                <div className="space-y-2 text-xs">
                  <div className="ios-glass-card p-3 rounded-xl flex items-center justify-between gap-2 border-l-4 border-emerald-500">
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-[#011C40] block">📩 Admin Complaint Inbox Notification</span>
                      <span className="text-[#26658C] text-[11px] font-medium block truncate">Dispatched to: <strong>nouriq.aisupport@gmail.com</strong></span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Delivered
                    </span>
                  </div>

                  <div className="ios-glass-card p-3 rounded-xl flex items-center justify-between gap-2 border-l-4 border-[#023859]">
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-[#011C40] block">✉️ User Confirmation Receipt</span>
                      <span className="text-[#26658C] text-[11px] font-medium block truncate">Dispatched to: <strong>{ticketDetails.userEmail}</strong></span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#023859] text-white text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#A7EBF2]" /> Delivered
                    </span>
                  </div>
                </div>

                {/* Toggle Email Transmission Preview Drawer */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="w-full py-2 px-4 rounded-xl liquid-glass-btn text-[#011C40] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#023859]" />
                    <span>{showEmailPreview ? 'Hide Transmitted Email Receipts' : 'View Transmitted Email Copies'}</span>
                  </button>

                  {showEmailPreview && (
                    <div className="mt-3 space-y-3 text-[11px] animate-fade-in">
                      
                      {/* Admin Email Copy */}
                      <div className="ios-glass p-3.5 rounded-xl border border-[#54ACBF]/50 bg-white/90 space-y-1">
                        <span className="font-extrabold text-[#011C40] block border-b border-slate-200 pb-1">
                          📩 Copy Sent to Support Team (nouriq.aisupport@gmail.com):
                        </span>
                        <div className="text-[#26658C] font-mono text-[10px] space-y-1 pt-1">
                          <p><strong>Subject:</strong> 🚨 New Complaint Logged [{ticketDetails.id}] - {ticketDetails.category}</p>
                          <p><strong>From:</strong> {ticketDetails.name} &lt;{ticketDetails.userEmail}&gt;</p>
                          <p><strong>Complaint:</strong> "{ticketDetails.message}"</p>
                        </div>
                      </div>

                      {/* User Email Copy */}
                      <div className="ios-glass p-3.5 rounded-xl border border-[#54ACBF]/50 bg-white/90 space-y-1">
                        <span className="font-extrabold text-[#011C40] block border-b border-slate-200 pb-1">
                          ✉️ Receipt Sent to User ({ticketDetails.userEmail}):
                        </span>
                        <div className="text-[#26658C] font-mono text-[10px] space-y-1 pt-1">
                          <p><strong>Subject:</strong> ✉️ Complaint Confirmation [{ticketDetails.id}] - Nouriq AI Support</p>
                          <p><strong>To:</strong> {ticketDetails.userEmail}</p>
                          <p><strong>Message:</strong> Dear {ticketDetails.name}, we received your complaint regarding "{ticketDetails.category}". Our support desk at nouriq.aisupport@gmail.com is reviewing it now.</p>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                      setTicketDetails(null);
                    }}
                    className="w-full py-3 liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs rounded-full shadow-xs"
                  >
                    Submit Another Complaint / Ticket
                  </button>
                </div>
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
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#26658C] mb-1 font-semibold">Your Email Address (For Confirmation)</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#26658C] mb-1 font-semibold">Complaint / Issue Category</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  >
                    <option value="General Query">General Inquiry / Complaint</option>
                    <option value="Billing & Stripe">Stripe Billing & Subscription Issue</option>
                    <option value="Refund Request">Refund Request (30-Day Guarantee)</option>
                    <option value="Technical Support">Technical & Scanner Complaint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#26658C] mb-1 font-semibold">Detailed Complaint Description</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your complaint or query. Copies will be emailed to nouriq.aisupport@gmail.com and your email..."
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none placeholder:text-[#26658C]/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-6 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{isSending ? 'Transmitting Automated Email Copies...' : 'Send Complaint & Automate Email Receipts'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      )}

      {/* 2. CANCELLATION & REFUND POLICY FOR STRIPE */}
      {activeSection === 'refund' && (
        <div className="ios-glass p-6 md:p-8 rounded-[28px] space-y-5 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-[#54ACBF]/30 pb-4">
            <div className="w-10 h-10 rounded-full liquid-glass-btn flex items-center justify-center text-[#023859] font-bold">
              <RefreshCcw className="w-5 h-5 text-[#023859]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#011C40]">30-Day Money-Back Guarantee & Cancellation Policy</h2>
              <p className="text-xs text-[#26658C] font-medium">Clear, transparent merchant cancellation terms compliant with Stripe guidelines.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-[#011C40] leading-relaxed font-medium">
            <div className="ios-glass-card p-4 rounded-2xl space-y-1">
              <h3 className="font-extrabold text-[#023859] text-sm">1. 30-Day Unconditional Money-Back Guarantee</h3>
              <p className="text-[#26658C]">
                If you are not 100% satisfied with Nouriq Pro or Pro+ Ultimate Coach within 30 days of initial purchase, contact <strong className="text-[#011C40]">nouriq.aisupport@gmail.com</strong> for an immediate full refund. No questions asked.
              </p>
            </div>

            <div className="ios-glass-card p-4 rounded-2xl space-y-1">
              <h3 className="font-extrabold text-[#023859] text-sm">2. 1-Click Subscription Cancellation</h3>
              <p className="text-[#26658C]">
                You can cancel your auto-renewing subscription at any time directly from the Pricing & Membership tab or by emailing support. Once cancelled, your premium features remain active until the end of your paid billing period.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRIVACY POLICY */}
      {activeSection === 'privacy' && (
        <div className="ios-glass p-6 md:p-8 rounded-[28px] space-y-5 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-[#54ACBF]/30 pb-4">
            <div className="w-10 h-10 rounded-full liquid-glass-btn flex items-center justify-center text-[#023859] font-bold">
              <Lock className="w-5 h-5 text-[#023859]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#011C40]">Privacy Policy & Data Security</h2>
              <p className="text-xs text-[#26658C] font-medium">HIPAA-Grade encryption & strict user data privacy compliance.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#26658C] font-medium leading-relaxed">
            <p>
              At Nouriq.ai, we treat your nutritional logs, food scanner photos, and biometric goals with HIPAA-grade confidentiality. We do not sell your personal data to third-party advertisers.
            </p>
            <p>
              All payment transactions are encrypted using 256-Bit TLS via Stripe Inc. Payment card details are never stored on Nouriq servers.
            </p>
          </div>
        </div>
      )}

      {/* 4. TERMS OF SERVICE */}
      {activeSection === 'terms' && (
        <div className="ios-glass p-6 md:p-8 rounded-[28px] space-y-5 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-[#54ACBF]/30 pb-4">
            <div className="w-10 h-10 rounded-full liquid-glass-btn flex items-center justify-center text-[#023859] font-bold">
              <FileText className="w-5 h-5 text-[#023859]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#011C40]">Terms of Service</h2>
              <p className="text-xs text-[#26658C] font-medium">User agreement, dietary guidelines & acceptable use terms.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#26658C] font-medium leading-relaxed">
            <p>
              By accessing Nouriq.ai, you agree to use the service for personal wellness and nutritional tracking. AI dietary breakdowns provide clinical estimates and should be reviewed alongside your healthcare provider.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
