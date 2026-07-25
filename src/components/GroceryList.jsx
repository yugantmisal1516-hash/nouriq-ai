import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Plus, Check, Trash2, Sparkles, AlertCircle, Copy, Lock } from 'lucide-react';

export default function GroceryList() {
  const nutrition = useNutrition() || {};
  const { groceryItems = [], toggleGroceryItem = () => {}, addGroceryItem = () => {}, removeGroceryItem = () => {}, subscription = { tier: 'Free' }, setActiveTab = () => {} } = nutrition;
  
  const isPro = subscription?.tier === 'Pro' || subscription?.tier === 'Ultimate';

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [copied, setCopied] = useState(false);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItemName.trim()) {
      addGroceryItem({
        name: newItemName,
        category: newItemCategory,
        quantity: '1 Pack',
        recommendedReason: 'Manually added to shopping list'
      });
      setNewItemName('');
    }
  };

  const categories = ['Produce', 'Proteins', 'Healthy Fats', 'Grains & Pantry', 'Superfoods', 'Meal Prep Ingredients'];

  const copyToClipboard = () => {
    const text = groceryItems
      .map(i => `${i.bought ? '[x]' : '[ ]'} ${i.name} (${i.category}) - ${i.quantity}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      <div className="ios-glass p-6 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full liquid-glass-btn liquid-glass-btn-active text-emerald-900 text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Smart Micronutrient Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Smart Grocery List</h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">Auto-generated shopping list compiled from your 7-day meal plan & nutrient deficits.</p>
        </div>

        <button
          onClick={copyToClipboard}
          className="px-4 py-2.5 rounded-full liquid-glass-btn text-stone-800 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 hover:scale-105"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied List!' : 'Export List'}</span>
        </button>
      </div>

      {/* AI Nutrient Deficit Insight - Gated for Pro & Ultimate Subscribers Only */}
      {!isPro ? (
        <div className="ios-glass p-6 rounded-[32px] border border-[#54ACBF]/50 space-y-3 shadow-sm text-center">
          <div className="flex items-center justify-between border-b border-[#54ACBF]/30 pb-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="font-extrabold text-[#011C40] text-xs">AI Nutrient Deficit Insight</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs">
              <Lock className="w-3 h-3 text-slate-950" /> ⭐ Pro Plan Exclusive
            </span>
          </div>

          <div className="p-4 rounded-2xl ios-glass-card space-y-3 border border-[#54ACBF]/30">
            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-sm">
              <Lock className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#011C40]">AI Micronutrient Deficit Insights Locked</h4>
              <p className="text-[11px] text-[#26658C] font-medium mt-1 leading-relaxed max-w-lg mx-auto">
                Automated micronutrient deficit detection (Magnesium, Iron, Zinc, Omega-3) and AI-targeted grocery recommendations are exclusive to <strong className="text-[#023859]">Pro & Pro+ Ultimate Coach</strong> subscribers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('pricing')}
              className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 max-w-md mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>👑 Upgrade to Pro to Unlock AI Deficit Insights ($14.99/mo)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="ios-glass p-5 rounded-[32px] border border-amber-500/30 bg-amber-500/10 flex items-start space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-full liquid-glass-btn flex items-center justify-center text-amber-700 shrink-0 border border-amber-500/30">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <span className="font-extrabold text-stone-900 text-sm block">AI Nutrient Deficit Insight</span>
            <p className="text-stone-600 leading-relaxed font-medium">
              Based on your recent logs, your <strong className="text-stone-900">Magnesium & Iron</strong> intake was 18% below your optimal target. We've automatically added <strong>Organic Baby Spinach</strong> & <strong>Raw Pumpkin Seeds</strong> to your grocery list.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleAddItem} className="ios-glass p-4 rounded-[32px] flex flex-col md:flex-row items-center gap-3 shadow-2xl">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add grocery item (e.g. Greek Yogurt, Chia Seeds)..."
          className="flex-1 w-full bg-white/70 border border-white rounded-2xl px-4 py-2.5 text-xs text-stone-900 font-bold focus:outline-none shadow-sm"
        />

        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value)}
          className="w-full md:w-44 bg-white/70 border border-white rounded-2xl px-3 py-2.5 text-xs text-stone-900 font-bold focus:outline-none shadow-sm"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2.5 liquid-glass-btn liquid-glass-btn-active text-emerald-950 font-extrabold text-xs rounded-full flex items-center justify-center gap-1 shrink-0 shadow-md active:scale-95 hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </form>

      <div className="space-y-6">
        {categories.map((cat) => {
          const itemsInCat = groceryItems.filter(i => i.category === cat);
          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat} className="ios-glass p-5 rounded-[32px] space-y-3 shadow-2xl">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                {cat} ({itemsInCat.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {itemsInCat.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleGroceryItem(item.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      item.bought
                        ? 'bg-stone-100/40 border-stone-200 text-stone-400 line-through'
                        : 'ios-glass-card hover:bg-white text-stone-900 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        item.bought ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                      }`}>
                        {item.bought && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="font-extrabold text-xs block">{item.name}</span>
                        {item.recommendedReason && (
                          <span className="text-[10px] text-emerald-700 font-bold block">{item.recommendedReason}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full liquid-glass-btn text-stone-600">
                        {item.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGroceryItem(item.id);
                        }}
                        className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
