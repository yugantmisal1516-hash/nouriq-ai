/**
 * NOURIQ AI — ADAPTIVE WORKOUT & PROGRESSIVE OVERLOAD ALGORITHM
 * 
 * Implements:
 * 1. Double Progression Method (Autoregulated Rep/Weight Periodization)
 * 2. RPE (Rate of Perceived Exertion) and RIR (Reps in Reserve) Adaptation
 * 3. Estimated 1RM & Volume Tonnage Tracking
 * 4. Post-Workout Nutritional Recovery Calculation
 */

import { getExerciseById } from '../data/workoutDatabase';

/**
 * Calculates progressive overload recommendation for an exercise
 * based on previous session logs.
 */
export function calculateProgressiveOverload(exerciseId, pastSets = [], targetRepRange = '8-10') {
  const exercise = getExerciseById(exerciseId);
  const [minRepStr, maxRepStr] = (targetRepRange || '8-10').split('-');
  const minRep = parseInt(minRepStr, 10) || 8;
  const maxRep = parseInt(maxRepStr, 10) || 10;

  // If no past sets exist, provide intelligent starting baseline based on equipment
  if (!pastSets || pastSets.length === 0) {
    let defaultStart = 30;
    if (exercise.equipment === 'Barbell') defaultStart = 40;
    else if (exercise.equipment === 'Dumbbell') defaultStart = 12.5;
    else if (exercise.equipment === 'Cable') defaultStart = 25;
    else if (exercise.equipment === 'Bodyweight') defaultStart = 0;

    return {
      recommendedWeightKg: defaultStart,
      recommendedReps: minRep,
      status: 'INITIAL',
      badge: 'Baseline Start',
      guidanceText: `Initial calibration session: Start with ${defaultStart > 0 ? `${defaultStart}kg` : 'bodyweight'} for ${minRep}-${maxRep} controlled reps to establish your baseline.`
    };
  }

  // Filter completed sets from last session
  const validSets = pastSets.filter(s => s.completed && Number(s.weightKg) >= 0 && Number(s.reps) > 0);
  if (validSets.length === 0) {
    return {
      recommendedWeightKg: pastSets[0]?.weightKg || 20,
      recommendedReps: minRep,
      status: 'INITIAL',
      badge: 'Calibrating',
      guidanceText: 'Log your first completed set to activate AI progressive overload tracking.'
    };
  }

  // Find max weight and reps logged across completed sets
  const avgWeight = validSets.reduce((sum, s) => sum + Number(s.weightKg), 0) / validSets.length;
  const lastWeight = Number(validSets[validSets.length - 1].weightKg);
  const maxWeight = Math.max(...validSets.map(s => Number(s.weightKg)));
  const allHitMaxReps = validSets.every(s => Number(s.reps) >= maxRep);
  const avgRpe = validSets.reduce((sum, s) => sum + (Number(s.rpe) || 8), 0) / validSets.length;

  // Weight increment increment: Barbell = 2.5kg to 5kg, Dumbbell/Cable = 1kg to 2.5kg
  let increment = 2.5;
  if (exercise.equipment === 'Dumbbell') increment = 2.5; // per pair or standard jump
  else if (exercise.equipment === 'Barbell' && maxWeight >= 80) increment = 5;
  else if (exercise.equipment === 'Cable') increment = 2.5;

  // 1. PROGRESSION TRIGGER: User achieved max reps on all sets with sub-maximal RPE (<= 9)
  if (allHitMaxReps && avgRpe <= 9) {
    const nextWeight = maxWeight + increment;
    return {
      recommendedWeightKg: nextWeight,
      recommendedReps: minRep,
      status: 'PROGRESSION',
      badge: `+${increment}kg Overload 🔥`,
      guidanceText: `🎯 Progressive Overload Unlocked! You mastered ${maxWeight}kg for ${maxRep} reps across all sets last session. Increase to ${nextWeight}kg and aim for ${minRep} strict reps today.`
    };
  }

  // 2. DELOAD / RECOVERY TRIGGER: Excessive fatigue (RPE 9.5-10 or reps dropped > 30%)
  const minRepsHit = Math.min(...validSets.map(s => Number(s.reps)));
  if (avgRpe >= 9.5 || minRepsHit < (minRep - 2)) {
    const backoffWeight = Math.max(0, maxWeight - increment);
    return {
      recommendedWeightKg: backoffWeight > 0 ? backoffWeight : maxWeight,
      recommendedReps: minRep,
      status: 'DELOAD',
      badge: 'Fatigue Managed 🛡️',
      guidanceText: `High neuromuscular fatigue detected (RPE ${avgRpe.toFixed(1)}). Consolidate at ${backoffWeight}kg for ${minRep} clean reps with a 2-second eccentric phase to build technical resilience.`
    };
  }

  // 3. CONSOLIDATION / VOLUME ACCUMULATION: Stay at current weight, add reps
  return {
    recommendedWeightKg: maxWeight,
    recommendedReps: Math.min(maxRep, Math.round(avgWeight > 0 ? (minRep + 1) : minRep)),
    status: 'CONSOLIDATE',
    badge: 'Consolidate Reps ⚡',
    guidanceText: `Stick with ${maxWeight}kg today. Focus on adding 1 additional rep on your opening sets before increasing weight.`
  };
}

