import React, { useState, useEffect } from 'react';
import { ShieldCheck, Camera, Bell, MapPin, Sparkles, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PermissionModal() {
  const [showModal, setShowModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState({
    notifications: false,
    camera: false,
    location: false
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const prompted = localStorage.getItem('nouriq_permissions_prompted');
    if (!prompted) {
      // Small delay on app open so the user sees the dashboard load first
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllowAll = async () => {
    setIsProcessing(true);
    let grantedNotif = false;
    let grantedCam = false;
    let grantedLoc = false;

    // 1. Push Notifications Permission
    if ('Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === 'granted') grantedNotif = true;
      } catch (e) {
        console.info('Notification permission error:', e);
      }
    }

    // 2. Camera Access Test
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        grantedCam = true;
        // Stop test stream immediately
        stream.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.info('Camera permission error:', e);
      }
    }

    // 3. Location / Regional Locale
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { grantedLoc = true; },
        () => {},
        { timeout: 3000 }
      );
    }

    setPermissionStatus({
      notifications: grantedNotif,
      camera: grantedCam,
      location: grantedLoc
    });

    localStorage.setItem('nouriq_permissions_prompted', 'true');
    confetti({ particleCount: 90, spread: 70 });

    setTimeout(() => {
      setIsProcessing(false);
      setShowModal(false);
    }, 600);
  };

  const handleDismiss = () => {
    localStorage.setItem('nouriq_permissions_prompted', 'dismissed');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="ios-glass p-6 sm:p-7 rounded-[32px] max-w-md w-full text-center space-y-5 shadow-2xl border border-[#54ACBF]/50 bg-white/95 relative overflow-hidden">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <span className="px-3.5 py-1 rounded-full bg-[#A7EBF2]/50 text-[#023859] text-[11px] font-extrabold flex items-center gap-1.5 border border-[#54ACBF]/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#023859]" /> System Permissions Request
          </span>
          <button 
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-slate-100 text-[#011C40] hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition-all"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Icon & Title */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl liquid-glass-btn liquid-glass-btn-active flex items-center justify-center text-white mx-auto shadow-md">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-extrabold text-[#011C40] tracking-tight">
            Enable Nouriq AI Permissions
          </h3>
          <p className="text-xs text-[#26658C] font-medium leading-relaxed max-w-xs mx-auto">
            To provide 100% accurate AI food photo scanning, fasting push alerts, and local macro calculations, please grant app permissions:
          </p>
        </div>

        {/* Permission List */}
        <div className="space-y-2.5 text-left bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#A7EBF2]/60 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-[#023859]" />
              </div>
              <div>
                <span className="font-extrabold text-[#011C40] block">Camera Access</span>
                <span className="text-[10px] text-[#26658C] font-medium">Instant AI food photo scanning & macro detection</span>
              </div>
            </div>
            {permissionStatus.camera ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : null}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#A7EBF2]/60 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-[#023859]" />
              </div>
              <div>
                <span className="font-extrabold text-[#011C40] block">Push Notifications</span>
                <span className="text-[10px] text-[#26658C] font-medium">Fasting timer completion, water & calorie alerts</span>
              </div>
            </div>
            {permissionStatus.notifications ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : null}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#A7EBF2]/60 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#023859]" />
              </div>
              <div>
                <span className="font-extrabold text-[#011C40] block">Regional Database</span>
                <span className="text-[10px] text-[#26658C] font-medium">Local currency & regional food macro matching</span>
              </div>
            </div>
            {permissionStatus.location ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : null}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleAllowAll}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isProcessing ? 'Granting System Access...' : 'Allow All Permissions (Recommended)'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 rounded-full text-[#26658C] hover:text-[#011C40] font-extrabold text-xs transition-colors"
          >
            Ask Me Later
          </button>
        </div>

      </div>
    </div>
  );
}
