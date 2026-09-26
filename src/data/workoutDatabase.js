/**
 * NOURIQ AI — ADAPTIVE WORKOUT & PROGRESSIVE OVERLOAD EXERCISE LIBRARY
 * Built for 18–35-year-old gym trainees training 3–6x/week without a personal trainer.
 * Includes 3D kinematic tags, form cues, breathing cadence, and busy gym substitutes.
 */

export const EXERCISE_DATABASE = [
  // CHEST
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    kinematicType: 'bench-press',
    primaryMuscle: 'Pectoralis Major (Mid/Lower)',
    secondaryMuscles: ['Triceps Brachii', 'Anterior Deltoid'],
    equipment: 'Barbell',
    defaultSets: 3,
    targetRepRange: '8-10',
    formCue: 'Retract scapulae, maintain slight lower back arch, bar touches mid-sternum, drive through feet.',
    breathingCue: 'Inhale into belly & brace core at the top. Lower bar with control. Exhale past the sticking point.',
    setupSteps: [
      'Lie eyes directly beneath the bar. Retract and depress shoulder blades into the bench.',
      'Grip the bar slightly wider than shoulder width (wrists straight, over elbows).',
      'Plant feet flat on the floor to generate leg drive without lifting hips off the bench.'
    ],
    keyMistakes: [
      'Flaring elbows out to 90° (causes extreme rotator cuff strain; keep at ~45°-60°).',
      'Bouncing the bar violently off the sternum instead of a controlled touch.',
      'Allowing wrists to bend backwards under the bar weight.'
    ],
    substitutes: ['dumbbell-bench-press', 'smith-machine-bench-press', 'machine-chest-press']
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    kinematicType: 'incline-press',
    primaryMuscle: 'Clavicular Pectoralis (Upper Chest)',
    secondaryMuscles: ['Anterior Deltoid', 'Triceps'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-12',
    formCue: 'Bench angle at 30 degrees. Flaring elbows at ~45 degrees protects shoulders.',
    breathingCue: 'Inhale as dumbbells descend to collarbone level; exhale as you press up and slightly together.',
    setupSteps: [
      'Set bench to a 30° incline (higher than 45° shifts load almost entirely to shoulders).',
      'Kick dumbbells up with your knees as you lie back, keeping shoulder blades pinched.',
      'Start with weights directly over upper chest with palms facing slightly inward.'
    ],
    keyMistakes: [
      'Setting bench angle too steep (>45°), turning it into a shoulder press.',
      'Clanking dumbbells together at the top (unnecessary and releases tension).',
      'Dropping elbows too low and overstretching the anterior shoulder capsule.'
    ],
    substitutes: ['incline-barbell-press', 'incline-smith-press', 'cable-low-to-high-fly']
  },
  {
    id: 'cable-chest-fly',
    name: 'Cable Chest Fly',
    muscleGroup: 'Chest',
    kinematicType: 'chest-fly',
    primaryMuscle: 'Pectoralis Major (Sternal)',
    secondaryMuscles: ['Anterior Deltoid'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Slight bend in elbows, imagine hugging a large barrel, peak squeeze at midline.',
    breathingCue: 'Inhale as arms open wide feeling deep stretch; exhale as hands squeeze together at center.',
    setupSteps: [
      'Set cable pulleys at chest height. Take one handle in each hand and step forward one pace.',
      'Adopt a staggered split stance for torso stability with a slight forward lean.',
      'Maintain a soft 15° bend in elbows that stays frozen throughout the entire rep.'
    ],
    keyMistakes: [
      'Turning the fly into a press by excessively bending and extending elbows.',
      'Using momentum and swinging your torso back and forth.',
      'Over-stretching past shoulder flexibility on the eccentric phase.'
    ],
    substitutes: ['pec-deck-machine', 'dumbbell-fly', 'resistance-band-fly']
  },

  // BACK
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown (Wide Grip)',
    muscleGroup: 'Back',
    kinematicType: 'lat-pulldown',
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps Brachii', 'Brachialis', 'Rear Deltoid'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '8-12',
    formCue: 'Lead with elbows pulling to your collarbone, avoid excessive swinging back.',
    breathingCue: 'Inhale on the stretch at the top; exhale as you pull the bar down to upper chest.',
    setupSteps: [
      'Adjust thigh pad so your knees are firmly anchored with feet flat on the floor.',
      'Grip the bar slightly wider than shoulder width with an overhand thumb-around grip.',
      'Lean back just 10°-15° with chest puffed up high toward the ceiling.'
    ],
    keyMistakes: [
      'Leaning back 45° and turning the pulldown into a sloppy horizontal row.',
      'Pulling the bar behind the neck (dangerous cervical spine impingement).',
      'Yanking with arms instead of initiating with scapular depression and driving elbows down.'
    ],
    substitutes: ['pull-up', 'assisted-pull-up', 'single-arm-lat-pulldown']
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    kinematicType: 'seated-row',
    primaryMuscle: 'Rhomboids & Mid-Traps',
    secondaryMuscles: ['Latissimus Dorsi', 'Biceps'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Chest tall, pull handle to belly button, squeeze shoulder blades for 1 sec.',
    breathingCue: 'Inhale as arms extend forward with back flat; exhale as you pull handle to lower abdomen.',
    setupSteps: [
      'Sit with knees slightly bent on footplates. Keep torso vertical with natural spine arch.',
      'Grab V-bar attachment with arms extended and chest proud.',
      'Initiate pull by retracting scapulae, pulling elbows tight along your ribcage.'
    ],
    keyMistakes: [
      'Rocking back and forth from lower back like a rowing boat.',
      'Shrugging shoulders upward into ears instead of pulling back and down.',
      'Rounding lower spine during the forward reach.'
    ],
    substitutes: ['chest-supported-t-bar-row', 'one-arm-dumbbell-row', 'barbell-bent-over-row']
  },
  {
    id: 'one-arm-dumbbell-row',
    name: 'One-Arm Dumbbell Row',
    muscleGroup: 'Back',
    kinematicType: 'one-arm-row',
    primaryMuscle: 'Latissimus Dorsi & Upper Back',
    secondaryMuscles: ['Forearms', 'Biceps'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-10',
    formCue: 'Pull dumbbell toward your hip pocket, keep back flat parallel to floor.',
    breathingCue: 'Inhale at bottom stretch; exhale as you pull dumbbell up toward your hip.',
    setupSteps: [
      'Place one knee and same-side hand firmly on a flat bench for a stable tripod base.',
      'Keep other foot planted out to the side with back straight parallel to the floor.',
      'Grab dumbbell with free hand, letting arm hang down under shoulder.'
    ],
    keyMistakes: [
      'Pulling straight up to the chest instead of arcing back toward the hip.',
      'Rotating torso excessively to heave the dumbbell up.',
      'Allowing lower back to hunch or twist under load.'
    ],
    substitutes: ['seated-cable-row', 'machine-row', 't-bar-row']
  },
  {
    id: 'barbell-deadlift',
    name: 'Conventional Barbell Deadlift',
    muscleGroup: 'Back',
    kinematicType: 'deadlift',
    primaryMuscle: 'Posterior Chain (Glutes, Hamstrings, Erector Spinae)',
    secondaryMuscles: ['Traps', 'Lats', 'Forearms', 'Core'],
    equipment: 'Barbell',
    defaultSets: 3,
    targetRepRange: '5-6',
    formCue: 'Bar over mid-foot, hinge at hips, pull slack out of bar before driving floor away.',
    breathingCue: 'Huge diaphragmatic breath at the bottom, brace abs 360°, hold breath during pull, exhale at lockout.',
    setupSteps: [
      'Stand with mid-foot directly under the bar (bar ~1 inch from shins), hip-width stance.',
      'Hinge at hips, reach down and grip bar just outside knees without moving the barbell.',
      'Bring shins forward to touch the bar, pull chest tall, engage lats ("squeeze oranges in armpits").'
    ],
    keyMistakes: [
      'Rounding lumbar spine like a fishing rod (extreme disc herniation risk).',
      'Jerking the bar off the floor instead of smoothly building tension and wedging hips.',
      'Hyperextending and leaning backward at the top lockout.'
    ],
    substitutes: ['trap-bar-deadlift', 'romanian-deadlift', 'dumbbell-deadlift']
  },

  // LEGS - QUADS
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    kinematicType: 'squat',
    primaryMuscle: 'Quadriceps Femoris',
    secondaryMuscles: ['Gluteus Maximus', 'Adductors', 'Calves', 'Spinal Erectors'],
    equipment: 'Barbell',
    defaultSets: 4,
    targetRepRange: '6-8',
    formCue: 'Brace core 360°, break hips and knees simultaneously, hit parallel depth.',
    breathingCue: 'Deep belly breath and lock brace before descending. Hold breath down, exhale through sticking point on drive.',
    setupSteps: [
      'Step under bar, rest it across upper traps (high bar) or rear delts (low bar), grip tight.',
      'Unrack with both feet even, take exactly 2-3 steps back into shoulder-width stance.',
      'Point toes out 15°-30°, screw feet into the floor to activate hip external rotators.'
    ],
    keyMistakes: [
      'Knees caving inward (valgus collapse) on the ascent.',
      'Shifting weight onto toes so heels lift off the floor.',
      'Cutting depth short before hip crease descends level with top of knee.'
    ],
    substitutes: ['hack-squat', 'leg-press', 'goblet-squat', 'smith-machine-squat']
  },
  {
    id: 'leg-press',
    name: 'Angled Leg Press',
    muscleGroup: 'Legs',
    kinematicType: 'squat',
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes'],
    equipment: 'Machine',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Feet shoulder-width on platform, don\'t lock knees at the top, lower smoothly.',
    breathingCue: 'Inhale as platform lowers toward chest; exhale as you press platform away with heels and midfoot.',
    setupSteps: [
      'Sit all the way back into the seat with lower back pinned firmly against pad.',
      'Place feet shoulder-width on platform, toes angled slightly outward.',
      'Release safety handles and lower carriage smoothly until knees reach 90° angle.'
    ],
    keyMistakes: [
      'Allowing pelvis/glutes to curl off the seat at the bottom (causes severe lumbar strain).',
      'Violently hyperextending and locking knees out at the top of the rep.',
      'Pushing solely through toes rather than driving through whole foot.'
    ],
    substitutes: ['hack-squat', 'goblet-squat', 'barbell-back-squat']
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension Machine',
    muscleGroup: 'Legs',
    kinematicType: 'leg-extension',
    primaryMuscle: 'Quadriceps (Rectus Femoris isolation)',
    secondaryMuscles: [],
    equipment: 'Machine',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Pause for 1 full second at top contraction, control the 3-second descent.',
    breathingCue: 'Exhale as you extend knees up into full contraction; inhale as you lower the weight slowly.',
    setupSteps: [
      'Align knee joints directly with the machine\'s pivot axis.',
      'Adjust shin pad so it rests comfortably just above ankles on lower shins.',
      'Grip side handles firmly to keep your hips glued to the seat.'
    ],
    keyMistakes: [
      'Using explosive body English and kicking weights up with momentum.',
      'Letting weight stack slam down between reps without eccentric control.',
      'Sitting too far forward so knee joint is out of alignment with the cam.'
    ],
    substitutes: ['sissy-squat', 'dumbbell-step-up', 'bodyweight-wall-sit']
  },

  // LEGS - POSTERIOR CHAIN
  {
    id: 'romanian-deadlift',
    name: 'Dumbbell / Barbell Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    kinematicType: 'deadlift',
    primaryMuscle: 'Hamstrings & Gluteus Maximus',
    secondaryMuscles: ['Erector Spinae'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-10',
    formCue: 'Push hips straight back like closing a door, keep weights scraping along thighs.',
    breathingCue: 'Inhale into core at top; hold brace as hips push backward; exhale as hips drive through to stand.',
    setupSteps: [
      'Stand upright with feet hip-width apart holding dumbbells/barbell against upper thighs.',
      'Keep a soft 10°-15° unlock in knees that remains constant throughout the hinge.',
      'Initiate by pushing glutes backwards toward the wall behind you with chest proud.'
    ],
    keyMistakes: [
      'Squatting and bending knees excessively instead of hinging backwards at hips.',
      'Rounding upper and lower back to reach lower to the floor.',
      'Allowing weights to drift away from body (keep them sliding along thighs and shins).'
    ],
    substitutes: ['lying-leg-curl', 'seated-leg-curl', 'good-morning']
  },
  {
    id: 'seated-leg-curl',
    name: 'Seated Hamstring Curl',
    muscleGroup: 'Legs',
    kinematicType: 'leg-curl',
    primaryMuscle: 'Hamstrings (Knee Flexion)',
    secondaryMuscles: ['Calves'],
    equipment: 'Machine',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Lean slightly forward to increase hamstring stretch, curl forcefully.',
    breathingCue: 'Exhale as you curl heels under thighs; inhale as you control the return stretch.',
    setupSteps: [
      'Align knee joints with pivot point and secure thigh clamp down snugly.',
      'Rest back of lower calves on leg roller pad just above Achilles tendon.',
      'Hinge forward slightly at hips to lengthen hamstrings from the pelvic origin.'
    ],
    keyMistakes: [
      'Allowing thigh clamp to be loose, causing thighs to bounce during the curl.',
      'Snapping heels back with momentum rather than smooth hamstring contraction.',
      'Failing to achieve full knee extension at the top stretch.'
    ],
    substitutes: ['lying-leg-curl', 'dumbbell-lying-hamstring-curl', 'swiss-ball-leg-curl']
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    muscleGroup: 'Legs',
    kinematicType: 'calf-raise',
    primaryMuscle: 'Gastrocnemius (Calves)',
    secondaryMuscles: ['Soleus'],
    equipment: 'Machine',
    defaultSets: 4,
    targetRepRange: '12-15',
    formCue: 'Get full stretch at bottom for 1 sec, rise up onto balls of big toes.',
    breathingCue: 'Inhale down into deep heel stretch; hold 1s; exhale as you rise up onto toes.',
    setupSteps: [
      'Place balls of feet securely on edge of block, heels hanging free off the back.',
      'Rest shoulder pads comfortably across shoulders with legs straight (slight knee unlock).',
      'Drop heels down into a deep, pain-free calf stretch for 1-2 seconds before lifting.'
    ],
    keyMistakes: [
      'Bouncing rapidly using the Achilles tendon spring rather than calf muscle fibers.',
      'Rolling weight onto the outside of pinky toes instead of big toe joint.',
      'Bending knees up and down like a partial squat.'
    ],
    substitutes: ['seated-calf-raise', 'leg-press-calf-raise', 'dumbbell-single-leg-calf-raise']
  },

  // SHOULDERS
  {
    id: 'overhead-dumbbell-press',
    name: 'Seated Overhead Dumbbell Press',
    muscleGroup: 'Shoulders',
    kinematicType: 'overhead-press',
    primaryMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps', 'Upper Traps'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-10',
    formCue: 'Keep elbows slightly in front of shoulders, press straight up without clicking weights.',
    breathingCue: 'Inhale at ear height; brace core; exhale as you press dumbbells overhead to arm lockout.',
    setupSteps: [
      'Set bench upright or at 85° angle (slight tilt prevents lumbar hyperextension).',
      'Kick dumbbells to shoulder height, palms angled slightly inward (scapular plane ~30°).',
      'Keep core braced with ribs pulled down, feet planted flat on floor.'
    ],
    keyMistakes: [
      'Flaring elbows straight out to 180° (impinges the supraspinatus tendon).',
      'Arching lower back off the bench to turn it into an incline chest press.',
      'Clanking dumbbells together over your head.'
    ],
    substitutes: ['overhead-barbell-press', 'machine-shoulder-press', 'arnold-press']
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    kinematicType: 'lateral-raise',
    primaryMuscle: 'Lateral Deltoid (Side Delt Width)',
    secondaryMuscles: ['Upper Traps'],
    equipment: 'Dumbbell',
    defaultSets: 4,
    targetRepRange: '12-15',
    formCue: 'Lead with elbows, raise to parallel, don\'t shrug shoulders up into neck.',
    breathingCue: 'Exhale as you raise dumbbells outward to parallel; inhale as you lower under 2s control.',
    setupSteps: [
      'Stand with athletic stance, slight forward torso lean of 10°-15° to align side delts with gravity.',
      'Hold dumbbells at sides with a slight 15° bend in elbows.',
      'Imagine pouring water from a pitcher at top: raise out to sides leading with elbows.'
    ],
    keyMistakes: [
      'Using heavy weights and swinging hips/torso back and forth to throw weights up.',
      'Shrugging shoulders into ears (shifts all tension from side delts to upper traps).',
      'Raising hands higher than elbows (hands should be level with or slightly below elbows).'
    ],
    substitutes: ['cable-lateral-raise', 'machine-lateral-raise', 'resistance-band-lateral-raise']
  },
  {
    id: 'face-pull',
    name: 'Rope Face Pull',
    muscleGroup: 'Shoulders',
    kinematicType: 'face-pull',
    primaryMuscle: 'Posterior Deltoid & Infraspinatus',
    secondaryMuscles: ['Rhomboids', 'Middle Traps'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '15-20',
    formCue: 'Pull rope toward eye level while externally rotating hands back (double biceps pose).',
    breathingCue: 'Inhale with arms extended; exhale as you pull rope to face and rotate knuckles back.',
    setupSteps: [
      'Set cable pulley at upper chest or eye height with rope attachment.',
      'Grip rope with thumbs facing backwards towards your face.',
      'Step back into a split stance, keep torso tall and upright.'
    ],
    keyMistakes: [
      'Pulling down to the neck like an upright row instead of pulling back to eyes.',
      'Failing to externally rotate hands back (hands must finish behind elbows).',
      'Using excessive weight and leaning backwards to pull.'
    ],
    substitutes: ['reverse-pec-deck', 'bent-over-rear-delt-fly', 'band-pull-apart']
  },

  // ARMS
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Bicep Curl',
    muscleGroup: 'Arms',
    kinematicType: 'bicep-curl',
    primaryMuscle: 'Biceps Brachii (Long Head)',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Full stretch at bottom, keep upper arms locked vertically behind torso.',
    breathingCue: 'Exhale as you curl dumbbells upward and supinate wrists; inhale on 3-second descent.',
    setupSteps: [
      'Set bench to 45°-60° incline. Lie back with head and shoulders flat on pad.',
      'Let arms hang straight down behind torso to place biceps long head in deep passive stretch.',
      'Pin upper arms perpendicular to the floor throughout the entire movement.'
    ],
    keyMistakes: [
      'Swinging elbows forward to engage front delts instead of isolating biceps.',
      'Lifting head and shoulders off the bench to cheat the reps.',
      'Skipping the bottom stretch by cutting range of motion short.'
    ],
    substitutes: ['barbell-curl', 'cable-bicep-curl', 'preacher-curl']
  },
  {
    id: 'rope-tricep-pushdown',
    name: 'Cable Rope Tricep Pushdown',
    muscleGroup: 'Arms',
    kinematicType: 'tricep-pushdown',
    primaryMuscle: 'Triceps (Lateral & Medial Heads)',
    secondaryMuscles: [],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Pin elbows to your ribs, spread the rope apart at bottom lockout.',
    breathingCue: 'Inhale as forearms rise to 90°; exhale as you drive rope down and spread hands apart.',
    setupSteps: [
      'Attach rope to high pulley. Grip rope firmly with palms facing each other.',
      'Pin elbows tightly to your sides, hinge torso forward slightly (~10°).',
      'Lock upper arms stationary so only forearms move through elbow flexion and extension.'
    ],
    keyMistakes: [
      'Letting elbows flare forward and back, turning it into a shoulder press.',
      'Using bodyweight to lean over the rope and push down with chest.',
      'Failing to achieve full elbow extension and lockout at the bottom.'
    ],
    substitutes: ['skull-crushers', 'overhead-cable-tricep-extension', 'parallel-bar-dips']
  },
  {
    id: 'overhead-cable-tricep-extension',
    name: 'Overhead Cable Tricep Extension',
    muscleGroup: 'Arms',
    kinematicType: 'tricep-pushdown',
    primaryMuscle: 'Triceps (Long Head)',
    secondaryMuscles: [],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Extend arms forward and up, allowing deep stretch behind the head.',
    breathingCue: 'Inhale as forearms flex back behind head; exhale as you extend arms forward into lockout.',
    setupSteps: [
      'Set pulley to upper-mid chest height. Face away from cable machine with rope behind neck.',
      'Adopt a staggered split stance with torso leaned forward 30°.',
      'Keep elbows high next to ears and pointed forward, not flared wide.'
    ],
    keyMistakes: [
      'Flaring elbows out sideways, taking tension off the long head of triceps.',
      'Allowing shoulders to move back and forth rather than purely flexing elbows.',
      'Cutting the eccentric stretch short behind the head.'
    ],
    substitutes: ['dumbbell-overhead-extension', 'ez-bar-skull-crushers', 'bench-dips']
  },
  {
    id: 'hammer-curl',
    name: 'Dumbbell Hammer Curl',
    muscleGroup: 'Arms',
    kinematicType: 'bicep-curl',
    primaryMuscle: 'Brachialis & Brachioradialis (Forearm & Arm Thickness)',
    secondaryMuscles: ['Biceps'],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '10-12',
    formCue: 'Palms facing each other throughout the movement, control the eccentric lowering.',
    breathingCue: 'Exhale as you curl dumbbells upward; inhale as you lower with control.',
    setupSteps: [
      'Stand tall with dumbbells at sides, palms facing inward (neutral grip).',
      'Keep elbows pinned directly under shoulders.',
      'Curl dumbbells up toward shoulders while keeping wrists neutral without twisting.'
    ],
    keyMistakes: [
      'Swinging torso to throw weights up.',
      'Supinating (turning) wrists (keep neutral hammer grip throughout).',
      'Dropping weights fast without resisting gravity on the way down.'
    ],
    substitutes: ['cable-rope-hammer-curl', 'reverse-curl', 'cross-body-hammer-curl']
  },

  // CORE
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg / Knee Raise',
    muscleGroup: 'Core',
    kinematicType: 'hanging-leg-raise',
    primaryMuscle: 'Rectus Abdominis (Lower)',
    secondaryMuscles: ['Hip Flexors', 'Obliques'],
    equipment: 'Bodyweight',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Tilt pelvis up toward ribs rather than just swinging legs.',
    breathingCue: 'Inhale at full hanging stretch; exhale forcefully as knees/feet curl toward chest.',
    setupSteps: [
      'Hang from pull-up bar with overhand grip, shoulders engaged (don\'t dead-hang loosely).',
      'Brace core to eliminate body swing before starting rep.',
      'Roll pelvis backward and up toward ribs as knees rise to chest level.'
    ],
    keyMistakes: [
      'Swinging body back and forth like a pendulum using momentum.',
      'Only flexing hip flexors without actually curling the pelvis up to contract abs.',
      'Arching lower back at the bottom of the movement.'
    ],
    substitutes: ['captain-chair-knee-raise', 'decline-bench-reverse-crunch', 'ab-wheel-rollout']
  },
  {
    id: 'cable-woodchopper',
    name: 'Cable High-to-Low Woodchopper',
    muscleGroup: 'Core',
    kinematicType: 'chest-fly',
    primaryMuscle: 'Internal & External Obliques',
    secondaryMuscles: ['Transverse Abdominis'],
    equipment: 'Cable',
    defaultSets: 3,
    targetRepRange: '12-15',
    formCue: 'Rotate through the torso while keeping hips relatively stable, brace abs.',
    breathingCue: 'Inhale with arms extended high; exhale forcefully through pursed lips as you chop down diagonally across body.',
    setupSteps: [
      'Set cable pulley high. Stand perpendicular to machine with feet shoulder-width.',
      'Grip handle with both hands, arms extended.',
      'Pivot on back foot and rotate torso diagonally across body down to opposite knee.'
    ],
    keyMistakes: [
      'Bending arms and pulling with biceps instead of rotating with core obliques.',
      'Twisting knees rather than rotating through the thoracic spine and hips.',
      'Collapsing posture and hunching over during the chop.'
    ],
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
    kinematicType: 'squat',
    primaryMuscle: 'General Muscle Group',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    defaultSets: 3,
    targetRepRange: '8-12',
    formCue: 'Control the movement, full range of motion.',
    breathingCue: 'Inhale on the eccentric descent; exhale as you drive through the concentric lift.',
    setupSteps: ['Set up in a balanced posture with feet flat.', 'Grip the weight with neutral wrists.', 'Keep core braced.'],
    keyMistakes: ['Rushing the movement with momentum.', 'Allowing posture to collapse.'],
    substitutes: []
  };
}
