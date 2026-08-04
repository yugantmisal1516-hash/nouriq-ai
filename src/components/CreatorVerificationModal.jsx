import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Sparkles, Send, Check, X, Mail, Clock, Copy } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingPayload, setPendingPayload] = useState(null);

  if (!isOpen) return null;

  const currentDeviceFp = getDeviceFingerprint();

  const handleSubmitProof = (e) => {
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
    setPendingPayload(verificationPayload);

    // 2. Launch Native Mailto App to nouriq.aisupport@gmail.com
    const subject = encodeURIComponent(`🚨 CREATOR VIP VERIFICATION REQUEST — NOURIQPASS (${creatorName.trim()})`);
    const body = encodeURIComponent(
      `Target Admin Email: nouriq.aisupport@gmail.com\n` +
      `Creator Name: ${creatorName.trim()}\n` +
      `Creator Email: ${creatorEmail.trim()}\n` +
      `Social Media Link: ${socialLink.trim()}\n` +
      `Device Hardware Fingerprint: ${currentDeviceFp}\n` +
      `Verification Token: ${verificationToken}\n` +
      `Approval Link: https://nouriq-ai.onrender.com?approve_creator=${verificationToken}&fp=${currentDeviceFp}\n\n` +
      `Please verify this creator proof and approve access.`
    );
    const mailtoUrl = `mailto:nouriq.aisupport@gmail.com?subject=${subject}&body=${body}`;

    try {
      window.location.href = mailtoUrl;
    } catch (err) {
      console.info('Mailto launch fallback:', err);
    }

    confetti({ particleCount: 120, spread: 80 });
    setIsSubmitting(false);
    setIsSubmittedPending(true);

    if (typeof onVerificationComplete === 'function') {
      onVerificationComplete(verificationPayload);
    }
  };

  const handleCopyProofText = () => {
    if (!pendingPayload) return;
    const textToCopy = 
      `Target Admin Email: nouriq.aisupport@gmail.com\n` +
      `Creator Name: ${pendingPayload.creatorName}\n` +
      `Creator Email: ${pendingPayload.creatorEmail}\n` +
      `Social Media Link: ${pendingPayload.socialProfileUrl}\n` +
      `Device Hardware Fingerprint: ${pendingPayload.deviceFingerprint}\n` +
      `Verification Token: ${pendingPayload.verificationToken}\n` +
      `Approval Link: ${pendingPayload.approvalLink}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenEmailClient = () => {
    if (!pendingPayload) return;
    const subject = encodeURIComponent(`🚨 CREATOR VIP VERIFICATION REQUEST — NOURIQPASS (${pendingPayload.creatorName})`);
    const body = encodeURIComponent(
      `Target Admin Email: nouriq.aisupport@gmail.com\n` +
      `Creator Name: ${pendingPayload.creatorName}\n` +
      `Creator Email: ${pendingPayload.creatorEmail}\n` +
      `Social Media Link: ${pendingPayload.socialProfileUrl}\n` +
      `Device Hardware Fingerprint: ${pendingPayload.deviceFingerprint}\n` +
      `Verification Token: ${pendingPayload.verificationToken}\n` +
      `Approval Link: ${pendingPayload.approvalLink}\n\n` +
      `Please verify this creator proof and approve access.`
    );
    window.location.href = `mailto:nouriq.aisupport@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="ios-glass p-6 sm:p-7 rounded-[32px] max-w-md w-full text-center space-y-5 shadow-2xl border border-[#54ACBF]/50 bg-white/95 relative overflow-hidden">
        
        {/* Header Security Badge */}
        <div className="flex items-center justify-between">
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold flex items-center gap-1.5 border border-amber-300">
            <Lock className="w-3.5 h-3.5 text-amber-700" /> Manual Admin Verification System
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
                Submit your creator details below to send a verification mail directly to <strong className="text-[#011C40]">nouriq.aisupport@gmail.com</strong> for Admin approval:
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
                  <span>{isSubmitting ? 'Opening Email App...' : 'Send Email to nouriq.aisupport@gmail.com'}</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          /* PENDING ADMIN APPROVAL & MANUAL DISPATCH SCREEN */
          <div className="space-y-4 py-2 text-xs">
            <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 mx-auto shadow-md animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold border border-amber-300 uppercase tracking-wider">
                Verification Email Ready ✉️
              </span>
              <h3 className="text-xl font-extrabold text-[#011C40]">
                Submit to nouriq.aisupport@gmail.com
              </h3>
              <p className="text-xs text-[#26658C] font-medium leading-relaxed max-w-sm mx-auto">
                Send your verification email to <strong className="text-[#011C40]">nouriq.aisupport@gmail.com</strong>. Access will remain Free until approved by Nouriq Admin.
              </p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1 text-[#011C40]">
                <p><strong>Admin Email:</strong> nouriq.aisupport@gmail.com</p>
                <p><strong>Creator:</strong> {creatorName}</p>
                <p><strong>Creator Email:</strong> {creatorEmail}</p>
                <p><strong>Status:</strong> <span className="text-amber-700 font-extrabold">Pending Admin Review</span></p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleOpenEmailClient}
                className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Open Email App to Send to nouriq.aisupport@gmail.com</span>
              </button>

              <button
                onClick={handleCopyProofText}
                className="w-full py-2.5 rounded-full liquid-glass-btn text-[#011C40] text-xs font-bold active:scale-95 flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#023859]" />}
                <span>{copied ? 'Copied Email Text to Clipboard!' : 'Copy Verification Details to Clipboard'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 rounded-full text-[#26658C] hover:text-[#011C40] font-extrabold text-xs transition-colors"
              >
                Done / Return to Nouriq
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
