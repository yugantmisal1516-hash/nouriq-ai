import React, { Component } from 'react';
import { NutritionProvider, useNutrition } from './context/NutritionContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FoodScanner from './components/FoodScanner';
import MealPlanner from './components/MealPlanner';
import FastingTimer from './components/FastingTimer';
import WaterTracker from './components/WaterTracker';
import GroceryList from './components/GroceryList';
import Analytics from './components/Analytics';
import AICoachChat from './components/AICoachChat';
import SupportAndPolicies from './components/SupportAndPolicies';
import PricingPlans from './components/PricingPlans';
import DietitianConsult from './components/DietitianConsult';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-4 ios-glass rounded-[28px] my-12 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-[#011C40]">Something went wrong loading this view.</h2>
          <p className="text-xs text-[#26658C] font-medium">{this.state.error?.toString()}</p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-bold"
          >
            Reload Dashboard View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainContent() {
  const nutrition = useNutrition() || {};
  const activeTab = nutrition?.activeTab || 'dashboard';

  switch (activeTab) {
    case 'dashboard': return <Dashboard />;
    case 'scanner': return <FoodScanner />;
    case 'mealplan': return <MealPlanner />;
    case 'fasting': return <FastingTimer />;
    case 'water': return <WaterTracker />;
    case 'grocery': return <GroceryList />;
    case 'analytics': return <Analytics />;
    case 'coach': return <AICoachChat />;
    case 'dietitian': return <DietitianConsult />;
    case 'pricing': return <PricingPlans />;
    case 'support': return <SupportAndPolicies />;
    default: return <Dashboard />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <NutritionProvider>
        <div className="min-h-screen bg-[#EBF9FA] text-[#011C40] font-sans relative overflow-x-hidden selection:bg-[#023859] selection:text-white">
          {/* Ambient Floating Orbs */}
          <div className="ios-bg-orb-1" />
          <div className="ios-bg-orb-2" />
          <div className="ios-bg-orb-3" />

          {/* Master Alignment Grid Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 relative z-10">
            <Navbar />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              <div className="lg:col-span-3 w-full lg:sticky lg:top-24 z-20">
                <Sidebar />
              </div>
              
              <main className="lg:col-span-9 w-full min-w-0 space-y-6">
                <ErrorBoundary>
                  <MainContent />
                </ErrorBoundary>
              </main>
            </div>
          </div>
        </div>
      </NutritionProvider>
    </ErrorBoundary>
  );
}
