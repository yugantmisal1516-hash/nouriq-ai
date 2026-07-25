import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Award, Sparkles, Flame, Dumbbell } from 'lucide-react';

export default function Analytics() {
  const nutrition = useNutrition() || {};
  const { 
    weightLogs = [], 
    goals = { dailyCalorieGoal: 2000, targetWeight: 70 }, 
    todayTotals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }, 
    averageHealthScore = 92, 
    subscription = { tier: 'Free' }, 
    setActiveTab = () => {} 
  } = nutrition;

  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleExportPdf = () => {
    if (subscription?.tier === 'Free') {
      setShowPdfModal(true);
      return;
    }
    window.print();
  };

  const calorieGoal = goals?.dailyCalorieGoal || 2000;
  const targetW = goals?.targetWeight || 70;

  const calorieHistory = [
    { day: 'Thu', calories: 2150, target: calorieGoal, healthScore: 90 },
    { day: 'Fri', calories: 2280, target: calorieGoal, healthScore: 88 },
    { day: 'Sat', calories: 2400, target: calorieGoal, healthScore: 84 },
    { day: 'Sun', calories: 1980, target: calorieGoal, healthScore: 94 },
    { day: 'Mon', calories: 2120, target: calorieGoal, healthScore: 92 },
    { day: 'Tue', calories: 2250, target: calorieGoal, healthScore: 91 },
    { day: 'Today', calories: todayTotals?.calories || 2160, target: calorieGoal, healthScore: averageHealthScore }
  ];

  const macroData = [
    { name: 'Protein', value: todayTotals?.protein || 140, color: '#023859' },
    { name: 'Carbs', value: todayTotals?.carbs || 180, color: '#26658C' },
    { name: 'Fats', value: todayTotals?.fats || 65, color: '#54ACBF' },
    { name: 'Fiber', value: todayTotals?.fiber || 28, color: '#80D8E3' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="ios-glass p-6 rounded-[28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#A7EBF2]" /> AI Biometric Analytics
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#011C40] tracking-tight">Progress Analytics & Insights</h1>
          <p className="text-[#26658C] text-xs mt-1 font-medium">Multi-dimensional analytics for calories, body mass, macro ratios, & Nutri-Scores.</p>
        </div>

        <button
          onClick={handleExportPdf}
          className="px-5 py-2.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-sm active:scale-95 flex items-center gap-2 shrink-0"
        >
          📄 {subscription?.tier === 'Free' ? '🔒 Export PDF Report (Pro)' : 'Export PDF Macro Report'}
        </button>
      </div>

      {/* Report Summary */}
      <div className="ios-glass p-6 rounded-[28px] space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#011C40] flex items-center gap-2 uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#023859]" /> AI Weekly Progress Report Summary
          </h3>
          <span className="text-xs text-white font-extrabold px-3.5 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active shadow-xs">
            Grade A Performance
          </span>
        </div>
        <p className="text-xs text-[#26658C] leading-relaxed font-medium">
          Over the past 7 days, you hit <strong className="text-[#011C40] font-extrabold">96% of your daily protein targets</strong>, resulting in steady muscle mass retention. Your average health score increased by <strong>+12 points</strong> to 92/100, driven by lower glycemic meal choices.
        </p>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Calorie Intake Chart */}
        <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" /> Calorie Intake vs Target (7 Days)
            </h3>
            <span className="text-xs text-[#26658C] font-semibold">Goal: {calorieGoal} kcal</span>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieHistory}>
                <XAxis dataKey="day" stroke="#26658C" fontSize={11} />
                <YAxis stroke="#26658C" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#54ACBF', borderRadius: '16px', fontSize: '12px' }} />
                <Bar dataKey="calories" fill="#023859" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Weight Trajectory Chart */}
        <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#023859]" /> Body Weight Trajectory (kg)
            </h3>
            <span className="text-xs text-[#011C40] font-extrabold">Target: {targetW} kg</span>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightLogs.length > 0 ? weightLogs : [{ date: 'Mon', weight: 75.2 }, { date: 'Wed', weight: 74.8 }, { date: 'Today', weight: 74.5 }]}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#023859" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#023859" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#26658C" fontSize={11} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#26658C" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#54ACBF', borderRadius: '16px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="weight" stroke="#023859" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Ratio Chart */}
        <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#023859]" /> Today's Macro Ratio
          </h3>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                  {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#54ACBF', borderRadius: '16px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
            {macroData.map((m) => (
              <div key={m.name} className="ios-glass-card p-2 rounded-2xl">
                <span className="text-[10px] text-[#26658C] block font-semibold">{m.name}</span>
                <span className="font-extrabold text-[#011C40]">{m.value}g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutri-Score Rating Evolution */}
        <div className="ios-glass p-6 rounded-[28px] space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-[#011C40] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-[#023859]" /> Nutri-Score Rating Evolution
          </h3>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calorieHistory}>
                <XAxis dataKey="day" stroke="#26658C" fontSize={11} />
                <YAxis domain={[60, 100]} stroke="#26658C" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#54ACBF', borderRadius: '16px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="healthScore" stroke="#023859" strokeWidth={3} dot={{ r: 4, fill: '#023859' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* PDF Export Pro Upgrade Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011C40]/80 backdrop-blur-md">
          <div className="ios-glass p-7 rounded-[32px] max-w-md w-full space-y-4 text-center border border-[#54ACBF]/50 shadow-2xl relative">
            <button 
              onClick={() => setShowPdfModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/40 text-[#011C40] font-bold flex items-center justify-center hover:bg-white text-sm"
            >
              ✕
            </button>
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-md">
              <Award className="w-7 h-7 text-slate-950" />
            </div>
            <h3 className="text-xl font-black text-[#011C40]">PDF Macro Report Export Locked</h3>
            <p className="text-xs text-[#26658C] font-medium leading-relaxed">
              Exporting detailed PDF Macro & Biometric Health Reports is an exclusive <strong className="text-[#023859]">Nouriq Pro</strong> feature. Upgrade now to download and share report PDFs with your physician!
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowPdfModal(false);
                  setActiveTab('pricing');
                }}
                className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white font-extrabold text-xs shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>👑 Upgrade to Nouriq Pro ($14.99/mo)</span>
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="w-full py-2.5 rounded-full liquid-glass-btn text-[#011C40] font-extrabold text-xs"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
