// 7-Day AI Meal Plan Templates customized per diet preference

export const MEAL_PLAN_DIETS = ['High Protein', 'Keto', 'Vegan', 'Mediterranean', 'Balanced'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SAMPLE_MEAL_PLANS = {
  'High Protein': {
    targetCalories: 2200,
    proteinRatio: '35%',
    carbRatio: '40%',
    fatRatio: '25%',
    description: 'Optimized for muscle synthesis, recovery, and metabolic health.',
    days: [
      {
        day: 'Monday',
        meals: [
          { type: 'Breakfast', name: 'Wild Salmon & Avocado Sourdough Toast', calories: 540, protein: 34, carbs: 44, fat: 25, prepTime: '12 min' },
          { type: 'Lunch', name: 'Grilled Herb Chicken & Quinoa Buddha Bowl', calories: 620, protein: 61, carbs: 37, fat: 25, prepTime: '20 min' },
          { type: 'Snack', name: 'Greek Yogurt with Honey & Almonds', calories: 280, protein: 22, carbs: 20, fat: 12, prepTime: '5 min' },
          { type: 'Dinner', name: 'Pan-Seared Turkey Medallions with Sweet Potato Mash', calories: 660, protein: 52, carbs: 55, fat: 18, prepTime: '25 min' }
        ]
      },
      {
        day: 'Tuesday',
        meals: [
          { type: 'Breakfast', name: 'Egg White Omelet with Spinach & Feta', calories: 380, protein: 36, carbs: 12, fat: 18, prepTime: '10 min' },
          { type: 'Lunch', name: 'Tuna Steak with Roasted Asparagus & Wild Rice', calories: 580, protein: 54, carbs: 42, fat: 16, prepTime: '22 min' },
          { type: 'Snack', name: 'Whey Protein Shake with Chia Seeds', calories: 250, protein: 30, carbs: 10, fat: 6, prepTime: '3 min' },
          { type: 'Dinner', name: 'Lean Beef Sirloin Stir-Fry with Bok Choy', calories: 690, protein: 58, carbs: 48, fat: 22, prepTime: '20 min' }
        ]
      },
      {
        day: 'Wednesday',
        meals: [
          { type: 'Breakfast', name: 'Protein Oatmeal with Peanut Butter & Berries', calories: 480, protein: 32, carbs: 52, fat: 16, prepTime: '8 min' },
          { type: 'Lunch', name: 'Cottage Cheese & Baked Chicken Breast Salad', calories: 530, protein: 56, carbs: 18, fat: 20, prepTime: '15 min' },
          { type: 'Snack', name: 'Hard Boiled Eggs & Rice Cakes', calories: 220, protein: 16, carbs: 18, fat: 9, prepTime: '5 min' },
          { type: 'Dinner', name: 'Grilled Atlantic Salmon with Cauliflower Rice', calories: 640, protein: 48, carbs: 16, fat: 38, prepTime: '20 min' }
        ]
      },
      {
        day: 'Thursday',
        meals: [
          { type: 'Breakfast', name: 'Greek Yogurt Shake with Protein & Banana', calories: 420, protein: 38, carbs: 45, fat: 8, prepTime: '5 min' },
          { type: 'Lunch', name: 'Turkey Breast & Avocado Whole Wheat Wrap', calories: 560, protein: 46, carbs: 40, fat: 20, prepTime: '10 min' },
          { type: 'Snack', name: 'Edamame Beans with Sea Salt', calories: 190, protein: 17, carbs: 14, fat: 8, prepTime: '5 min' },
          { type: 'Dinner', name: 'Shrimp Sautéed with Garlic & Zucchini Noodle Pasta', calories: 590, protein: 49, carbs: 22, fat: 18, prepTime: '18 min' }
        ]
      },
      {
        day: 'Friday',
        meals: [
          { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon & Microgreens', calories: 450, protein: 36, carbs: 6, fat: 30, prepTime: '10 min' },
          { type: 'Lunch', name: 'Chipotle Chicken Bowl with Black Beans & Guacamole', calories: 650, protein: 55, carbs: 50, fat: 24, prepTime: '15 min' },
          { type: 'Snack', name: 'Beef Jerky & Walnuts', calories: 240, protein: 20, carbs: 6, fat: 15, prepTime: '2 min' },
          { type: 'Dinner', name: 'Baked Cod with Lemon Capers & Quinoa Salad', calories: 570, protein: 50, carbs: 42, fat: 14, prepTime: '25 min' }
        ]
      },
      {
        day: 'Saturday',
        meals: [
          { type: 'Breakfast', name: 'High Protein Banana Oat Pancakes', calories: 490, protein: 35, carbs: 60, fat: 10, prepTime: '15 min' },
          { type: 'Lunch', name: 'Mediterranean Chicken Gyro Salad with Tzatziki', calories: 590, protein: 50, carbs: 24, fat: 28, prepTime: '15 min' },
          { type: 'Snack', name: 'High Protein Cottage Cheese Bowl', calories: 210, protein: 24, carbs: 12, fat: 5, prepTime: '5 min' },
          { type: 'Dinner', name: 'Grass-Fed Ribeye Steak with Roasted Asparagus', calories: 780, protein: 59, carbs: 8, fat: 57, prepTime: '25 min' }
        ]
      },
      {
        day: 'Sunday',
        meals: [
          { type: 'Breakfast', name: 'Tofu Scramble with Spinach & Avocado', calories: 410, protein: 28, carbs: 18, fat: 24, prepTime: '12 min' },
          { type: 'Lunch', name: 'Salmon Poke Bowl with Brown Rice & Edamame', calories: 640, protein: 46, carbs: 54, fat: 22, prepTime: '20 min' },
          { type: 'Snack', name: 'Protein Bar & Green Tea', calories: 210, protein: 20, carbs: 22, fat: 7, prepTime: '2 min' },
          { type: 'Dinner', name: 'Herb Roasted Pork Tenderloin with Roasted Veggies', calories: 610, protein: 52, carbs: 32, fat: 24, prepTime: '30 min' }
        ]
      }
    ]
  },

  'Keto': {
    targetCalories: 2000,
    proteinRatio: '25%',
    carbRatio: '5%',
    fatRatio: '70%',
    description: 'Ultra-low carb keto plan for deep ketosis and fat oxidation.',
    days: DAYS.map((d, i) => ({
      day: d,
      meals: [
        { type: 'Breakfast', name: `${d} Bacon & Cheddar Omelet with Avocado`, calories: 580, protein: 34, carbs: 4, fat: 48, prepTime: '10 min' },
        { type: 'Lunch', name: `${d} Keto Grilled Chicken & Guacamole Bowl`, calories: 650, protein: 48, carbs: 6, fat: 50, prepTime: '15 min' },
        { type: 'Snack', name: 'Macadamia Nuts & String Cheese', calories: 260, protein: 10, carbs: 3, fat: 24, prepTime: '2 min' },
        { type: 'Dinner', name: `${d} Ribeye Steak with Buttered Asparagus`, calories: 760, protein: 56, carbs: 5, fat: 58, prepTime: '25 min' }
      ]
    }))
  },

  'Vegan': {
    targetCalories: 2000,
    proteinRatio: '20%',
    carbRatio: '55%',
    fatRatio: '25%',
    description: '100% plant-based food high in antioxidants, fiber, and clean energy.',
    days: DAYS.map((d, i) => ({
      day: d,
      meals: [
        { type: 'Breakfast', name: `${d} Berry Acai Superfood Smoothie Bowl`, calories: 410, protein: 12, carbs: 55, fat: 16, prepTime: '10 min' },
        { type: 'Lunch', name: `${d} Tofu & Chickpea Buddha Bowl`, calories: 590, protein: 28, carbs: 62, fat: 22, prepTime: '20 min' },
        { type: 'Snack', name: 'Apple Slices with Walnut Butter', calories: 230, protein: 5, carbs: 28, fat: 12, prepTime: '5 min' },
        { type: 'Dinner', name: `${d} Lentil & Sweet Potato Curry with Quinoa`, calories: 580, protein: 32, carbs: 70, fat: 18, prepTime: '25 min' }
      ]
    }))
  },

  'Mediterranean': {
    targetCalories: 2100,
    proteinRatio: '25%',
    carbRatio: '45%',
    fatRatio: '30%',
    description: 'Heart-healthy olive oil, wild fish, legumes, and fresh herbs.',
    days: DAYS.map((d, i) => ({
      day: d,
      meals: [
        { type: 'Breakfast', name: `${d} Greek Yogurt with Figs & Walnuts`, calories: 420, protein: 24, carbs: 38, fat: 18, prepTime: '8 min' },
        { type: 'Lunch', name: `${d} Wild Salmon & Farro Salad`, calories: 610, protein: 42, carbs: 48, fat: 26, prepTime: '18 min' },
        { type: 'Snack', name: 'Hummus with Roasted Red Pepper & Pita', calories: 240, protein: 8, carbs: 32, fat: 10, prepTime: '5 min' },
        { type: 'Dinner', name: `${d} Herb Sea Bass with Lemon Olive Tapenade`, calories: 630, protein: 46, carbs: 28, fat: 34, prepTime: '22 min' }
      ]
    }))
  },

  'Balanced': {
    targetCalories: 2200,
    proteinRatio: '30%',
    carbRatio: '45%',
    fatRatio: '25%',
    description: 'Optimal macronutrient balance for daily energy and vitality.',
    days: DAYS.map((d, i) => ({
      day: d,
      meals: [
        { type: 'Breakfast', name: `${d} Whole Grain Toast with Eggs & Avocado`, calories: 460, protein: 24, carbs: 42, fat: 22, prepTime: '10 min' },
        { type: 'Lunch', name: `${d} Turkey & Avocado Quinoa Salad`, calories: 580, protein: 44, carbs: 50, fat: 20, prepTime: '15 min' },
        { type: 'Snack', name: 'Mixed Berries & Greek Yogurt', calories: 210, protein: 18, carbs: 22, fat: 5, prepTime: '3 min' },
        { type: 'Dinner', name: `${d} Grilled Chicken Breast with Roasted Sweet Potato`, calories: 640, protein: 52, carbs: 58, fat: 18, prepTime: '25 min' }
      ]
    }))
  }
};
