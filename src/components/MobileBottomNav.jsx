import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { 
  LayoutDashboard, 
  Camera, 
  Utensils, 
  Stethoscope, 
  Menu, 
  X, 
  Timer, 
  Droplet, 
  ShoppingCart, 
  TrendingUp, 
  Bot, 
  Crown, 
  HelpCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, subscription } = useNutrition();
  const [showDrawer, setShowDrawer] = useState(false);

  const isPro = subscription?.tier === 'Pro' || subscription?.tier === 'Ultimate';

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'mealplan', label: 'Meal Plan', icon: Utensils },
    { id: 'scanner', label: 'Scanner', icon: Camera, isAction: true },
    { id: 'dietitian', label: 'VIP Room', icon: Stethoscope, badge: '⭐' },
    { id: 'menu', label: 'Menu', icon: Menu, isMenu: true }
  ];

  const drawerItems = [
    { id: 'fasting', label: 'Fasting Timer', icon: Timer, badge: 'Live' },
    { id: 'water', label: 'Water Tracker', icon: Droplet },
    { id: 'grocery', label: 'Smart Grocery', icon: ShoppingCart },
    { id: 'analytics', label: 'Progress Analytics', icon: TrendingUp, badge: 'Reports' },
    { id: 'coach', label: 'AI Masterclass Chef', icon: Bot, badge: 'Zero-Error' },
    { id: 'pricing', label: 'Pricing & Membership', icon: Crown, badge: isPro ? 'Active' : 'Save 33%' },
    { id: 'support', label: 'Customer Support', icon: HelpCircle, badge: 'Stripe' },
  ];

  const handleNavClick = (item) => {
    if (item.isMenu) {
      setShowDrawer(!showDrawer);
    } else {
      setActiveTab(item.id);
      setShowDrawer(false);
    }
  };

  return (
    <>
      {/* MOBILE BOTTOM NATIVE DOCK BAR (Visible on screens < lg) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-3 pb-3 pt-1 pointer-events-auto flex justify-center">
        <div className="ios-glass rounded-[28px] px-2 py-2 max-w-md w-full grid grid-cols-5 items-center justify-items-center shadow-2xl border border-[#54ACBF]/50 bg-white/95 backdrop-blur-2xl">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id && !showDrawer;
            const isMenuActive = item.isMenu && showDrawer;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center relative -top-3 group w-full"
                >
                  <div className="w-12 h-12 rounded-full bg-[#023859] border-2 border-white flex items-center justify-center shadow-lg group-active:scale-95 transition-all">
                    <Camera className="w-6 h-6 text-[#A7EBF2]" />
                  </div>
                  <span className="text-[9px] font-extrabold text-[#023859] mt-0.5 tracking-tight">Scanner</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center w-full py-1 rounded-2xl transition-all active:scale-95 relative ${
                  isActive || isMenuActive
                    ? 'text-[#023859] font-black'
                    : 'text-[#26658C] font-semibold hover:text-[#011C40]'
                }`}
              >
                <IconComp className={`w-5 h-5 ${isActive || isMenuActive ? 'text-[#023859] stroke-[2.5]' : 'text-[#26658C]'}`} />
                <span className="text-[10px] mt-0.5 leading-none tracking-tight">{item.label}</span>
                {(isActive || isMenuActive) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#023859] absolute -bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE APP SLIDE-UP DRAWER MENU */}
      {showDrawer && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-end bg-[#011C40]/60 backdrop-blur-md animate-fade-in">
          <div className="ios-glass rounded-t-[32px] p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-[#54ACBF] bg-white/95 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#023859] text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#A7EBF2]" />
                </div>
                <span className="font-extrabold text-sm text-[#011C40]">Nouriq Features & Tools</span>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 rounded-full liquid-glass-btn flex items-center justify-center text-[#26658C] hover:text-[#011C40]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {drawerItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowDrawer(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs transition-all active:scale-98 ${
                      isActive
                        ? 'bg-[#023859] text-white font-extrabold shadow-sm'
                        : 'ios-glass-card text-[#011C40] hover:bg-[#A7EBF2]/40 font-semibold border-[#54ACBF]/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-[#A7EBF2]/40'}`}>
                        <IconComp className={`w-4 h-4 ${isActive ? 'text-[#A7EBF2]' : 'text-[#023859]'}`} />
                      </div>
                      <span className="font-bold text-xs">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#A7EBF2] text-[#023859]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#26658C]'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
