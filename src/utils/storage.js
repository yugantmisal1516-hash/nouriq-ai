import { DEFAULT_USER_GOALS, SAMPLE_FOOD_ITEMS } from '../data/foodDatabase';

const STORAGE_KEYS = {
  USER_GOALS: 'nutrimind_user_goals',
  LOGGED_MEALS: 'nutrimind_logged_meals',
  WATER_INTAKE: 'nutrimind_water_intake',
  FASTING_STATE: 'nutrimind_fasting_state',
  GROCERY_ITEMS: 'nutrimind_grocery_items',
  WEIGHT_LOGS: 'nutrimind_weight_logs',
  WORKOUT_LOGS: 'nutrimind_workout_logs',
  ACTIVE_WORKOUT: 'nutrimind_active_workout'
};

const INITIAL_WORKOUT_LOGS = [
  {
    id: 'workout-seed-1',
    routineId: 'routine-ppl-push',
    routineName: 'Push Day (Chest, Shoulders, Triceps)',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durationMinutes: 44,
    totalVolumeKg: 4920,
    exercises: [
      {
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Bench Press',
        sets: [
          { setNumber: 1, weightKg: 50, reps: 10, rpe: 8, completed: true },
          { setNumber: 2, weightKg: 50, reps: 10, rpe: 8.5, completed: true },
          { setNumber: 3, weightKg: 50, reps: 10, rpe: 9, completed: true }
        ]
      },
      {
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        sets: [
          { setNumber: 1, weightKg: 18, reps: 12, rpe: 8, completed: true },
          { setNumber: 2, weightKg: 18, reps: 11, rpe: 8.5, completed: true },
          { setNumber: 3, weightKg: 18, reps: 10, rpe: 9, completed: true }
        ]
      },
      {
        exerciseId: 'dumbbell-lateral-raise',
        exerciseName: 'Dumbbell Lateral Raise',
        sets: [
          { setNumber: 1, weightKg: 8, reps: 15, rpe: 8.5, completed: true },
          { setNumber: 2, weightKg: 8, reps: 14, rpe: 9, completed: true },
          { setNumber: 3, weightKg: 8, reps: 13, rpe: 9.5, completed: true }
        ]
      },
      {
        exerciseId: 'rope-tricep-pushdown',
        exerciseName: 'Cable Rope Tricep Pushdown',
        sets: [
          { setNumber: 1, weightKg: 20, reps: 12, rpe: 8, completed: true },
          { setNumber: 2, weightKg: 20, reps: 12, rpe: 8.5, completed: true },
          { setNumber: 3, weightKg: 20, reps: 11, rpe: 9, completed: true }
        ]
      }
    ]
  }
];

// Initial Seed Data for Demo
const INITIAL_LOGGED_MEALS = [
  {
    id: 'log-1',
    date: new Date().toISOString().split('T')[0],
    time: '08:30 AM',
    food: SAMPLE_FOOD_ITEMS[0] // Salmon Toast
  },
  {
    id: 'log-2',
    date: new Date().toISOString().split('T')[0],
    time: '01:15 PM',
    food: SAMPLE_FOOD_ITEMS[1] // Chicken Quinoa Bowl
  }
];

const INITIAL_GROCERY_ITEMS = [
  { id: 'g1', name: 'Wild Atlantic Salmon Fillets', category: 'Proteins', quantity: '500g', bought: false, recommendedReason: 'High Omega-3 & B12' },
  { id: 'g2', name: 'Organic Hass Avocados', category: 'Produce', quantity: '4 units', bought: true, recommendedReason: 'Healthy Monounsaturated Fat' },
  { id: 'g3', name: 'Tri-color Quinoa', category: 'Grains & Pantry', quantity: '1 bag (500g)', bought: false, recommendedReason: 'Complete Plant Protein' },
  { id: 'g4', name: 'Organic Baby Spinach', category: 'Produce', quantity: '300g', bought: false, recommendedReason: 'Iron & Magnesium Boost' },
  { id: 'g5', name: 'Raw Pumpkin Seeds', category: 'Superfoods', quantity: '200g', bought: false, recommendedReason: 'Zinc & Magnesium Deficit Recommendation' }
];

const INITIAL_WEIGHT_LOGS = [
  { date: 'Jul 16', weight: 75.2 },
  { date: 'Jul 17', weight: 75.0 },
  { date: 'Jul 18', weight: 74.8 },
  { date: 'Jul 19', weight: 74.5 },
  { date: 'Jul 20', weight: 74.3 },
  { date: 'Jul 21', weight: 74.1 },
  { date: 'Jul 22', weight: 74.0 }
];

export function getStoredGoals() {
  const data = localStorage.getItem(STORAGE_KEYS.USER_GOALS);
  return data ? JSON.parse(data) : DEFAULT_USER_GOALS;
}

export function saveStoredGoals(goals) {
  localStorage.setItem(STORAGE_KEYS.USER_GOALS, JSON.stringify(goals));
}

export function getStoredLoggedMeals() {
  const data = localStorage.getItem(STORAGE_KEYS.LOGGED_MEALS);
  return data ? JSON.parse(data) : INITIAL_LOGGED_MEALS;
}

export function saveStoredLoggedMeals(meals) {
  localStorage.setItem(STORAGE_KEYS.LOGGED_MEALS, JSON.stringify(meals));
}

export function getStoredWaterIntake() {
  const data = localStorage.getItem(STORAGE_KEYS.WATER_INTAKE);
  const today = new Date().toISOString().split('T')[0];
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && parsed.date === today) return parsed;
    } catch (e) {}
  }
  // Reset to 0 for every new day
  const newDayWater = { date: today, currentMl: 0, history: [] };
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_INTAKE, JSON.stringify(newDayWater));
  } catch (e) {}
  return newDayWater;
}

export function saveStoredWaterIntake(waterData) {
  localStorage.setItem(STORAGE_KEYS.WATER_INTAKE, JSON.stringify(waterData));
}

export function getStoredFastingState() {
  const data = localStorage.getItem(STORAGE_KEYS.FASTING_STATE);
  if (data) return JSON.parse(data);
  
  // Default active fast starting 10 hours ago for quick interactive demo
  const startTime = Date.now() - (10.5 * 60 * 60 * 1000); 
  return {
    isFasting: true,
    protocol: '16:8',
    startTime: startTime,
    targetHours: 16,
    completedFasts: 14
  };
}

export function saveStoredFastingState(fastState) {
  localStorage.setItem(STORAGE_KEYS.FASTING_STATE, JSON.stringify(fastState));
}

export function getStoredGroceryItems() {
  const data = localStorage.getItem(STORAGE_KEYS.GROCERY_ITEMS);
  return data ? JSON.parse(data) : INITIAL_GROCERY_ITEMS;
}

export function saveStoredGroceryItems(items) {
  localStorage.setItem(STORAGE_KEYS.GROCERY_ITEMS, JSON.stringify(items));
}

export function getStoredWeightLogs() {
  const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
  return data ? JSON.parse(data) : INITIAL_WEIGHT_LOGS;
}

export function saveStoredWeightLogs(logs) {
  localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
}

export function getStoredWorkoutLogs() {
  const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
  return data ? JSON.parse(data) : INITIAL_WORKOUT_LOGS;
}

export function saveStoredWorkoutLogs(logs) {
  localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(logs));
}

export function getStoredActiveWorkout() {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  return data ? JSON.parse(data) : null;
}

export function saveStoredActiveWorkout(activeSession) {
  if (!activeSession) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeSession));
  }
}
