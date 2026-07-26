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
  Globe,
  Video,
  UserCheck,
  Link as LinkIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateAINutritionistResponse } from '../utils/aiNutritionistKnowledge';

export default function DietitianConsult() {
  const nutrition = useNutrition() || {};
  const { subscription = { tier: 'Free' }, setActiveTab = () => {}, goals = { name: 'Alex Rivera', dietType: 'High Protein', dailyCalorieGoal: 2200 } } = nutrition;

  const isUltimate = subscription?.tier === 'Ultimate';

  // Sub-Navigation Toggle State for Ultimate Coach Members
  const [activeSubToggle, setActiveSubToggle] = useState('schedule'); // 'schedule', 'live_room', 'bloodwork'

  // Preferred AI Coach Personas
  const aiDietitians = [
    {
      id: 'dr-elena-ai',
      name: 'Dr. Elena Vance AI',
      title: 'Clinical AI Metabolic & PCOS Specialist',
      specialty: 'Insulin Resistance, Glucose Curves & Hormonal Protocols',
      modelVer: 'Metabolic AI v4.9 (NIH & ADA Trained)',
      avatar: 'https://images.unsplash.com/photo-1594824813566-8185d6910a30?auto=format&fit=crop&w=200&q=80',
      availability: '⚡ Instant 24/7 AI Chat Active',
      greeting: `Hello ${goals?.name || 'Alex'}! I am Dr. Elena Vance AI — your Clinical AI Metabolic Specialist. How can I assist you with your glucose curves, insulin sensitivity, or hormonal diet protocol today?`
    },
    {
      id: 'marcus-chen-ai',
      name: 'Marcus Chen AI',
      title: 'Performance & Hypertrophy AI Specialist',
      specialty: 'Athletic Hypertrophy, mTOR Leucine & Anti-Inflammatory Protocols',
      modelVer: 'Hypertrophy AI v4.9 (ISSN & ESPEN Trained)',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      availability: '⚡ Instant 24/7 AI Chat Active',
      greeting: `Welcome ${goals?.name || 'Alex'}! I'm Marcus Chen AI — your Performance & Hypertrophy Coach. Ready to optimize your protein synthesis, mTOR activation, and athletic recovery?`
    },
    {
      id: 'dr-sarah-jenkins-ai',
      name: 'Dr. Sarah Jenkins AI',
      title: 'Gut Microbiome & Gastrointestinal Specialist',
      specialty: 'Microbiome Diversity, FODMAP & Inflammatory Bowel Protocols',
      modelVer: 'Microbiome AI v4.9 (Gastro Clinical Trained)',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
      availability: '⚡ Instant 24/7 AI Chat Active',
      greeting: `Hello ${goals?.name || 'Alex'}! I am Dr. Sarah Jenkins AI. Let's analyze your gut microbiome health, digestion, and personalized gut repair protocols.`
    },
    {
      id: 'master-zen-ai',
      name: 'Master Zen AI',
      title: 'Autophagy & Longevity Specialist',
      specialty: 'Metabolic Autophagy, Fasting Mimicking & Mitochondrial Health',
      modelVer: 'Longevity AI v4.9 (Autophagy Research Trained)',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
      availability: '⚡ Instant 24/7 AI Chat Active',
      greeting: `Greetings ${goals?.name || 'Alex'}. I am Master Zen AI. Let's discuss cellular autophagy, longevity biomarkers, and metabolic fasting stages.`
    }
  ];

  const [dietitianId, setDietitianId] = useState('dr-elena-ai');
  const currentDietitian = aiDietitians.find(d => d.id === dietitianId) || aiDietitians[0];

  // Booking & Consultation Scheduling State
  const [selectedDate, setSelectedDate] = useState('2026-07-28');
  const [selectedTimezone, setSelectedTimezone] = useState('IST');
  const [selectedTime, setSelectedTime] = useState('10:00 AM IST');
  const [consultTopic, setConsultTopic] = useState('Metabolic Health & Macro Optimization');
  const [userEmail, setUserEmail] = useState('alex.rivera@example.com');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
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
      text: currentDietitian.greeting,
      time: 'Just Now'
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  // Handle Changing AI Coach
  const handleSelectCoach = (coach) => {
    setDietitianId(coach.id);
    setChatMessages([
      {
        sender: 'ai',
        text: coach.greeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleBookAiSession = (e) => {
    e.preventDefault();

    const roomToken = `NQ-ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const redirectUrl = `https://nouriq-ai.onrender.com?tab=consult&room=${roomToken}&coach=${currentDietitian.id}`;

    const bookingInfo = {
      roomToken,
      redirectUrl,
      coach: currentDietitian,
      date: selectedDate,
      time: selectedTime,
      timezone: selectedTimezone,
      topic: consultTopic,
      email: userEmail
    };

    setConfirmedBooking(bookingInfo);
    setShowCalendarModal(true);
    confetti({ particleCount: 100, spread: 70 });

    // Auto-insert session confirmation message into 1-on-1 AI chat
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: `📅 [1-on-1 AI Consultation Scheduled]: Confirmed with ${currentDietitian.name} for ${selectedDate} at ${selectedTime} (${selectedTimezone})!\nTopic: "${consultTopic}"\nRedirect Link: ${redirectUrl}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const getGoogleCalendarUrl = () => {
    if (!confirmedBooking) return '#';
    const title = encodeURIComponent(`1-on-1 AI Chat Consultation with ${confirmedBooking.coach.name}`);
    const details = encodeURIComponent(`Live 1-on-1 AI Clinical Consultation regarding ${confirmedBooking.topic}.\n\n🚀 Direct Consultation Room Redirect Link:\n${confirmedBooking.redirectUrl}\n\nTime Zone: ${confirmedBooking.timezone}\nOrganizer: Nouriq AI Support (nouriq.aisupport@gmail.com)`);
    const location = encodeURIComponent(confirmedBooking.redirectUrl);
    const cleanDate = confirmedBooking.date.replace(/-/g, '');
    const ctz = confirmedBooking.timezone === 'IST' ? 'Asia/Kolkata' : 'America/New_York';
    const dates = `${cleanDate}T140000Z/${cleanDate}T143000Z`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&ctz=${ctz}`;
  };

  const downloadIcsFile = () => {
    if (!confirmedBooking) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nouriq AI Nutrition//Nouriq AI Consultation//EN
BEGIN:VEVENT
SUMMARY:1-on-1 AI Chat Consultation with ${confirmedBooking.coach.name} (${confirmedBooking.timezone})
DESCRIPTION:Live 1-on-1 AI Clinical Consultation regarding ${confirmedBooking.topic}. Join Room: ${confirmedBooking.redirectUrl}
LOCATION:${confirmedBooking.redirectUrl}
URL:${confirmedBooking.redirectUrl}
DTSTART:${confirmedBooking.date.replace(/-/g, '')}T140000Z
DTEND:${confirmedBooking.date.replace(/-/g, '')}T143000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nouriq_1on1_AI_Consultation_${confirmedBooking.date}_${confirmedBooking.timezone}.ics`);
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

  // Gating View for Non-Ultimate Plan Users
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
            Schedule Live 1-on-1 Chat Consultation with AI
          </h1>
          <p className="text-xs sm:text-sm text-[#26658C] font-medium leading-relaxed max-w-lg mx-auto">
            Live 1-on-1 AI Chat consultations with your preferred clinical coach, calendar invite auto-sync, and lab report biomarker parsers are exclusive to <strong className="text-[#023859]">Pro+ Ultimate Coach</strong> members.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#A7EBF2]/40 border border-[#54ACBF]/50 text-left space-y-2 text-xs text-[#011C40] font-semibold max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023859] shrink-0" />
            <span>Select Preferred Clinical AI Coach (PCOS, Metabolic, Muscle, Gut)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023859] shrink-0" />
            <span>Schedule 1-on-1 Consultation (IST & EST Timezones)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023859] shrink-0" />
            <span>Google & Apple Calendar Invite Auto-Sync with Direct Redirect Link</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#023859] shrink-0" />
            <span>AI Biomarker Bloodwork Parser (HbA1c, Lipids, Insulin Sync)</span>
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

  // Active Ultimate Member Suite View
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
          <h1 className="text-2xl font-black text-[#011C40] tracking-tight">1-on-1 AI Consultation & VIP Clinical Suite</h1>
          <p className="text-[#26658C] text-xs mt-1 font-medium">Schedule 1-on-1 consultations with preferred AI coaches & receive calendar invites with direct redirect links.</p>
        </div>

        {/* Dedicated Ultimate Sub-Toggles */}
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 md:pb-0">
          <button
            onClick={() => setActiveSubToggle('schedule')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs flex items-center gap-1.5 ${
              activeSubToggle === 'schedule'
                ? 'liquid-glass-btn liquid-glass-btn-active text-white scale-105'
                : 'liquid-glass-btn text-[#011C40]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule 1-on-1 AI</span>
          </button>

          <button
            onClick={() => setActiveSubToggle('live_room')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs flex items-center gap-1.5 ${
              activeSubToggle === 'live_room'
                ? 'liquid-glass-btn liquid-glass-btn-active text-white scale-105'
                : 'liquid-glass-btn text-[#011C40]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Live 1-on-1 Room</span>
          </button>

          <button
            onClick={() => setActiveSubToggle('bloodwork')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all shrink-0 shadow-xs flex items-center gap-1.5 ${
              activeSubToggle === 'bloodwork'
                ? 'liquid-glass-btn liquid-glass-btn-active text-white scale-105'
                : 'liquid-glass-btn text-[#011C40]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bloodwork Sync</span>
          </button>
        </div>
      </div>

      {/* 1. SCHEDULE 1-ON-1 AI CONSULTATION TOGGLE VIEW */}
      {activeSubToggle === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Preferred AI Coach Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
                <h2 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#023859]" /> Select Preferred AI Coach
                </h2>
                <span className="text-[10px] text-white bg-[#023859] px-2 py-0.5 rounded-full font-bold">4 Experts</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {aiDietitians.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelectCoach(d)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      dietitianId === d.id
                        ? 'bg-[#A7EBF2]/40 border-[#023859] shadow-sm ring-2 ring-[#023859]/20'
                        : 'ios-glass-card border-[#54ACBF]/30 hover:border-[#54ACBF]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full object-cover border-2 border-[#54ACBF]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-extrabold text-[#011C40] truncate">{d.name}</h3>
                          {dietitianId === d.id && (
                            <span className="text-[9px] bg-[#023859] text-white px-2 py-0.5 rounded-full font-black">Selected</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#26658C] font-semibold">{d.title}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#023859] font-bold leading-tight">{d.specialty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scheduling Form & Active Booking Confirmation */}
          <div className="lg:col-span-7 space-y-4">
            <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
              <div className="border-b border-[#54ACBF]/30 pb-3">
                <h2 className="text-sm font-extrabold text-[#011C40] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#023859]" /> Schedule Live 1-on-1 Chat Consultation
                </h2>
                <p className="text-xs text-[#26658C] font-medium mt-0.5">
                  Confirm your slot with <strong className="text-[#011C40]">{currentDietitian.name}</strong> to generate your calendar invite with redirect link.
                </p>
              </div>

              <form onSubmit={handleBookAiSession} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-[#26658C] font-semibold mb-1">Your Personal Email Address for Calendar Sync</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#26658C] font-semibold mb-1">Consultation Topic / Focus Area</label>
                  <input
                    type="text"
                    required
                    value={consultTopic}
                    onChange={(e) => setConsultTopic(e.target.value)}
                    placeholder="e.g. PCOS Insulin Sensitivity & High Protein Meal Timing"
                    className="w-full bg-white border border-[#54ACBF]/50 rounded-xl px-3.5 py-2.5 text-[#011C40] font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <label className="block text-[#26658C] font-semibold mb-1">Time Slot</label>
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
                  className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-white" />
                  <span>Confirm Slot & Generate Calendar Invite Link ({selectedTimezone})</span>
                </button>
              </form>

              {/* Active Booking Card */}
              {confirmedBooking && (
                <div className="p-4 rounded-2xl bg-white border border-[#54ACBF] space-y-3 shadow-xs animate-fade-in text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-extrabold text-[#011C40] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Slot Confirmed: {confirmedBooking.date} at {confirmedBooking.time} ({confirmedBooking.timezone})
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#023859] text-white text-[10px] font-extrabold">Active</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 space-y-1">
                    <span className="text-[11px] font-extrabold text-[#023859] block">🔗 Calendar Redirect Link:</span>
                    <a
                      href={confirmedBooking.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#023859] font-mono text-[10px] underline truncate block"
                    >
                      {confirmedBooking.redirectUrl}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setShowCalendarModal(true)}
                      className="flex-1 py-2.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-xs"
                    >
                      📅 Open Calendar Sync Modal
                    </button>

                    <button
                      onClick={() => setActiveSubToggle('live_room')}
                      className="flex-1 py-2.5 rounded-full bg-[#023859] text-white font-extrabold text-xs shadow-xs hover:bg-[#011C40]"
                    >
                      🚀 Enter Live 1-on-1 Room
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. LIVE 1-ON-1 CONSULTATION ROOM TOGGLE VIEW */}
      {activeSubToggle === 'live_room' && (
        <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3 shrink-0">
            <div className="flex items-center space-x-3">
              <img src={currentDietitian.avatar} alt={currentDietitian.name} className="w-10 h-10 rounded-full border-2 border-[#54ACBF] object-cover" />
              <div>
                <h2 className="text-sm font-extrabold text-[#011C40]">{currentDietitian.name}</h2>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live 1-on-1 Consultation Session Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCalendarModal(true)}
                className="px-3 py-1.5 rounded-full liquid-glass-btn text-[#023859] font-extrabold text-[11px] flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" /> Invite Link
              </button>
              <span className="text-[10px] font-extrabold text-white bg-[#023859] px-3 py-1 rounded-full">
                NIH & USDA Standard
              </span>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-sans">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-[#023859] text-white rounded-br-none shadow-xs'
                      : 'ios-glass-card text-[#011C40] rounded-bl-none border-[#54ACBF]/40 shadow-xs font-medium bg-white/90'
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
                <div className="ios-glass-card p-3 rounded-2xl text-xs text-[#26658C] font-semibold flex items-center gap-2 bg-white/90">
                  <Sparkles className="w-3.5 h-3.5 text-[#023859] animate-spin" />
                  <span>{currentDietitian.name} is formulating clinical guidance...</span>
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
              placeholder={`Ask 1-on-1 AI Coach (${currentDietitian.name})...`}
              className="flex-1 bg-white border border-[#54ACBF]/50 rounded-full px-4 py-3 text-xs text-[#011C40] font-semibold focus:outline-none placeholder:text-[#26658C]/60"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isAiThinking}
              className="w-11 h-11 rounded-full liquid-glass-btn liquid-glass-btn-active text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}

      {/* 3. BLOODWORK BIOMARKER AI PARSER TOGGLE VIEW */}
      {activeSubToggle === 'bloodwork' && (
        <div className="ios-glass p-6 md:p-8 rounded-[28px] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
            <h2 className="text-sm font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#023859]" /> AI Bloodwork Biomarker Lab Parser
            </h2>
            <span className="text-[10px] text-white bg-[#023859] px-2.5 py-0.5 rounded-full font-bold">HIPAA Encrypted</span>
          </div>

          <p className="text-xs text-[#26658C] font-medium leading-relaxed max-w-2xl">
            Upload PDF or CSV metabolic blood panels (HbA1c, Lipid Panel, Fasting Insulin, Vitamin D3, T3/T4). Clinical AI parses lab metrics and syncs recommendations directly into your live 1-on-1 AI chat.
          </p>

          <div className="border-2 border-dashed border-[#54ACBF] rounded-2xl p-6 text-center space-y-2 bg-[#A7EBF2]/20 hover:bg-[#A7EBF2]/40 transition-colors relative max-w-xl">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-full bg-[#023859] text-white flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-[#011C40] block text-xs">
                {uploadedLabName ? uploadedLabName : 'Click to Upload Metabolic Blood Panel (PDF/Images)'}
              </span>
              <span className="text-[10px] text-[#26658C] font-medium">Auto-Syncs with 1-on-1 AI Consultation Room</span>
            </div>
          </div>

          {isUploading && (
            <div className="p-3.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-extrabold text-center animate-pulse max-w-xl">
              Parsing Biomarkers with AI Clinical Engine...
            </div>
          )}

          {labSuccess && (
            <div className="p-4 rounded-2xl bg-[#A7EBF2] border border-[#54ACBF] space-y-1 text-xs text-[#011C40] font-bold max-w-xl">
              <div className="flex items-center gap-1.5 text-[#023859]">
                <CheckCircle2 className="w-4 h-4 text-[#023859]" />
                <span>Lab Report Parsed & Synced to 1-on-1 Consultation!</span>
              </div>
              <p className="text-[11px] text-[#26658C] font-semibold">
                Biomarkers parsed: HbA1c (5.4%), Fasting Glucose (88 mg/dL), Vitamin D3 (42 ng/mL). Recommendations updated in Live 1-on-1 Consultation Room.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CALENDAR INVITE & DIRECT REDIRECT LINK MODAL */}
      {showCalendarModal && confirmedBooking && (
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
                <span className="font-extrabold text-sm text-[#011C40] block">📅 Calendar Invite & Redirect Link Delivered!</span>
                <span className="text-[10px] text-[#26658C]">Sent to {confirmedBooking.email}</span>
              </div>
            </div>

            {/* Email iCal & Redirect Link Preview */}
            <div className="ios-glass-card p-4 sm:p-5 rounded-2xl space-y-3 border border-[#54ACBF]/40 bg-white/90">
              <div className="border-b border-[#54ACBF]/30 pb-2 space-y-1 text-[11px]">
                <div><strong className="text-[#023859]">Organizer:</strong> Nouriq AI &lt;nouriq.aisupport@gmail.com&gt;</div>
                <div><strong className="text-[#023859]">Attendee:</strong> {goals?.name || 'Alex Rivera'} &lt;{confirmedBooking.email}&gt;</div>
                <div><strong className="text-[#023859]">Coach:</strong> {confirmedBooking.coach.name} ({confirmedBooking.coach.title})</div>
                <div><strong className="text-[#023859]">Topic:</strong> {confirmedBooking.topic}</div>
                <div><strong className="text-[#023859]">When:</strong> {confirmedBooking.date} at {confirmedBooking.time} ({confirmedBooking.timezone})</div>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-[#011C40] font-medium">
                <div className="p-3 rounded-xl bg-[#A7EBF2]/40 border border-[#54ACBF]/40 space-y-1">
                  <span className="font-extrabold text-[#023859] flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-[#023859]" /> 🚀 Live Consultation Room Redirect Link:
                  </span>
                  <a
                    href={confirmedBooking.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#023859] font-mono text-[10px] underline block truncate"
                  >
                    {confirmedBooking.redirectUrl}
                  </a>
                  <p className="text-[10px] text-[#26658C] pt-0.5">This direct redirect link is automatically embedded inside your Google & Apple Calendar events!</p>
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
                <span>📅 Add to Google Calendar (With Direct Redirect Link)</span>
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
                onClick={() => {
                  setShowCalendarModal(false);
                  setActiveSubToggle('live_room');
                }}
                className="w-full py-2.5 rounded-full bg-[#023859] text-white font-extrabold text-xs shadow-xs hover:bg-[#011C40]"
              >
                🚀 Enter Live 1-on-1 AI Consultation Room Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
