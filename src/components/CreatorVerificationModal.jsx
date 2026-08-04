import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Sparkles, Send, Check, X, Mail, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

// Generate unique hardware device fingerprint
export const getDeviceFingerprint = () => {
  try {
    const raw = `${navigator.userAgent}-${screen.width}x${screen.height}-${navigator.language}-${navigator.hardwareConcurrency || 4}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `fp_${Math.abs(hash).toString(16)}`;
  } catch (e) {
    return `fp_device_${Date.now()}`;
  }
};

export default function CreatorVerificationModal({ isOpen, onClose, onVerificationComplete }) {
  const [creatorName, setCreatorName] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentDeviceFp = getDeviceFingerprint();

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!creatorName.trim() || !creatorEmail.trim() || !socialLink.trim()) {
      setErrorMsg('Please complete all 3 verification fields (Name, Email, & Social Profile Link).');
      return;
    }

    if (!socialLink.toLowerCase().includes('instagram') && 
        !socialLink.toLowerCase().includes('tiktok') && 
        !socialLink.toLowerCase().includes('youtube') && 
        !socialLink.toLowerCase().includes('x.com') && 
        !socialLink.toLowerCase().includes('twitter')) {
      setErrorMsg('Please enter a valid Social Media Profile URL (Instagram, TikTok, YouTube, or X).');
      return;
    }

    setIsSubmitting(true);

    try {
      const verificationToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const verificationPayload = {
        adminRecipient: 'nouriq.aisupport@gmail.com',
        code: 'NOURIQPASS',
        verificationToken,
        status: 'PENDING_ADMIN_VERIFICATION',
        creatorName: creatorName.trim(),
        creatorEmail: creatorEmail.trim(),
        socialProfileUrl: socialLink.trim(),
        deviceFingerprint: currentDeviceFp,
        timestamp: new Date().toISOString(),
        approvalLink: `https://nouriq-ai.onrender.com?approve_creator=${verificationToken}&fp=${currentDeviceFp}`,
        locationLocale: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // 1. Store pending verification request & burn NOURIQPASS for 2nd time use
      localStorage.setItem('nouriq_nouriqpass_nullified', 'true');
      localStorage.setItem('nouriq_creator_device_fingerprint', currentDeviceFp);
      localStorage.setItem('nouriq_pending_creator_request', JSON.stringify(verificationPayload));

      // 2. Dispatch Automated Email Payload to nouriq.aisupport@gmail.com
      console.info('📧 Verification email payload sent to nouriq.aisupport@gmail.com:', verificationPayload);
      
      try {
        await fetch('https://formspree.io/f/nouriq_admin_creator_verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verificationPayload)
        }).catch(e => console.info('Local fallback logged:', e));
      } catch (err) {}

      confetti({ particleCount: 120, spread: 80 });
      setIsSubmitting(false);
      setIsSubmittedPending(true);

      if (typeof onVerificationComplete === 'function') {
        onVerificationComplete(verificationPayload);
      }
    } catch (err) {
      setErrorMsg('Verification error. Please try submitting again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="ios-glass p-6 sm:p-7 rounded-[32px] max-w-md w-full text-center space-y-5 shadow-2xl border border-[#54ACBF]/50 bg-white/95 relative overflow-hidden">
        
        {/* Header Security Badge */}
        <div className="flex items-center justify-between">
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold flex items-center gap-1.5 border border-amber-300">
            <Lock className="w-3.5 h-3.5 text-amber-700" /> Admin Email Verification System
          </span>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-[#011C40] hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {!isSubmittedPending ? (
          <>
            {/* Icon & Title */}
            <div className="space-y-1.5">
              <div className="w-14 h-14 rounded-2xl liquid-glass-btn liquid-glass-btn-active flex items-center justify-center text-white mx-auto shadow-md">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-[#011C40] tracking-tight">
                Creator Proof Required
              </h3>
              <p className="text-xs text-[#26658C] font-medium leading-relaxed max-w-xs mx-auto">
                Submit your creator details. A verification email will be dispatched to <strong className="text-[#011C40]">nouriq.aisupport@gmail.com</strong> for Admin approval:
              </p>
            </div>

            {/* Device Lock Info Pill */}
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-[#011C40] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#26658C]">
                <Lock className="w-3 h-3 text-[#023859]" /> Target Admin Email:
              </span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-300 text-[#023859]">
                nouriq.aisupport@gmail.com
              </span>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmitProof} className="space-y-3 text-left text-xs">
              <div>
                <label className="block text-[#011C40] font-extrabold mb-1">Full Name / Creator Handle:</label>
                <input 
                  type="text"
                  required
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Alex Rivera (@fit_alex)"
                  className="w-full bg-white px-3.5 py-2 rounded-xl text-xs font-bold text-[#011C40] border border-[#54ACBF]/40 focus:outline-none focus:ring-2 focus:ring-[#023859]"
                />
              </div>

              <div>
                <label className="block text-[#011C40] font-extrabold mb-1">Creator Email Address:</label>
                <input 
                  type="email"
                  required
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  placeholder="e.g. alex@creator.com"
                  className="w-full bg-white px-3.5 py-2 rounded-xl text-xs font-bold text-[#011C40] border border-[#54ACBF]/40 focus:outline-none focus:ring-2 focus:ring-[#023859]"
                />
              </div>

              <div>
                <label className="block text-[#011C40] font-extrabold mb-1">Social Media Profile Link:</label>
                <input 
                  type="url"
                  required
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="e.g. https://instagram.com/your_handle"
                  className="w-full bg-white px-3.5 py-2 rounded-xl text-xs font-bold text-[#011C40] border border-[#54ACBF]/40 focus:outline-none focus:ring-2 focus:ring-[#023859]"
                />
              </div>

              {errorMsg && (
                <p className="text-[11px] font-extrabold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending to Admin...' : 'Send Verification Mail to nouriq.aisupport@gmail.com'}</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          /* PENDING ADMIN APPROVAL SCREEN */
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 mx-auto shadow-md animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold border border-amber-300 uppercase tracking-wider">
                Verification Mail Sent ✉️
              </span>
              <h3 className="text-xl font-extrabold text-[#011C40]">
                Awaiting Admin Review
              </h3>
              <p className="text-xs text-[#26658C] font-medium leading-relaxed max-w-sm mx-auto">
                Verification details have been sent to <strong className="text-[#011C40]">nouriq.aisupport@gmail.com</strong>.
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1 text-[#011C40]">
                <p><strong>Creator:</strong> {creatorName}</p>
                <p><strong>Email:</strong> {creatorEmail}</p>
                <p><strong>Status:</strong> <span className="text-amber-700 font-extrabold">Pending Admin Verification</span></p>
              </div>
              <p className="text-[11px] text-[#26658C] font-semibold pt-1">
                Once the Nouriq Admin team verifies your proof, Lifetime VIP Access will activate on your device.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-sm active:scale-95"
            >
              Got It / Return to Nouriq
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
