/**
 * NOURIQ AI — ADAPTIVE WORKOUT & PROGRESSIVE OVERLOAD EXERCISE LIBRARY
 * Built for 18–35-year-old gym trainees training 3–6x/week without a personal trainer.
 * Includes form cues, equipment tags, and busy gym substitutes.
 */

export const EXERCISE_DATABASE = [
  // CHEST
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    primaryMuscle: 'Pectoralis Major (Mid/Lower)',
    secondaryMuscles: ['Triceps Brachii', 'Anterior Deltoid'],
    equipment: 'Barbell',
    defaultSets: 3,
    targetRepRange: '8-10',
    formCue: 'Retract scapulae, maintain slight lower back arch, bar touches mid-sternum, drive through feet.',
    substitutes: ['dumbbell-bench-press', 'smith-machine-bench-press', 'machine-chest-press']
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    primaryMuscle: 'Clavicular Pectoralis (Upper Chest)',
    secondaryMuscles: ['Anterior Deltoid', 'Triceps'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-12',
    formCue: 'Bench angle at 30 degrees. Flaring elbows at ~45 degrees protects shoulders.',
    substitutes: ['incline-barbell-press', 'incline-smith-press', 'cable-low-to-high-fly']
  },
  {
    id: 'cable-chest-fly',
    name: 'Cable Chest Fly',
    muscleGroup: 'Chest',
    primaryMuscle: 'Pectoralis Major (Sternal)',
    secondaryMuscles: ['Anterior Deltoid'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Slight bend in elbows, imagine hugging a large barrel, peak squeeze at midline.',
    substitutes: ['pec-deck-machine', 'dumbbell-fly', 'resistance-band-fly']
  },

  // BACK
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown (Wide Grip)',
    muscleGroup: 'Back',
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps Brachii', 'Brachialis', 'Rear Deltoid'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '8-12',
    formCue: 'Lead with elbows pulling to your collarbone, avoid excessive swinging back.',
    substitutes: ['pull-up', 'assisted-pull-up', 'single-arm-lat-pulldown']
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    primaryMuscle: 'Rhomboids & Mid-Traps',
    secondaryMuscles: ['Latissimus Dorsi', 'Biceps'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Chest tall, pull handle to belly button, squeeze shoulder blades for 1 sec.',
    substitutes: ['chest-supported-t-bar-row', 'one-arm-dumbbell-row', 'barbell-bent-over-row']
  },
  {
    id: 'one-arm-dumbbell-row',
    name: 'One-Arm Dumbbell Row',
    muscleGroup: 'Back',
    primaryMuscle: 'Latissimus Dorsi & Upper Back',
    secondaryMuscles: ['Forearms', 'Biceps'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-10',
    formCue: 'Pull dumbbell toward your hip pocket, keep back flat parallel to floor.',
    substitutes: ['seated-cable-row', 'machine-row', 't-bar-row']
  },
  {
    id: 'barbell-deadlift',
    name: 'Conventional Barbell Deadlift',
    muscleGroup: 'Back',
    primaryMuscle: 'Posterior Chain (Glutes, Hamstrings, Erector Spinae)',
    secondaryMuscles: ['Traps', 'Lats', 'Forearms', 'Core'],
    equipment: 'Barbell',
    defaultSets: 3,
    targetRepRange: '5-6',
    formCue: 'Bar over mid-foot, hinge at hips, pull slack out of bar before driving floor away.',
    substitutes: ['trap-bar-deadlift', 'romanian-deadlift', 'dumbbell-deadlift']
  },

  // LEGS - QUADS
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    primaryMuscle: 'Quadriceps Femoris',
    secondaryMuscles: ['Gluteus Maximus', 'Adductors', 'Calves', 'Spinal Erectors'],
    equipment: 'Barbell',
    defaultSets: 4,
    targetRepRange: '6-8',
    formCue: 'Brace core 360°, break hips and knees simultaneously, hit parallel depth.',
    substitutes: ['hack-squat', 'leg-press', 'goblet-squat', 'smith-machine-squat']
  },
  {
    id: 'leg-press',
    name: 'Angled Leg Press',
    muscleGroup: 'Legs',
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes'],
    equipment: 'Machine',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Feet shoulder-width on platform, don\'t lock knees at the top, lower smoothly.',
    substitutes: ['hack-squat', 'goblet-squat', 'barbell-back-squat']
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension Machine',
    muscleGroup: 'Legs',
    primaryMuscle: 'Quadriceps (Rectus Femoris isolation)',
    secondaryMuscles: [],
    equipment: 'Machine',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Pause for 1 full second at top contraction, control the 3-second descent.',
    substitutes: ['sissy-squat', 'dumbbell-step-up', 'bodyweight-wall-sit']
  },

  // LEGS - POSTERIOR CHAIN
  {
    id: 'romanian-deadlift',
    name: 'Dumbbell / Barbell Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    primaryMuscle: 'Hamstrings & Gluteus Maximus',
    secondaryMuscles: ['Erector Spinae'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-10',
    formCue: 'Push hips straight back like closing a door, keep weights scraping along thighs.',
    substitutes: ['lying-leg-curl', 'seated-leg-curl', 'good-morning']
  },
  {
    id: 'seated-leg-curl',
    name: 'Seated Hamstring Curl',
    muscleGroup: 'Legs',
    primaryMuscle: 'Hamstrings (Knee Flexion)',
    secondaryMuscles: ['Calves'],
    equipment: 'Machine',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Lean slightly forward to increase hamstring stretch, curl forcefully.',
    substitutes: ['lying-leg-curl', 'dumbbell-lying-hamstring-curl', 'swiss-ball-leg-curl']
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    muscleGroup: 'Legs',
    primaryMuscle: 'Gastrocnemius (Calves)',
    secondaryMuscles: ['Soleus'],
    equipment: 'Machine',
    defaultSets: 4,
    targetRepRange: '12-15',
    formCue: 'Get full stretch at bottom for 1 sec, rise up onto balls of big toes.',
    substitutes: ['seated-calf-raise', 'leg-press-calf-raise', 'dumbbell-single-leg-calf-raise']
  },

  // SHOULDERS
  {
    id: 'overhead-dumbbell-press',
    name: 'Seated Overhead Dumbbell Press',
    muscleGroup: 'Shoulders',
    primaryMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps', 'Upper Traps'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-10',
    formCue: 'Keep elbows slightly in front of shoulders, press straight up without clicking weights.',
    substitutes: ['overhead-barbell-press', 'machine-shoulder-press', 'arnold-press']
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    primaryMuscle: 'Lateral Deltoid (Side Delt Width)',
    secondaryMuscles: ['Upper Traps'],
    equipment: 'Dumbbell',
    defaultSets: 4,
    targetRepRange: '12-15',
    formCue: 'Lead with elbows, raise to parallel, don\'t shrug shoulders up into neck.',
    substitutes: ['cable-lateral-raise', 'machine-lateral-raise', 'resistance-band-lateral-raise']
  },
  {
    id: 'face-pull',
    name: 'Rope Face Pull',
    muscleGroup: 'Shoulders',
    primaryMuscle: 'Posterior Deltoid & Infraspinatus',
    secondaryMuscles: ['Rhomboids', 'Middle Traps'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '15-20',
    formCue: 'Pull rope toward eye level while externally rotating hands back (double biceps pose).',
    substitutes: ['reverse-pec-deck', 'bent-over-rear-delt-fly', 'band-pull-apart']
  },

  // ARMS
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Bicep Curl',
    muscleGroup: 'Arms',
    primaryMuscle: 'Biceps Brachii (Long Head)',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Full stretch at bottom, keep upper arms locked vertically behind torso.',
    substitutes: ['barbell-curl', 'cable-bicep-curl', 'preacher-curl']
  },
  {
    id: 'rope-tricep-pushdown',
    name: 'Cable Rope Tricep Pushdown',
    muscleGroup: 'Arms',
    primaryMuscle: 'Triceps (Lateral & Medial Heads)',
    secondaryMuscles: [],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Pin elbows to your ribs, spread the rope apart at bottom lockout.',
    substitutes: ['skull-crushers', 'overhead-cable-tricep-extension', 'parallel-bar-dips']
  },
  {
    id: 'overhead-cable-tricep-extension',
    name: 'Overhead Cable Tricep Extension',
    muscleGroup: 'Arms',
    primaryMuscle: 'Triceps (Long Head)',
    secondaryMuscles: [],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Extend arms forward and up, allowing deep stretch behind the head.',
    substitutes: ['dumbbell-overhead-extension', 'ez-bar-skull-crushers', 'bench-dips']
  },
  {
    id: 'hammer-curl',
    name: 'Dumbbell Hammer Curl',
    muscleGroup: 'Arms',
    primaryMuscle: 'Brachialis & Brachioradialis (Forearm & Arm Thickness)',
    secondaryMuscles: ['Biceps'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Palms facing each other throughout the movement, control the eccentric lowering.',
    substitutes: ['cable-rope-hammer-curl', 'reverse-curl', 'cross-body-hammer-curl']
  },

  // CORE
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg / Knee Raise',
    muscleGroup: 'Core',
    primaryMuscle: 'Rectus Abdominis (Lower)',
    secondaryMuscles: ['Hip Flexors', 'Obliques'],
    equipment: 'Bodyweight',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Tilt pelvis up toward ribs rather than just swinging legs.',
    substitutes: ['captain-chair-knee-raise', 'decline-bench-reverse-crunch', 'ab-wheel-rollout']
  },
  {
    id: 'cable-woodchopper',
    name: 'Cable High-to-Low Woodchopper',
    muscleGroup: 'Core',
    primaryMuscle: 'Internal & External Obliques',
    secondaryMuscles: ['Transverse Abdominis'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Rotate through the torso while keeping hips relatively stable, brace abs.',
    substitutes: ['russian-twist', 'side-plank-dips', 'bicycle-crunches']
  }
];

// PRE-BUILT PROVEN SPLITS FOR INDIAN GYM GOERS (3-6 DAYS/WEEK)
export const WORKOUT_ROUTINES = [
  {
    id: 'routine-ppl-push',
    name: 'Push Day (Chest, Shoulders, Triceps)',
    splitType: 'Push / Pull / Legs',
    level: 'Beginner to Intermediate',
    estimatedTimeMin: 45,
    targetMuscles: 'Chest, Front/Side Delts, Triceps',
    frequency: '1-2x / week',
    description: 'Designed for chest thickness and 3D shoulder width with progressive overload on presses.',
    exercises: [
      { exerciseId: 'barbell-bench-press', targetSets: 3, targetReps: '8-10', targetRpe: 8 },
      { exerciseId: 'incline-dumbbell-press', targetSets: 3, targetReps: '8-12', targetRpe: 8.5 },
      { exerciseId: 'overhead-dumbbell-press', targetSets: 3, targetReps: '8-10', targetRpe: 8 },
      { exerciseId: 'dumbbell-lateral-raise', targetSets: 4, targetReps: '12-15', targetRpe: 9 },
      { exerciseId: 'rope-tricep-pushdown', targetSets: 3, targetReps: '10-12', targetRpe: 9 }
    ]
  },
  {
    id: 'routine-ppl-pull',
    name: 'Pull Day (Back, Rear Delts, Biceps)',
    splitType: 'Push / Pull / Legs',
    level: 'Beginner to Intermediate',
    estimatedTimeMin: 45,
    targetMuscles: 'Lats, Upper Back, Rear Delts, Biceps',
    frequency: '1-2x / week',
    description: 'Builds a V-taper back, improves desk posture, and adds arm peak size.',
    exercises: [
      { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '8-12', targetRpe: 8 },
      { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10-12', targetRpe: 8.5 },
      { exerciseId: 'face-pull', targetSets: 3, targetReps: '15-20', targetRpe: 9 },
      { exerciseId: 'incline-dumbbell-curl', targetSets: 3, targetReps: '10-12', targetRpe: 8.5 },
      { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10-12', targetRpe: 9 }
    ]
  },
  {
    id: 'routine-ppl-legs',
    name: 'Legs & Core Hypertrophy',
    splitType: 'Push / Pull / Legs',
    level: 'Beginner to Intermediate',
    estimatedTimeMin: 50,
    targetMuscles: 'Quads, Hamstrings, Glutes, Calves, Abs',
    frequency: '1-2x / week',
    description: 'High metabolic stimulus for building lower body strength and anabolic hormone release.',
    exercises: [
      { exerciseId: 'barbell-back-squat', targetSets: 4, targetReps: '6-8', targetRpe: 8 },
      { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '8-10', targetRpe: 8.5 },
      { exerciseId: 'leg-press', targetSets: 3, targetReps: '10-12', targetRpe: 8.5 },
      { exerciseId: 'seated-leg-curl', targetSets: 3, targetReps: '10-12', targetRpe: 9 },
      { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '12-15', targetRpe: 9 },
      { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '12-15', targetRpe: 8.5 }
    ]
  },
  {
    id: 'routine-full-body-beginner',
    name: 'Full Body Foundation (3-Day Split)',
    splitType: 'Full Body',
    level: 'Absolute Beginner',
    estimatedTimeMin: 40,
    targetMuscles: 'Chest, Back, Quads, Shoulders, Core',
    frequency: '3x / week (Alt Days)',
    description: 'The fastest, scientifically validated way for gym beginners to build muscle and master foundational movement patterns.',
    exercises: [
      { exerciseId: 'barbell-bench-press', targetSets: 3, targetReps: '8-10', targetRpe: 7.5 },
      { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10-12', targetRpe: 8 },
      { exerciseId: 'leg-press', targetSets: 3, targetReps: '10-12', targetRpe: 8 },
      { exerciseId: 'dumbbell-lateral-raise', targetSets: 3, targetReps: '12-15', targetRpe: 8.5 },
      { exerciseId: 'incline-dumbbell-curl', targetSets: 2, targetReps: '10-12', targetRpe: 8.5 },
      { exerciseId: 'rope-tricep-pushdown', targetSets: 2, targetReps: '10-12', targetRpe: 8.5 }
    ]
  },
  {
    id: 'routine-upper-body-power',
    name: 'Upper Body Power & Hypertrophy',
    splitType: 'Upper / Lower',
    level: 'Intermediate',
    estimatedTimeMin: 50,
    targetMuscles: 'Chest, Upper Back, Deltoids, Arms',
    frequency: '2x / week',
    description: 'Combines heavy compound strength work with metabolic hypertrophy arm finishers.',
    exercises: [
      { exerciseId: 'barbell-bench-press', targetSets: 3, targetReps: '6-8', targetRpe: 8.5 },
      { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '8-10', targetRpe: 8.5 },
      { exerciseId: 'overhead-dumbbell-press', targetSets: 3, targetReps: '8-10', targetRpe: 8 },
      { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10-12', targetRpe: 8.5 },
      { exerciseId: 'overhead-cable-tricep-extension', targetSets: 3, targetReps: '12-15', targetRpe: 9 },
      { exerciseId: 'incline-dumbbell-curl', targetSets: 3, targetReps: '10-12', targetRpe: 9 }
    ]
  }
];

export function getExerciseById(id) {
  return EXERCISE_DATABASE.find(e => e.id === id) || {
    id: id,
    name: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    muscleGroup: 'Full Body',
    primaryMuscle: 'General Muscle Group',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-12',
    formCue: 'Control the movement, full range of motion.',
    substitutes: []
  };
}
