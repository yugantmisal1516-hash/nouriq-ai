// Food Database with sample high-res photos, macro breakdown, micro breakdown, health scores & healthier smart swaps

export const SAMPLE_FOOD_ITEMS = [
  {
    id: 'avocado-salmon-toast',
    name: 'Wild Salmon & Avocado Sourdough Toast',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    calories: 540,
    healthScore: 94,
    grade: 'A+',
    tags: ['Superfood', 'High Omega-3', 'High Protein', 'Whole Food'],
    components: [
      { name: 'Smoked Wild Salmon', weight: '90g', calories: 164, protein: 20, carbs: 0, fat: 9, bbox: { top: 20, left: 25, width: 50, height: 30 } },
      { name: 'Poached Organic Egg', weight: '1 unit (50g)', calories: 72, protein: 6, carbs: 0.5, fat: 5, bbox: { top: 35, left: 55, width: 25, height: 25 } },
      { name: 'Hass Avocado', weight: '70g', calories: 112, protein: 1.4, carbs: 6, fat: 10.5, bbox: { top: 40, left: 20, width: 35, height: 30 } },
      { name: 'Artisanal Sourdough', weight: '75g', calories: 192, protein: 7, carbs: 38, fat: 1, bbox: { top: 50, left: 15, width: 70, height: 40 } }
    ],
    macros: {
      protein: 34.4,
      carbs: 44.5,
      fats: 25.5,
      fiber: 7.2,
      sugar: 2.1,
      sodium: 680 // mg
    },
    micros: {
      vitaminA: '18% DV',
      vitaminC: '14% DV',
      vitaminD: '85% DV',
      vitaminB12: '120% DV',
      iron: '22% DV',
      calcium: '8% DV',
      omega3: '2.1g'
    },
    metrics: {
      glycemicImpact: 'Low (GI 35)',
      satietyIndex: 'Very High (88/100)',
      processingLevel: 'Unprocessed / Whole Food',
      antiInflammatory: 'High'
    },
    healthySwaps: [
      {
        title: 'Swap Sourdough for Sprouted Flax Bread',
        benefit: 'Boosts fiber by +4g and reduces net carbs by 14g',
        calorieDiff: '-45 kcal'
      },
      {
        title: 'Sprinkle Everything Bagel Seeds & Microgreens',
        benefit: 'Adds antioxidant phytonutrients and zinc without extra calories',
        calorieDiff: '+12 kcal'
      }
    ]
  },
  {
    id: 'chicken-quinoa-bowl',
    name: 'Grilled Herb Chicken & Quinoa Buddha Bowl',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    calories: 620,
    healthScore: 96,
    grade: 'A+',
    tags: ['Lean Muscle', 'High Fiber', 'Clean Eats'],
    components: [
      { name: 'Grilled Herb Chicken Breast', weight: '160g', calories: 265, protein: 49, carbs: 0, fat: 6, bbox: { top: 20, left: 20, width: 35, height: 35 } },
      { name: 'Tri-color Organic Quinoa', weight: '120g cooked', calories: 144, protein: 5, carbs: 26, fat: 2.5, bbox: { top: 45, left: 45, width: 40, height: 35 } },
      { name: 'Steamed Broccoli & Edamame', weight: '100g', calories: 75, protein: 7, carbs: 10, fat: 1.5, bbox: { top: 15, left: 55, width: 30, height: 30 } },
      { name: 'Extra Virgin Olive Oil & Lemon Dressing', weight: '15 ml', calories: 136, protein: 0, carbs: 1, fat: 15, bbox: { top: 50, left: 15, width: 25, height: 25 } }
    ],
    macros: {
      protein: 61,
      carbs: 37,
      fats: 25,
      fiber: 8.5,
      sugar: 3.2,
      sodium: 420
    },
    micros: {
      vitaminA: '45% DV',
      vitaminC: '110% DV',
      vitaminD: '2% DV',
      vitaminB12: '35% DV',
      iron: '30% DV',
      calcium: '12% DV',
      omega3: '0.4g'
    },
    metrics: {
      glycemicImpact: 'Low (GI 32)',
      satietyIndex: 'Extremely High (95/100)',
      processingLevel: 'Minimal / Fresh Whole Food',
      antiInflammatory: 'Very High'
    },
    healthySwaps: [
      {
        title: 'Use Dressing on the Side',
        benefit: 'Use half the dressing to cut 68 kcal while preserving taste',
        calorieDiff: '-68 kcal'
      },
      {
        title: 'Add Roasted Pumpkin Seeds',
        benefit: 'Provides 120mg Magnesium for muscle recovery and stress relief',
        calorieDiff: '+35 kcal'
      }
    ]
  },
  {
    id: 'berry-acai-smoothie-bowl',
    name: 'Antioxidant Wild Berry Acai Bowl',
    category: 'Breakfast / Snack',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    calories: 410,
    healthScore: 88,
    grade: 'A',
    tags: ['Antioxidant Rich', 'Vegan', 'Energy Boost'],
    components: [
      { name: 'Unsweetened Organic Acai & Wild Blueberry Puree', weight: '200g', calories: 150, protein: 3, carbs: 24, fat: 5, bbox: { top: 30, left: 20, width: 60, height: 50 } },
      { name: 'Sliced Strawberries & Bananas', weight: '90g', calories: 75, protein: 1, carbs: 18, fat: 0.3, bbox: { top: 15, left: 30, width: 40, height: 25 } },
      { name: 'Almond Butter & Chia Seeds', weight: '20g', calories: 130, protein: 4, carbs: 5, fat: 11, bbox: { top: 50, left: 55, width: 30, height: 30 } },
      { name: 'Toasted Coconut Flakes', weight: '10g', calories: 55, protein: 1, carbs: 3, fat: 5, bbox: { top: 20, left: 65, width: 20, height: 20 } }
    ],
    macros: {
      protein: 9,
      carbs: 50,
      fats: 21.3,
      fiber: 11.5,
      sugar: 22,
      sodium: 85
    },
    micros: {
      vitaminA: '12% DV',
      vitaminC: '140% DV',
      vitaminD: '0% DV',
      vitaminB12: '0% DV',
      iron: '18% DV',
      calcium: '15% DV',
      omega3: '1.8g'
    },
    metrics: {
      glycemicImpact: 'Moderate (GI 48)',
      satietyIndex: 'Moderate-High (76/100)',
      processingLevel: 'Blended Fresh Whole Foods',
      antiInflammatory: 'Maximum'
    },
    healthySwaps: [
      {
        title: 'Add 1 Scoop Vanilla Plant Protein',
        benefit: 'Boosts protein from 9g to 29g for longer satiety and muscle preservation',
        calorieDiff: '+100 kcal'
      },
      {
        title: 'Sub Honey/Granola for Cacao Nibs',
        benefit: 'Saves 12g fructose sugar while adding polyphenols and crunch',
        calorieDiff: '-40 kcal'
      }
    ]
  },
  {
    id: 'ribeye-steak-veggies',
    name: 'Grass-Fed Ribeye Steak & Roasted Asparagus',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    calories: 780,
    healthScore: 82,
    grade: 'B+',
    tags: ['Keto Friendly', 'High Protein', 'Iron Dense'],
    components: [
      { name: 'Grass-Fed Ribeye Steak', weight: '220g cooked', calories: 560, protein: 54, carbs: 0, fat: 38, bbox: { top: 25, left: 25, width: 50, height: 45 } },
      { name: 'Garlic Roasted Asparagus & Mushrooms', weight: '150g', calories: 95, protein: 5, carbs: 8, fat: 5, bbox: { top: 15, left: 15, width: 35, height: 35 } },
      { name: 'Grass-Fed Herb Butter', weight: '14g', calories: 125, protein: 0.1, carbs: 0, fat: 14, bbox: { top: 35, left: 45, width: 15, height: 15 } }
    ],
    macros: {
      protein: 59.1,
      carbs: 8,
      fats: 57,
      fiber: 4.2,
      sugar: 2.1,
      sodium: 540
    },
    micros: {
      vitaminA: '35% DV',
      vitaminC: '25% DV',
      vitaminD: '12% DV',
      vitaminB12: '210% DV',
      iron: '42% DV',
      calcium: '6% DV',
      omega3: '0.8g'
    },
    metrics: {
      glycemicImpact: 'Very Low (GI 10)',
      satietyIndex: 'Very High (90/100)',
      processingLevel: 'Whole Steak & Fresh Veggies',
      antiInflammatory: 'Moderate'
    },
    healthySwaps: [
      {
        title: 'Swap Ribeye for Sirloin or Filet Mignon',
        benefit: 'Reduces saturated fat by 18g while keeping 55g protein',
        calorieDiff: '-190 kcal'
      },
      {
        title: 'Pair with Chimichurri instead of Garlic Butter',
        benefit: 'Replaces saturated fat with monounsaturated olive oil and fresh herbs',
        calorieDiff: '-45 kcal'
      }
    ]
  },
  {
    id: 'cheeseburger-fries',
    name: 'Double Bacon Cheeseburger & Seasoned Fries',
    category: 'Dinner / Cheat Meal',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    calories: 1080,
    healthScore: 42,
    grade: 'D',
    tags: ['High Sodium', 'Ultra-Processed', 'High Calorie'],
    components: [
      { name: 'Double Beef Patties & Cheddar Cheese', weight: '220g', calories: 590, protein: 42, carbs: 2, fat: 44, bbox: { top: 20, left: 20, width: 60, height: 50 } },
      { name: 'Brioche Bun with Sauce', weight: '90g', calories: 270, protein: 6, carbs: 45, fat: 8, bbox: { top: 10, left: 20, width: 60, height: 25 } },
      { name: 'Crispy Seasoned Potato Fries', weight: '140g', calories: 380, protein: 4, carbs: 48, fat: 19, bbox: { top: 55, left: 10, width: 40, height: 35 } }
    ],
    macros: {
      protein: 52,
      carbs: 95,
      fats: 71,
      fiber: 3.5,
      sugar: 12.5,
      sodium: 1540
    },
    micros: {
      vitaminA: '8% DV',
      vitaminC: '10% DV',
      vitaminD: '4% DV',
      vitaminB12: '80% DV',
      iron: '35% DV',
      calcium: '25% DV',
      omega3: '0.1g'
    },
    metrics: {
      glycemicImpact: 'High (GI 72)',
      satietyIndex: 'Low-Moderate (48/100 - High rebound hunger)',
      processingLevel: 'Ultra-Processed Fast Food',
      antiInflammatory: 'Pro-inflammatory'
    },
    healthySwaps: [
      {
        title: 'Swap Fries for Side Caesar or Green Salad',
        benefit: 'Saves 300 kcal and cuts refined carbs by 40g',
        calorieDiff: '-300 kcal'
      },
      {
        title: 'Opt for Lettuce Wrap or Whole Grain Bun',
        benefit: 'Avoids refined sugar spike from brioche and adds dietary fiber',
        calorieDiff: '-160 kcal'
      },
      {
        title: 'Use Turkey or Lean Beef Patty',
        benefit: 'Reduces saturated fat by 50% while preserving high protein',
        calorieDiff: '-140 kcal'
      }
    ]
  }
];

export const DEFAULT_USER_GOALS = {
  name: 'Alex Rivera',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  weight: 74, // kg
  targetWeight: 70, // kg
  height: 178, // cm
  age: 28,
  gender: 'Male',
  dietType: 'High Protein / Lean Gain',
  activityLevel: 'Moderately Active (3-5 workouts/wk)',
  dailyCalorieGoal: 2200,
  dailyProteinGoal: 160, // grams
  dailyCarbGoal: 200, // grams
  dailyFatGoal: 70, // grams
  dailyWaterGoal: 3000, // ml
  dailyFiberGoal: 30, // grams
  fastingProtocol: '16:8'
};
