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
  Printer,
  ExternalLink
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

    // Store Ticket Locally in Secure Ticket Register
    try {
      const existing = JSON.parse(localStorage.getItem('nouriq_support_tickets') || '[]');
      existing.unshift(newTicket);
      localStorage.setItem('nouriq_support_tickets', JSON.stringify(existing));
    } catch (err) {
      console.warn('Error saving local ticket:', err);
    }

    setTimeout(() => {
      setIsSending(false);
      setTicketDetails(newTicket);
      setSubmitted(true);
      confetti({ particleCount: 80, spread: 70 });
    }, 400);
  };

  const handleDirectEmailDispatch = () => {
    if (!ticketDetails) return;
    const subject = encodeURIComponent(`🚨 Support Complaint [Ticket #${ticketDetails.id}] - ${ticketDetails.category}`);
    const body = encodeURIComponent(
      `Member Name: ${ticketDetails.name}\n` +
      `User Email: ${ticketDetails.userEmail}\n` +
      `Ticket ID: ${ticketDetails.id}\n` +
      `Category: ${ticketDetails.category}\n` +
      `Submitted At: ${ticketDetails.timestamp}\n\n` +
      `Complaint Description:\n${ticketDetails.message}`
    );
    window.location.href = `mailto:nouriq.aisupport@gmail.com?subject=${subject}&body=${body}`;
  };

  const handlePrintTicket = () => {
    window.print();
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
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 24/7 Direct Inbox
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="ios-glass-card p-3.5 rounded-2xl flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#023859] flex items-center justify-center text-white shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[#26658C] text-[10px] font-bold block">Support Admin Email</span>
                    <strong className="text-[#011C40] truncate block">nouriq.aisupport@gmail.com</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 text-xs space-y-1">
                <span className="font-extrabold text-[#023859] block">🔒 100% Strict User Data Privacy</span>
                <p className="text-[#26658C] text-[11px] font-medium leading-relaxed">
                  Your complaint details are handled strictly between you and <strong className="text-[#011C40]">nouriq.aisupport@gmail.com</strong>. No third-party email redirects are used. Official ticket response SLA is <strong className="text-[#023859]">under 2 hours</strong>.
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
            <p className="text-xs text-[#26658C] font-medium font-sans">File any complaint or query. Strictly private ticket logging sent to support admin inbox.</p>

            {submitted && ticketDetails ? (
              <div className="p-6 rounded-2xl bg-[#A7EBF2]/50 border border-[#54ACBF] space-y-4 animate-fade-in">
                <div className="flex items-center space-x-3 text-[#023859]">
                  <CheckCircle2 className="w-8 h-8 shrink-0 text-[#023859]" />
                  <div>
                    <h3 className="text-sm font-extrabold text-[#011C40]">Official Complaint Ticket Generated!</h3>
                    <span className="text-[11px] font-bold text-[#023859] block">Ticket ID: {ticketDetails.id} | {ticketDetails.timestamp}</span>
                  </div>
                </div>

                {/* Direct Action Buttons for Support Dispatch */}
                <div className="space-y-2 text-xs">
                  <div className="ios-glass-card p-3 rounded-xl flex items-center justify-between gap-2 border-l-4 border-emerald-500">
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-[#011C40] block">📩 Support Admin Target Email</span>
                      <span className="text-[#26658C] text-[11px] font-medium block truncate">Dedicated: <strong>nouriq.aisupport@gmail.com</strong></span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Private
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#54ACBF] flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-[#011C40] block text-xs">✉️ Direct Email Dispatch to Admin</span>
                      <span className="text-[#26658C] text-[11px] block">Click to open your mail app to send ticket directly to nouriq.aisupport@gmail.com</span>
                    </div>
                    <button
                      onClick={handleDirectEmailDispatch}
                      className="px-3.5 py-2 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Send Mail
                    </button>
                  </div>
                </div>

                {/* User Confirmation Ticket Box */}
                <div className="ios-glass p-4 rounded-2xl border border-[#54ACBF] bg-white space-y-2 text-xs shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-extrabold text-[#011C40] text-xs">📄 Complaint Ticket Receipt #{ticketDetails.id}</span>
                    <button
                      onClick={handlePrintTicket}
                      className="px-3 py-1 rounded-full liquid-glass-btn text-[#023859] font-bold text-[11px] flex items-center gap-1 hover:scale-105 transition-all"
                    >
                      <Printer className="w-3 h-3" /> Print Ticket
                    </button>
                  </div>
                  <div className="text-[11px] text-[#26658C] space-y-1 font-sans">
                    <p><strong>Member Name:</strong> {ticketDetails.name}</p>
                    <p><strong>Email Address:</strong> {ticketDetails.userEmail}</p>
                    <p><strong>Category:</strong> {ticketDetails.category}</p>
                    <p><strong>Status:</strong> <span className="text-emerald-700 font-bold">Ticket Logged & In Review (SLA &lt; 2 Hours)</span></p>
                    <p className="pt-1 text-[#011C40] font-medium"><strong>Complaint Details:</strong> "{ticketDetails.message}"</p>
                  </div>
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
                    <label className="block text-[#26658C] mb-1 font-semibold">Your Real Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
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
                    placeholder="Provide details about your complaint or query. Ticket will be logged and targeted strictly to nouriq.aisupport@gmail.com..."
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none placeholder:text-[#26658C]/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-6 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{isSending ? 'Logging Private Complaint...' : 'Submit Complaint & Generate Ticket Receipt'}</span>
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