/**
 * Calculates Estimated 1-Rep Max using Brzycki formula:
 * 1RM = Weight / (1.0278 - (0.0278 * Reps))
 */
export function calculateOneRepMax(weightKg, reps) {
  const w = Number(weightKg) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  if (r > 20) return Math.round(w * 1.5);
  const oneRm = w / (1.0278 - (0.0278 * r));
  return Math.round(oneRm * 10) / 10;
}

/**
 * Calculates total session volume load (Tonnage = sum of weight * reps)
 */
export function calculateWorkoutVolume(exercises = []) {
  let totalVolumeKg = 0;
  let totalReps = 0;
  let completedSetsCount = 0;
  const muscleTonnage = {};

  exercises.forEach(ex => {
    const exData = getExerciseById(ex.exerciseId);
    const muscle = exData.muscleGroup || 'Full Body';
    if (!muscleTonnage[muscle]) muscleTonnage[muscle] = 0;

    (ex.sets || []).forEach(set => {
      if (set.completed && Number(set.weightKg) > 0 && Number(set.reps) > 0) {
        const setLoad = Number(set.weightKg) * Number(set.reps);
        totalVolumeKg += setLoad;
        totalReps += Number(set.reps);
        completedSetsCount++;
        muscleTonnage[muscle] += setLoad;
      }
    });
  });

  return {
    totalVolumeKg: Math.round(totalVolumeKg),
    totalReps,
    completedSetsCount,
    muscleTonnage
  };
}

/**
 * Bridges workout performance into Nouriq's nutrition recovery engine!
 * Calculates post-workout calorie & macronutrient compensation.
 */
export function calculateWorkoutRecoveryNutrition(workoutSession) {
  const { totalVolumeKg, muscleTonnage } = calculateWorkoutVolume(workoutSession.exercises || []);
  const primaryMuscle = Object.keys(muscleTonnage).sort((a, b) => muscleTonnage[b] - muscleTonnage[a])[0] || 'General';

  let bonusCalories = 220;
  let bonusProtein = 15;
  let bonusCarbs = 30;
  let recoveryHours = 36;

  // Heavy compound volume adjustments
  if (primaryMuscle === 'Legs' || totalVolumeKg > 7000) {
    bonusCalories = 380;
    bonusProtein = 25;
    bonusCarbs = 50;
    recoveryHours = 48;
  } else if (primaryMuscle === 'Back' || totalVolumeKg > 5000) {
    bonusCalories = 310;
    bonusProtein = 20;
    bonusCarbs = 40;
    recoveryHours = 48;
  } else if (primaryMuscle === 'Chest') {
    bonusCalories = 260;
    bonusProtein = 18;
    bonusCarbs = 35;
    recoveryHours = 36;
  }

  return {
    bonusCalories,
    bonusProtein,
    bonusCarbs,
    recoveryHours,
    primaryMuscle,
    totalVolumeKg,
    mealRecommendation: primaryMuscle === 'Legs' 
      ? 'High Glycogen Refuel: 250g Chicken Biryani or Paneer Rice Bowl with 200g Greek Yogurt & 1 Banana (Post-Leg Autophagy Restoration).'
      : 'Anabolic MPS Window: 30g Whey Isolate / 4 Boiled Eggs with 80g Oatmeal & Berries (Rapid Leucine Delivery).'
  };
}
