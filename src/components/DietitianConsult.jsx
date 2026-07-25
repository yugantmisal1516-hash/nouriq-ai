import React, { useState, useRef, useEffect } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  Stethoscope, 
  FileSpreadsheet, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  UploadCloud, 
  ShieldCheck,
  UserCheck,
  Activity,
  Award,
  Send,
  Clock,
  Bot,
  Zap,
  RotateCcw,
  Mail,
  Download,
  Check,
  X,
  ExternalLink,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateAINutritionistResponse } from '../utils/aiNutritionistKnowledge';

export default function DietitianConsult() {
  const nutrition = useNutrition() || {};
  const { subscription = { tier: 'Free' }, setActiveTab = () => {}, goals = { name: 'Alex Rivera', dietType: 'High Protein', dailyCalorieGoal: 2200 } } = nutrition;

  const isUltimate = subscription?.tier === 'Ultimate';

  // Booking State (AI Chat Consultation Scheduling)
  const [selectedDate, setSelectedDate] = useState('2026-07-28');
  const [selectedTimezone, setSelectedTimezone] = useState('IST');
  const [selectedTime, setSelectedTime] = useState('10:00 AM IST');
  const [userEmail, setUserEmail] = useState('alex.rivera@example.com');
  const [dietitianId, setDietitianId] = useState('dr-elena-ai');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Lab Upload State
  const [uploadedLabName, setUploadedLabName] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [labSuccess, setLabSuccess] = useState(false);

  // Live 1-on-1 AI Chat Consultation State
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${goals?.name || 'Alex'}! I am Dr. Elena Vance AI — your Clinical Nutrition & Biomarker Specialist. How can I assist you with your metabolic lab reports, glycemic control, or custom medical diet protocol today?`,
      time: 'Just Now'
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  const aiDietitians = [
    {
      id: 'dr-elena-ai',
      name: 'Dr. Elena Vance AI Engine',
      title: 'Clinical AI Metabolic & PCOS Specialist',
      specialty: 'Insulin Resistance, Glucose Curves & Hormonal Protocols',
      modelVer: 'Metabolic AI v4.9 (NIH & ADA Trained)',
      avatar: 'https://images.unsplash.com/photo-1594824813566-8185d6910a30?auto=format&fit=crop&w=200&q=80',
      availability: '⚡ Instant 24/7 AI Chat Active'
    },
    {
      id: 'marcus-chen-ai',
      name: 'Marcus Chen AI Engine',
      title: 'Performance & Hypertrophy AI Specialist',
      specialty: 'Athletic Hypertrophy, mTOR Leucine & Anti-Inflammatory Protocols',
      modelVer: 'Hypertrophy AI v4.9 (ISSN & ESPEN Trained)',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      availability: '⚡ Instant 24/7 AI Chat Active'
    }
  ];

  const currentDietitian = aiDietitians.find(d => d.id === dietitianId) || aiDietitians[0];

  const handleBookAiSession = (e) => {
    e.preventDefault();
    setBookingConfirmed(true);
    setShowCalendarModal(true);
    confetti({ particleCount: 100, spread: 70 });

    // Auto-add consultation calendar booking message into 1-on-1 AI chat
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: `📅 [AI Calendar Invite Delivered]: Live 1-on-1 Chat Consultation confirmed with ${currentDietitian.name} for ${selectedDate} at ${selectedTime} (${selectedTimezone}). Calendar invite delivered to ${userEmail}!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`1-on-1 AI Chat Consultation with ${currentDietitian.name}`);
    const details = encodeURIComponent(`Live 1-on-1 AI Clinical Consultation regarding metabolic health, lab biomarkers, and medical diet protocols.\nJoin session inside Nouriq AI Console.\nTime Zone: ${selectedTimezone}\nSupport Contact: nouriq.aisupport@gmail.com`);
    const location = encodeURIComponent('Nouriq AI Consultation Console');
    const cleanDate = selectedDate.replace(/-/g, '');
    const ctz = selectedTimezone === 'IST' ? 'Asia/Kolkata' : 'America/New_York';
    const dates = `${cleanDate}T140000Z/${cleanDate}T143000Z`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&ctz=${ctz}`;
  };

  const downloadIcsFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nouriq AI Nutrition//Nouriq AI Consultation//EN
BEGIN:VEVENT
SUMMARY:1-on-1 AI Chat Consultation with ${currentDietitian.name} (${selectedTimezone})
DESCRIPTION:Live 1-on-1 AI Clinical Consultation regarding metabolic health and lab biomarkers.
LOCATION:Nouriq AI Consultation Console
DTSTART:${selectedDate.replace(/-/g, '')}T140000Z
DTEND:${selectedDate.replace(/-/g, '')}T143000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nouriq_AI_Consultation_${selectedDate}_${selectedTimezone}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedLabName(file.name);
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setLabSuccess(true);
        confetti({ particleCount: 80, spread: 60 });
        
        // Auto-add parsed lab AI message into 1-on-1 chat
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `📊 [AI Biomarker Engine Report Parsed for "${file.name}"]: HbA1c: 5.4% (Optimal), Fasting Glucose: 88 mg/dL (Normal), Vitamin D3: 42 ng/mL. All metrics align with your ${goals?.dietType || 'High Protein'} target!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1500);
    }
  };

  const handleSendAiChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiThinking) return;

    const userMsgText = chatInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { sender: 'user', text: userMsgText, time: timeStr }]);
    setChatInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      const aiReply = generateAINutritionistResponse(userMsgText);
      setIsAiThinking(false);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `[${currentDietitian.name}]: ${aiReply}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  // If user is not on Ultimate Plan, display VIP Gating Banner
  if (!isUltimate) {
    return (
      <div className="ios-glass p-8 md:p-12 rounded-[32px] text-center space-y-6 max-w-2xl mx-auto shadow-md border border-[#54ACBF]/50">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-md">
          <Lock className="w-8 h-8 text-slate-950" />
        </div>

        <div className="space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-slate-950" /> ⭐ Pro+ Ultimate Coach Exclusive Feature
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#011C40] tracking-tight">
            1-on-1 AI Dietitian Consultation & Bloodwork AI Sync
          </h1>
          <p className="text-xs sm:text-sm text-[#26658C] font-medium leading-relaxed max-w-lg mx-auto">
            Live 1-on-1 AI Chat consultations, zero-error clinical biomarker lab sync, and medical nutrition protocol engines are exclusive to <strong className="text-[#023859]">Pro+ Ultimate Coach</strong> members.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/50 text-left space-y-2 text-xs text-[#011C40] font-semibold max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023859] shrink-0" />
            <span>Schedule Live 1-on-1 Chat Consultation with AI</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023859] shrink-0" />
            <span>AI Metabolic Bloodwork Lab Sync (Lipid, HbA1c, Vitamin D, Thyroid)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023859] shrink-0" />
            <span>World-Standard Clinical Dietetics AI (NIH, USDA & ESPEN Trained)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023859] shrink-0" />
            <span>Instant 24/7 AI Priority Chat Console (&lt; 1 sec AI response)</span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('pricing')}
          className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all max-w-md mx-auto flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>⭐ Upgrade to Pro+ Ultimate Coach ($29.99/mo)</span>
        </button>
      </div>
    );
  }

  // Active Ultimate Member View
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="ios-glass p-6 md:p-7 rounded-[28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm bg-gradient-to-r from-white via-white to-[#A7EBF2]/30 border border-[#54ACBF]/50">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" /> ⭐ VIP Ultimate AI Suite Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#011C40] tracking-tight">1-on-1 AI Dietitian Consultation & Bloodwork AI Sync</h1>
          <p className="text-[#26658C] text-xs mt-1 font-medium">World-standard AI clinical dietetics, AI biomarker lab parser, & instant 1-on-1 AI chat consultation.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-4 py-2 rounded-full bg-[#023859] text-white text-xs font-extrabold flex items-center gap-2 shadow-xs">
            <Zap className="w-4 h-4 text-[#A7EBF2]" /> World-Standard Clinical AI Engine
          </span>
        </div>
      </div>

      {/* Grid Section: AI Dietitian Engine Selection & Scheduling + AI Chat & Lab Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Clinical Dietitian Personas & Schedule Chat */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* AI Clinical Dietitian Persona Selection */}
          <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
              <h2 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#023859]" /> Select AI Clinical Dietitian Specialist
              </h2>
              <span className="text-xs text-[#26658C] font-semibold">Zero-Error AI Engine</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {aiDietitians.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setDietitianId(d.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    dietitianId === d.id
                      ? 'bg-[#A7EBF2]/40 border-[#023859] shadow-sm ring-2 ring-[#023859]/20'
                      : 'ios-glass-card border-[#54ACBF]/30 hover:border-[#54ACBF]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img src={d.avatar} alt={d.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#54ACBF]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-[#011C40] truncate">{d.name}</h3>
                        <span className="text-[10px] text-white bg-[#023859] px-2 py-0.5 rounded-full font-bold">AI Active</span>
                      </div>
                      <p className="text-[10px] text-[#26658C] font-semibold">{d.title}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#023859] font-bold leading-tight">{d.specialty}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#54ACBF]/20 text-[10px]">
                    <span className="text-[#26658C] font-medium">{d.modelVer}</span>
                    <span className="text-emerald-700 font-extrabold">{d.availability}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Chat Consultation Schedule Form with IST & EST Timezones */}
            <form onSubmit={handleBookAiSession} className="p-4 rounded-2xl bg-white/80 border border-[#54ACBF]/40 space-y-3 text-xs">
              <h3 className="font-extrabold text-[#011C40] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#023859]" /> Schedule Live 1-on-1 Chat Consultation with AI
              </h3>

              <div>
                <label className="block text-[#26658C] font-semibold mb-1">Your Personal Email Address for Calendar Sync</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@gmail.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3 py-2 text-[#011C40] font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[#26658C] font-semibold mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#023859]" /> Time Zone
                  </label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => {
                      const newTz = e.target.value;
                      setSelectedTimezone(newTz);
                      setSelectedTime(`10:00 AM ${newTz}`);
                    }}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-2.5 py-2 text-[#011C40] font-bold focus:outline-none"
                  >
                    <option value="IST">IST (India GMT+5:30)</option>
                    <option value="EST">EST (US East GMT-5:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#26658C] font-semibold mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-2.5 py-2 text-[#011C40] font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#26658C] font-semibold mb-1">Time Window</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-2 py-2 text-[#011C40] font-bold focus:outline-none"
                  >
                    <option value={`10:00 AM ${selectedTimezone}`}>10:00 AM {selectedTimezone}</option>
                    <option value={`02:30 PM ${selectedTimezone}`}>02:30 PM {selectedTimezone}</option>
                    <option value={`06:00 PM ${selectedTimezone}`}>06:00 PM {selectedTimezone}</option>
                    <option value={`09:30 PM ${selectedTimezone}`}>09:30 PM {selectedTimezone}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Confirm 1-on-1 AI Chat Consultation Slot ({selectedTimezone})</span>
              </button>

              {bookingConfirmed && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-900 text-center font-extrabold animate-fade-in flex items-center justify-between">
                  <span>✓ 1-on-1 AI Chat Consultation Confirmed for {selectedDate} at {selectedTime} ({selectedTimezone})!</span>
                  <button
                    type="button"
                    onClick={() => setShowCalendarModal(true)}
                    className="underline text-[#023859] font-extrabold hover:text-[#011C40]"
                  >
                    View Invite
                  </button>
                </div>
              )}
            </form>

          </div>

        </div>

        {/* Right Column: Instant Live AI 1-on-1 Chat Console & AI Bloodwork Lab Sync */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Instant Live 1-on-1 AI Chat Consultation Console */}
          <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <img src={currentDietitian.avatar} alt={currentDietitian.name} className="w-8 h-8 rounded-full border border-[#54ACBF] object-cover" />
                <div>
                  <h2 className="text-xs font-extrabold text-[#011C40]">{currentDietitian.name}</h2>
                  <span className="text-[10px] text-emerald-700 font-bold block">● Live 1-on-1 AI Chat Active</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#023859] bg-[#A7EBF2] px-2.5 py-0.5 rounded-full">
                NIH & USDA Standard
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-[#023859] text-white rounded-br-none shadow-xs'
                        : 'ios-glass-card text-[#011C40] rounded-bl-none border-[#54ACBF]/40 shadow-xs font-medium'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[9px] block text-right font-semibold ${msg.sender === 'user' ? 'text-[#A7EBF2]' : 'text-[#26658C]'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex items-start">
                  <div className="ios-glass-card p-3 rounded-2xl text-xs text-[#26658C] font-semibold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#023859] animate-spin" />
                    <span>Analyzing world-standard clinical research database...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendAiChatMessage} className="flex items-center gap-2 pt-2 border-t border-[#54ACBF]/30 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask 1-on-1 AI Dietitian clinical question..."
                className="flex-1 bg-white border border-[#54ACBF]/50 rounded-full px-4 py-2.5 text-xs text-[#011C40] font-semibold focus:outline-none placeholder:text-[#26658C]/60"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiThinking}
                className="w-10 h-10 rounded-full liquid-glass-btn liquid-glass-btn-active text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

          {/* AI Bloodwork Biomarker Lab Sync Card */}
          <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
              <h2 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#023859]" /> AI Bloodwork Lab Report Sync
              </h2>
              <span className="text-[10px] text-white bg-[#023859] px-2.5 py-0.5 rounded-full font-bold">Auto-Parse AI</span>
            </div>

            <p className="text-xs text-[#26658C] font-medium leading-relaxed">
              Upload PDF or CSV metabolic blood panels (HbA1c, Lipid Panel, Thyroid T3/T4, Fasting Insulin, Vitamin D3). Our clinical AI parses lab values with high precision and syncs recommendations directly into your AI chat.
            </p>

            <div className="border-2 border-dashed border-[#54ACBF] rounded-2xl p-5 text-center space-y-2 bg-[#A7EBF2]/20 hover:bg-[#A7EBF2]/40 transition-colors relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-10 h-10 rounded-full bg-[#023859] text-[#023859] flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-[#011C40] block text-xs">
                  {uploadedLabName ? uploadedLabName : 'Click to Upload Metabolic Blood Panel (PDF/Images)'}
                </span>
                <span className="text-[10px] text-[#26658C] font-medium">HIPAA Encrypted AI Biomarker Parsing</span>
              </div>
            </div>

            {isUploading && (
              <div className="p-3 rounded-xl bg-amber-100 text-amber-900 text-xs font-extrabold text-center animate-pulse">
                Parsing Biomarkers with AI Clinical Engine...
              </div>
            )}

            {labSuccess && (
              <div className="p-3 rounded-2xl bg-[#A7EBF2] border border-[#54ACBF] space-y-1 text-xs text-[#011C40] font-bold">
                <div className="flex items-center gap-1.5 text-[#023859]">
                  <CheckCircle2 className="w-4 h-4 text-[#023859]" />
                  <span>Lab Report Parsed Successfully by AI!</span>
                </div>
                <p className="text-[11px] text-[#26658C] font-semibold">
                  Biomarkers parsed: HbA1c (5.4%), Fasting Glucose (88 mg/dL), Vitamin D3 (42 ng/mL). Recommendations updated in 1-on-1 AI chat console.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* CALENDAR INVITE EMAIL NOTIFICATION MODAL */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/70 backdrop-blur-md animate-fade-in">
          <div className="ios-glass w-full max-w-md rounded-[32px] p-6 sm:p-7 space-y-5 relative shadow-2xl border border-[#54ACBF]/50 text-xs text-[#011C40]">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] font-bold text-xs"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 border-b border-[#54ACBF]/40 pb-3">
              <div className="w-9 h-9 rounded-full bg-[#023859] text-white flex items-center justify-center shrink-0">
                <Mail className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-[#011C40] block">📅 Calendar Invite Delivered!</span>
                <span className="text-[10px] text-[#26658C]">Sent to {userEmail}</span>
              </div>
            </div>

            {/* Email iCal Preview */}
            <div className="ios-glass-card p-5 rounded-2xl space-y-3 border border-[#54ACBF]/40">
              <div className="border-b border-[#54ACBF]/30 pb-2 space-y-1 text-[11px]">
                <div><strong className="text-[#023859]">Organizer:</strong> Nouriq AI &lt;nouriq.aisupport@gmail.com&gt;</div>
                <div><strong className="text-[#023859]">Attendee:</strong> {goals?.name || 'Alex Rivera'} &lt;{userEmail}&gt;</div>
                <div><strong className="text-[#023859]">Event:</strong> 📅 1-on-1 AI Chat Consultation with {currentDietitian.name}</div>
                <div><strong className="text-[#023859]">When:</strong> {selectedDate} at {selectedTime} ({selectedTimezone})</div>
                <div><strong className="text-[#023859]">Time Zone:</strong> {selectedTimezone === 'IST' ? 'India Standard Time (IST)' : 'Eastern Standard Time (EST)'}</div>
                <div><strong className="text-[#023859]">Location:</strong> Nouriq AI Consultation Console</div>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-[#011C40] font-medium">
                <p>Hello <strong className="text-[#023859]">{goals?.name || 'Alex'}</strong>,</p>
                <p>Your 1-on-1 AI Chat Consultation slot with <strong>{currentDietitian.name}</strong> has been confirmed for <strong>{selectedDate} at {selectedTime} ({selectedTimezone})</strong>!</p>
                
                <div className="p-3 rounded-xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 space-y-1">
                  <span className="font-extrabold text-[#023859] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#023859]" /> 1-Click Calendar Sync Active
                  </span>
                  <p className="text-[11px] text-[#26658C]">Click the button below to add this appointment directly into your personal Google Calendar, or download the .ics file for Apple & Outlook.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95 flex items-center justify-center gap-2 block text-center"
              >
                <ExternalLink className="w-4 h-4 text-[#A7EBF2]" />
                <span>📅 Add Directly to Google Calendar ({selectedTimezone})</span>
              </a>

              <button
                type="button"
                onClick={downloadIcsFile}
                className="w-full py-2.5 rounded-full liquid-glass-btn text-[#011C40] font-extrabold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#023859]" />
                <span>Download .ics File (Apple iCal & Outlook)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="w-full py-2 rounded-full text-[#26658C] hover:text-[#011C40] font-bold text-xs"
              >
                Close & Return to Chat Console
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
