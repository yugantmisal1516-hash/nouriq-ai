import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  LayoutDashboard, 
  Camera, 
  Utensils, 
  Timer, 
  Droplet, 
  ShoppingCart, 
  Bot, 
  HelpCircle,
  Crown,
  Sparkles,
  TrendingUp,
  Stethoscope
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, subscription } = useNutrition();

  const isPro = subscription?.tier === 'Pro' || subscription?.tier === 'Ultimate';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'AI Food Scanner', icon: Camera, badge: 'Vision' },
    { id: 'mealplan', label: 'Meal Planner', icon: Utensils, badge: '7-Day' },
    { id: 'fasting', label: 'Fasting Timer', icon: Timer, badge: 'Live' },
    { id: 'water', label: 'Water Tracker', icon: Droplet },
    { id: 'grocery', label: 'Smart Grocery', icon: ShoppingCart },
    { id: 'analytics', label: 'Progress Analytics', icon: TrendingUp, badge: 'Reports' },
    { id: 'dietitian', label: 'VIP Dietitian & Lab', icon: Stethoscope, badge: '⭐ Ultimate' },
    { id: 'coach', label: 'AI Nutritionist', icon: Bot, badge: 'Zero-Error' },
    { id: 'pricing', label: 'Pricing & Pro', icon: Crown, badge: isPro ? 'Active' : 'Save 33%' },
    { id: 'support', label: 'Support & Policies', icon: HelpCircle, badge: 'Razorpay' },
  ];

  return (
    <aside className="w-full beige-dock rounded-[28px] p-4 flex flex-col justify-between shrink-0 shadow-sm border border-[#54ACBF]/40">
      
      <div className="space-y-1.5">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#26658C]">
          Navigation Menu
        </div>

        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'liquid-glass-btn liquid-glass-btn-active scale-102 shadow-md'
                  : 'liquid-glass-btn text-[#011C40] hover:text-[#023859] hover:bg-[#E0F7FA]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#023859]'}`} />
                <span className={isActive ? 'font-extrabold text-white' : 'font-semibold'}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#A7EBF2]/40 text-[#023859] border border-[#54ACBF]/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Plan Status Widget Card */}
      {subscription?.tier === 'Ultimate' ? (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 text-xs space-y-2 shadow-md border border-amber-300">
          <div className="flex items-center justify-between">
            <span className="font-black flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-slate-950" /> Ultimate VIP Active
            </span>
            <span className="text-[9px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase">
              VIP Suite
            </span>
          </div>
          <p className="text-[10px] font-semibold opacity-90">
            1-on-1 Certified Dietitian Consult & Bloodwork Sync Enabled.
          </p>
          <button
            onClick={() => setActiveTab('support')}
            className="w-full py-2 rounded-full bg-slate-950 text-amber-300 font-extrabold text-[11px] hover:bg-slate-900 transition-all shadow-xs"
          >
            💬 Contact VIP Dietitian
          </button>
        </div>
      ) : subscription?.tier === 'Pro' ? (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#023859] to-[#011C40] text-white text-xs space-y-2 shadow-md border border-[#54ACBF]/40">
          <div className="flex items-center justify-between">
            <span className="font-extrabold flex items-center gap-1 text-[#A7EBF2]">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Nouriq Pro Active
            </span>
            <span className="text-[9px] bg-[#A7EBF2] text-[#023859] px-2 py-0.5 rounded-full font-black uppercase">
              Unlimited
            </span>
          </div>
          <p className="text-[10px] text-cyan-200 font-medium">
            Unlimited AI Food Scans, USDA Macro Engine & Masterclass Chef Unlocked.
          </p>
          <button
            onClick={() => setActiveTab('pricing')}
            className="w-full py-2 rounded-full bg-[#A7EBF2] text-[#023859] font-extrabold text-[11px] hover:bg-white transition-all shadow-xs"
          >
            ⭐ Upgrade to Ultimate VIP
          </button>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#023859] to-[#011C40] text-white text-xs space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-extrabold flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-[#A7EBF2]" /> Upgrade to Pro
            </span>
            <span className="text-[9px] bg-[#A7EBF2] text-[#023859] px-2 py-0.5 rounded-full font-black uppercase">
              Save 33%
            </span>
          </div>
          <p className="text-[10px] text-cyan-200 font-medium">
            Unlock unlimited AI food scans, USDA macro auto-calc, and 24/7 masterclass chef.
          </p>
          <button
            onClick={() => setActiveTab('pricing')}
            className="w-full py-2 rounded-full bg-[#A7EBF2] text-[#023859] font-extrabold text-[11px] hover:bg-white transition-all shadow-xs"
          >
            ⚡ Unlock Pro Access
          </button>
        </div>
      )}

    </aside>
  );
}
