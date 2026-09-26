/**
 * NOURIQ AI — EXERCISE BIOMECHANICS & SPORTS SCIENCE ENGINE DATABASE
 * 
 * Deep anatomical maps, primary & secondary muscle targets,
 * dynamic joint angle tracking configurations, movement trajectory curves,
 * correct textbook kinematics, realistic common mistake kinematics,
 * and reactive AI coach cues for ALL 23 exercises in Nouriq.
 */

export const EXERCISE_BIOMECHANICS = {
  // 1. ONE-ARM DUMBBELL ROW
  'one-arm-dumbbell-row': {
    id: 'one-arm-dumbbell-row',
    name: 'One-Arm Dumbbell Row',
    equipment: 'dumbbell',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.85 },
    primaryMuscles: ['latissimus_dorsi', 'teres_major'],
    secondaryMuscles: ['biceps_brachii', 'posterior_deltoid', 'rhomboids'],
    jointAngle: {
      name: 'Elbow Flexion',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 145,
      optimalPeakDeg: 65
    },
    trajectory: {
      joint: 'handL',
      type: 'arc_to_hip',
      startOffset: [0, -0.45, 0.15],
      endOffset: [-0.08, -0.05, -0.22]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Neutral Spine (42° Incline)', bone: 'spine001', color: 'emerald' },
        { text: '✓ Elbow Tight to Hip Pocket', bone: 'forearmL', color: 'emerald' },
        { text: '✓ Full Scapular Stretch', bone: 'shoulderL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Drive your elbow in a smooth J-curve toward your hip crease. Keep your chest squared to the floor and squeeze your lat at the apex.',
      tempo: '2s Concentric • 1s Squeeze • 3s Controlled Eccentric'
    },
    commonMistake: {
      title: 'Excessive Torso Twist & Bicep Yank',
      badges: [
        { text: '⚠ Torso Hyperextension / Twist', bone: 'spine001', color: 'rose' },
        { text: '⚠ Flared Elbow Path', bone: 'upper_armL', color: 'rose' },
        { text: '⚠ Bicep-Dominant Pull', bone: 'forearmL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Stop rotating your torso to throw the dumbbell. Pin your ribs down, keep your spine neutral, and pull purely through your elbow.',
      spineTwist: 0.42,
      elbowFlare: 0.35,
      romCut: 0.28
    },
    aiPrompts: [
      { id: 'spine', text: 'Lock your spine neutral', targetBone: 'spine001', cue: 'Spine anchored at 42° to protect lumbar discs.' },
      { id: 'elbow', text: 'Drive elbow toward hip', targetBone: 'forearmL', cue: 'Elbow travels back toward pelvis for maximal lat recruitment.' },
      { id: 'lat', text: 'Focus on lat contraction', targetMuscle: 'latissimus_dorsi', cue: 'Mind-muscle connection: initiate with scapular retraction.' }
    ]
  },

  // 2. CABLE ROPE TRICEP PUSHDOWN
  'rope-tricep-pushdown': {
    id: 'rope-tricep-pushdown',
    name: 'Cable Rope Tricep Pushdown',
    equipment: 'cable',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.95 },
    primaryMuscles: ['triceps_lateral', 'triceps_medial'],
    secondaryMuscles: ['triceps_long_head', 'forearms'],
    jointAngle: {
      name: 'Elbow Extension',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 90,
      optimalPeakDeg: 175
    },
    trajectory: {
      joint: 'handL',
      type: 'downward_spread',
      startOffset: [0, 0.12, 0.08],
      endOffset: [0.08, -0.35, -0.04]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Elbows Pinned to Ribcage', bone: 'upper_armL', color: 'emerald' },
        { text: '✓ 10° Forward Athletic Hinge', bone: 'spine001', color: 'emerald' },
        { text: '✓ Peak Tricep Lockout & Rope Spread', bone: 'handL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Keep upper arms glued to your flanks. Pivot solely around the elbow joint and forcefully spread the rope tips at full lockout.',
      tempo: '1s Explosive Down • 1s Lockout Squeeze • 3s Resist Return'
    },
    commonMistake: {
      title: 'Elbow Flaring & Torso Bouncing',
      badges: [
        { text: '⚠ Torso Bouncing Under Load', bone: 'spine001', color: 'rose' },
        { text: '⚠ Elbows Drifting Forward', bone: 'upper_armL', color: 'rose' },
        { text: '⚠ Incomplete Lockout', bone: 'forearmL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not lean your bodyweight over the rope or swing your elbows. Anchor your torso and let your triceps do 100% of the work.',
      spineTwist: 0.25,
      elbowFlare: 0.30,
      romCut: 0.25
    },
    aiPrompts: [
      { id: 'elbows_pinned', text: 'Pin elbows to ribcage', targetBone: 'upper_armL', cue: 'Zero shoulder movement; isolate the triceps heads.' },
      { id: 'spread_ropes', text: 'Spread rope apart at bottom', targetBone: 'handL', cue: 'Spreading the ends triggers peak lateral head contraction.' },
      { id: 'eccentric', text: 'Control the 3s return', targetMuscle: 'triceps_lateral', cue: 'Resist cable stack on the way back to 90 degrees.' }
    ]
  },

  // 3. OVERHEAD CABLE TRICEP EXTENSION
  'overhead-cable-tricep-extension': {
    id: 'overhead-cable-tricep-extension',
    name: 'Overhead Cable Tricep Extension',
    equipment: 'cable',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.95 },
    primaryMuscles: ['triceps_long_head'],
    secondaryMuscles: ['triceps_lateral', 'forearms'],
    jointAngle: {
      name: 'Elbow Overhead Extension',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 65,
      optimalPeakDeg: 170
    },
    trajectory: {
      joint: 'handL',
      type: 'overhead_extension',
      startOffset: [-0.05, 0.25, -0.15],
      endOffset: [0.15, 0.45, 0.25]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Elbows Pinned High Next to Ears', bone: 'upper_armL', color: 'emerald' },
        { text: '✓ 30° Forward Staggered Stance', bone: 'spine001', color: 'emerald' },
        { text: '✓ Deep Passive Long-Head Stretch', bone: 'shoulderL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Keep elbows pointed straight ahead beside your ears. Allow deep flexion behind the head to stretch the long head, then extend forward into full lockout.',
      tempo: '2s Extension • 1s Lockout • 3s Deep Stretch Behind Head'
    },
    commonMistake: {
      title: 'Flaring Elbows & Dropping Upper Arms',
      badges: [
        { text: '⚠ Flared Elbows Outward', bone: 'upper_armL', color: 'rose' },
        { text: '⚠ Dropping Elbows to Chest', bone: 'shoulderL', color: 'rose' },
        { text: '⚠ Cutting the Stretch Short', bone: 'forearmL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not flare your elbows sideways or drop your upper arms. Keep elbows high and parallel to target the long head.',
      spineTwist: 0.20,
      elbowFlare: 0.40,
      romCut: 0.30
    },
    aiPrompts: [
      { id: 'elbows_high', text: 'Keep elbows high beside ears', targetBone: 'upper_armL', cue: 'Maintains maximum passive stretch on long head.' },
      { id: 'lockout', text: 'Full extension forward', targetBone: 'handL', cue: 'Drives maximum tension into peak tricep contraction.' }
    ]
  },

  // 4. BARBELL BENCH PRESS
  'barbell-bench-press': {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    equipment: 'barbell',
    defaultCamera: 'threeQuarter',
    cameraConfig: { theta: Math.PI / 3.2, phi: Math.PI / 2.7, radius: 2.25, targetY: 0.55 },
    primaryMuscles: ['pectoralis_major_sternal', 'pectoralis_major_clavicular'],
    secondaryMuscles: ['anterior_deltoid', 'triceps_brachii'],
    jointAngle: {
      name: 'Elbow Press Angle',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 75,
      optimalPeakDeg: 170
    },
    trajectory: {
      joint: 'handL',
      type: 'linear_press',
      startOffset: [0, -0.25, 0.05],
      endOffset: [0, 0.35, -0.05]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ 45° Elbow Tuck (Shoulder Safe)', bone: 'upper_armL', color: 'emerald' },
        { text: '✓ Retracted Scapular Shelf', bone: 'spine003', color: 'emerald' },
        { text: '✓ Controlled Touch at Lower Sternum', bone: 'spine002', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Keep shoulder blades pinched together into the bench. Lower the barbell to mid-sternum with elbows tucked at 45° to protect rotator cuffs.',
      tempo: '2s Lower • Controlled Touch • Explosive Leg Drive Press'
    },
    commonMistake: {
      title: '90° Elbow Flare & Chest Bouncing',
      badges: [
        { text: '⚠ Dangerous 90° Elbow Flare', bone: 'upper_armL', color: 'rose' },
        { text: '⚠ Bouncing Off Sternum', bone: 'spine002', color: 'rose' },
        { text: '⚠ Wrists Cocked Back', bone: 'handL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Flaring your elbows out to 90° causes acute anterior shoulder impingement. Tuck elbows to ~45° and touch chest gently.',
      spineTwist: 0.0,
      elbowFlare: 0.50,
      romCut: 0.15
    },
    aiPrompts: [
      { id: 'scapula', text: 'Retract shoulder blades', targetBone: 'spine003', cue: 'Creates a rock-solid platform and shields the rotator cuff.' },
      { id: 'elbow_tuck', text: 'Keep elbows at 45 degrees', targetBone: 'upper_armL', cue: 'Prevents shoulder joint shear stress while maximizing pec tension.' },
      { id: 'leg_drive', text: 'Drive feet into floor', targetBone: 'thighL', cue: 'Kinetic chain transfer from heels through torso.' }
    ]
  },

  // 5. INCLINE DUMBBELL PRESS
  'incline-dumbbell-press': {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    equipment: 'dumbbell',
    defaultCamera: 'threeQuarter',
    cameraConfig: { theta: Math.PI / 3.2, phi: Math.PI / 2.7, radius: 2.25, targetY: 0.65 },
    primaryMuscles: ['pectoralis_major_clavicular'],
    secondaryMuscles: ['anterior_deltoid', 'triceps_brachii'],
    jointAngle: {
      name: 'Incline Press Angle',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 75,
      optimalPeakDeg: 170
    },
    trajectory: {
      joint: 'handL',
      type: 'incline_press',
      startOffset: [0, -0.22, 0.05],
      endOffset: [0, 0.38, -0.05]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ 30° Incline Angle (Upper Chest Focus)', bone: 'spine001', color: 'emerald' },
        { text: '✓ 45° Elbow Tuck in Scapular Plane', bone: 'upper_armL', color: 'emerald' },
        { text: '✓ Squeeze Dumbbells Over Upper Chest', bone: 'handL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Lower dumbbells with control until thumbs graze upper chest level. Press up and slightly inward in an arc without clicking the weights.',
      tempo: '2s Lower • 1s Chest Pause • Explosive Press Up'
    },
    commonMistake: {
      title: 'Steep Bench Angle & Flared Elbows',
      badges: [
        { text: '⚠ Bench Set Too High (>45°)', bone: 'spine001', color: 'rose' },
        { text: '⚠ Flared 90° Elbows', bone: 'upper_armL', color: 'rose' },
        { text: '⚠ Dropping Weights Too Deep', bone: 'handL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Bench angle above 45° shifts load to your front deltoids. Keep it at 30° and keep elbows at 45° to isolate clavicular pec fibers.',
      spineTwist: 0.0,
      elbowFlare: 0.45,
      romCut: 0.20
    },
    aiPrompts: [
      { id: 'scapular_plane', text: 'Keep elbows tucked at 45°', targetBone: 'upper_armL', cue: 'Protects the anterior capsule while loading upper chest.' },
      { id: 'upper_pec_squeeze', text: 'Squeeze upper pecs at apex', targetMuscle: 'pectoralis_major_clavicular', cue: 'Feel the muscle shorten toward your sternal notch.' }
    ]
  },

  // 6. CABLE CHEST FLY & WOODCHOPPER
  'cable-chest-fly': {
    id: 'cable-chest-fly',
    name: 'Cable Chest Fly',
    equipment: 'cable',
    defaultCamera: 'front',
    cameraConfig: { theta: 0, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.85 },
    primaryMuscles: ['pectoralis_major_sternal'],
    secondaryMuscles: ['anterior_deltoid'],
    jointAngle: {
      name: 'Arm Hug Angle',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 140,
      optimalPeakDeg: 80
    },
    trajectory: {
      joint: 'handL',
      type: 'hug_arc',
      startOffset: [0.35, 0.05, 0],
      endOffset: [-0.02, 0.05, 0.25]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Fixed 15° Soft Elbow Bend', bone: 'forearmL', color: 'emerald' },
        { text: '✓ Staggered Athletic Split Stance', bone: 'thighL', color: 'emerald' },
        { text: '✓ Midline Peak Contraction', bone: 'handL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Imagine hugging a massive redwood tree. Lock a slight 15° bend in your elbows and bring hands together directly in front of your sternum.',
      tempo: '2s Hug Inward • 1.5s Peak Midline Squeeze • 3s Deep Pec Stretch'
    },
    commonMistake: {
      title: 'Turning Fly into a Press & Torso Swing',
      badges: [
        { text: '⚠ Bending Elbows into a Press', bone: 'forearmL', color: 'rose' },
        { text: '⚠ Torso Rocking Back & Forth', bone: 'spine001', color: 'rose' },
        { text: '⚠ Excessive Shoulder Extension', bone: 'shoulderL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not bend your elbows into a press. Keep the elbow angle locked and let the pecs adduct the humerus across your chest.',
      spineTwist: 0.25,
      elbowFlare: 0.35,
      romCut: 0.25
    },
    aiPrompts: [
      { id: 'frozen_elbows', text: 'Lock soft elbow angle', targetBone: 'forearmL', cue: 'Isolates pecs by removing tricep extension assistance.' },
      { id: 'midline_squeeze', text: 'Squeeze knuckles at midline', targetBone: 'handL', cue: 'Achieves maximum muscle shortening.' }
    ]
  },
  'cable-woodchopper': {
    id: 'cable-woodchopper',
    name: 'Cable High-to-Low Woodchopper',
    equipment: 'cable',
    defaultCamera: 'front',
    cameraConfig: { theta: 0, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.85 },
    primaryMuscles: ['obliques', 'rectus_abdominis'],
    secondaryMuscles: ['shoulders', 'forearms'],
    jointAngle: {
      name: 'Torso Rotation Arc',
      jointA: 'spine003',
      pivot: 'spine001',
      jointB: 'thighL',
      optimalStretchDeg: 120,
      optimalPeakDeg: 60
    },
    trajectory: {
      joint: 'handL',
      type: 'diagonal_chop',
      startOffset: [-0.25, 0.40, 0],
      endOffset: [0.25, -0.30, 0.15]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Pivot on Back Foot', bone: 'footL', color: 'emerald' },
        { text: '✓ Rotate from Core / Obliques', bone: 'spine001', color: 'emerald' },
        { text: '✓ Arms Extended with Soft Elbows', bone: 'forearmL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Initiate the chop by rotating your torso and hips together. Keep arms extended and pivot on your rear ball of foot.',
      tempo: '1.5s Explosive Chop • 1s Core Squeeze • 3s Controlled Return'
    },
    commonMistake: {
      title: 'Arm Pulling & Planted Knees',
      badges: [
        { text: '⚠ Pulling With Arms Only', bone: 'forearmL', color: 'rose' },
        { text: '⚠ Frozen Hips (Knee Torque)', bone: 'thighL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not pull purely with your arms. Rotate through your torso and hips to protect your knee ligaments.',
      spineTwist: 0.40,
      elbowFlare: 0.20,
      romCut: 0.25
    },
    aiPrompts: [
      { id: 'core_rotation', text: 'Drive rotation from obliques', targetBone: 'spine001', cue: 'Torque generated at core transfers through extended arms.' }
    ]
  },

  // 7. LAT PULLDOWN (WIDE GRIP)
  'lat-pulldown': {
    id: 'lat-pulldown',
    name: 'Lat Pulldown (Wide Grip)',
    equipment: 'cable',
    defaultCamera: 'threeQuarter',
    cameraConfig: { theta: Math.PI / 3.4, phi: Math.PI / 2.5, radius: 2.2, targetY: 0.75 },
    primaryMuscles: ['latissimus_dorsi', 'teres_major'],
    secondaryMuscles: ['biceps_brachii', 'brachialis', 'posterior_deltoid'],
    jointAngle: {
      name: 'Shoulder Adduction',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 160,
      optimalPeakDeg: 70
    },
    trajectory: {
      joint: 'handL',
      type: 'pulldown_arc',
      startOffset: [0, 0.45, 0],
      endOffset: [0, -0.15, -0.05]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Slight 15° Torso Lean (Proud Chest)', bone: 'spine001', color: 'emerald' },
        { text: '✓ Elbows Driving Down & In', bone: 'forearmL', color: 'emerald' },
        { text: '✓ Bar to Upper Collarbone', bone: 'shoulderL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Pull your shoulder blades down first. Drive your elbows into your back pockets and bring the bar smoothly to your collarbone.',
      tempo: '2s Down • 1s Lat Peak Contraction • 3s Overhead Stretch'
    },
    commonMistake: {
      title: '45° Torso Recline & Bicep Heave',
      badges: [
        { text: '⚠ Excessive Backward Lean', bone: 'spine001', color: 'rose' },
        { text: '⚠ Pulling Behind Neck', bone: 'shoulderL', color: 'rose' },
        { text: '⚠ Bicep-Dominant Yanks', bone: 'forearmL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Leaning back 45° turns this into a row. Keep chest high, lean back only 10-15°, and drive with your lats rather than forearms.',
      spineTwist: 0.40,
      elbowFlare: 0.25,
      romCut: 0.20
    },
    aiPrompts: [
      { id: 'scapular_depression', text: 'Depress shoulder blades first', targetBone: 'shoulderL', cue: 'Initiate pull with back muscles before bending arms.' },
      { id: 'drive_elbows', text: 'Drive elbows into pockets', targetBone: 'forearmL', cue: 'Focus on elbow path rather than pulling with hands.' },
      { id: 'chest_up', text: 'Keep chest proud to ceiling', targetBone: 'spine003', cue: 'Optimizes lat line of pull across the ribcage.' }
    ]
  },

  // 8. SEATED CABLE ROW
  'seated-cable-row': {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    equipment: 'cable',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.75 },
    primaryMuscles: ['rhomboids', 'middle_trapezius', 'latissimus_dorsi'],
    secondaryMuscles: ['biceps_brachii', 'posterior_deltoid'],
    jointAngle: {
      name: 'Elbow Row Angle',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 155,
      optimalPeakDeg: 75
    },
    trajectory: {
      joint: 'handL',
      type: 'horizontal_row',
      startOffset: [0, -0.05, 0.40],
      endOffset: [0, -0.05, -0.15]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Upright Stationary Torso (Proud Chest)', bone: 'spine001', color: 'emerald' },
        { text: '✓ Elbows Grazing Ribs to Navel', bone: 'forearmL', color: 'emerald' },
        { text: '✓ 1s Peak Scapular Squeeze', bone: 'shoulderL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Sit tall with chest puffed out. Pull the handle toward your navel while pinning elbows along your flanks. Squeeze shoulder blades together for 1 second.',
      tempo: '2s Pull • 1s Scapular Pin • 3s Controlled Reach'
    },
    commonMistake: {
      title: 'Rocking Boat Momentum & Shrugged Traps',
      badges: [
        { text: '⚠ Rocking Lower Back Back & Forth', bone: 'spine001', color: 'rose' },
        { text: '⚠ Shrugging Shoulders to Ears', bone: 'shoulderL', color: 'rose' },
        { text: '⚠ Lumbar Rounding on Reach', bone: 'spine002', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Stop rocking back and forth like a rowing boat. Keep your spine locked vertical and pull purely through your upper back.',
      spineTwist: 0.45,
      elbowFlare: 0.30,
      romCut: 0.20
    },
    aiPrompts: [
      { id: 'scapular_squeeze', text: 'Pinch shoulder blades together', targetBone: 'shoulderL', cue: 'Maximizes rhomboid and middle trapezius thickness.' },
      { id: 'stay_tall', text: 'Maintain vertical spine', targetBone: 'spine001', cue: 'Eliminates lower-back shear forces.' }
    ]
  },

  // 9. BARBELL DEADLIFT & ROMANIAN DEADLIFT (RDL)
  'barbell-deadlift': {
    id: 'barbell-deadlift',
    name: 'Conventional Barbell Deadlift',
    equipment: 'barbell',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.2, targetY: 0.8 },
    primaryMuscles: ['erector_spinae', 'gluteus_maximus', 'hamstrings'],
    secondaryMuscles: ['quadriceps', 'latissimus_dorsi', 'trapezius'],
    jointAngle: {
      name: 'Hip Extension Angle',
      jointA: 'spine001',
      pivot: 'thighL',
      jointB: 'shinL',
      optimalStretchDeg: 65,
      optimalPeakDeg: 175
    },
    trajectory: {
      joint: 'handL',
      type: 'vertical_pull',
      startOffset: [0, -0.42, 0.05],
      endOffset: [0, 0.05, 0.02]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Neutral Rigid Lumbar Spine', bone: 'spine001', color: 'emerald' },
        { text: '✓ Bar Scrapes Shins in Vertical Line', bone: 'handL', color: 'emerald' },
        { text: '✓ Push Floor Away Through Mid-Foot', bone: 'thighL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Wedge hips into the bar, pull the slack out with locked lats, and push the floor away. Drive hips through to a tall, proud finish.',
      tempo: 'Explosive Leg Push • 1s Lockout • 3s Controlled Descent'
    },
    commonMistake: {
      title: 'Cat-Back Lumbar Rounding & Bar Drift',
      badges: [
        { text: '⚠ Dangerous Lumbar Flexion', bone: 'spine001', color: 'rose' },
        { text: '⚠ Bar Drifting Away from Shins', bone: 'handL', color: 'rose' },
        { text: '⚠ Hips Shooting Up Prematurely', bone: 'thighL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Rounding your lower back places extreme stress on your lumbar discs. Lock your lats, keep the bar glued to your shins, and lift with your legs.',
      spineTwist: 0.40,
      elbowFlare: 0.15,
      romCut: 0.20
    },
    aiPrompts: [
      { id: 'lat_lock', text: 'Engage lats to lock bar close', targetBone: 'spine001', cue: 'Keeps bar path strictly vertical.' },
      { id: 'glute_drive', text: 'Push floor away through heels', targetBone: 'thighL', cue: 'Activates glutes and posterior chain.' }
    ]
  },
  'romanian-deadlift': {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    equipment: 'dumbbell',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.2, targetY: 0.8 },
    primaryMuscles: ['hamstrings', 'gluteus_maximus'],
    secondaryMuscles: ['erector_spinae', 'adductor_magnus', 'latissimus_dorsi'],
    jointAngle: {
      name: 'Hip Hinge Angle',
      jointA: 'spine001',
      pivot: 'thighL',
      jointB: 'shinL',
      optimalStretchDeg: 70,
      optimalPeakDeg: 175
    },
    trajectory: {
      joint: 'handL',
      type: 'shins_scrape',
      startOffset: [0, 0, 0],
      endOffset: [0, -0.42, 0.08]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Pure Posterior Hip Hinge', bone: 'thighL', color: 'emerald' },
        { text: '✓ Rigid Neutral Lumbar Spine', bone: 'spine001', color: 'emerald' },
        { text: '✓ Weights Grazing Shins', bone: 'handL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Imagine pushing a car door closed with your glutes. Keep a soft 15° unlock in knees, slide weights along thighs, and stop when hips stop moving back.',
      tempo: '3s Posterior Hinge • 1s Hamstring Stretch • Explosive Hip Extension'
    },
    commonMistake: {
      title: 'Spinal Rounding & Squatting the Weight',
      badges: [
        { text: '⚠ Lumbar Flexion / Rounding', bone: 'spine001', color: 'rose' },
        { text: '⚠ Excessive Knee Bend (Squatting)', bone: 'shinL', color: 'rose' },
        { text: '⚠ Weights Drifting Away From Legs', bone: 'handL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: This is a hinge, not a squat. Do not round your lower spine to reach lower to the floor. Keep dumbbells glued to your shins.',
      spineTwist: 0.38,
      elbowFlare: 0.15,
      romCut: 0.25
    },
    aiPrompts: [
      { id: 'hip_hinge', text: 'Push hips straight back', targetBone: 'thighL', cue: 'Directs 100% tension into hamstrings origin at ischial tuberosity.' },
      { id: 'flat_back', text: 'Lock lats and flat spine', targetBone: 'spine001', cue: 'Maintains neutral intervertebral disc spacing.' },
      { id: 'scrape_shins', text: 'Keep weights against shins', targetBone: 'handL', cue: 'Minimizes the moment arm on your lumbar spine.' }
    ]
  },

  // 10. BARBELL BACK SQUAT & LEG PRESS
  'barbell-back-squat': {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    equipment: 'barbell',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.25, targetY: 0.75 },
    primaryMuscles: ['quadriceps_femoris', 'gluteus_maximus'],
    secondaryMuscles: ['hamstrings', 'adductors', 'erector_spinae'],
    jointAngle: {
      name: 'Knee Flexion Depth',
      jointA: 'thighL',
      pivot: 'shinL',
      jointB: 'footL',
      optimalStretchDeg: 85,
      optimalPeakDeg: 175
    },
    trajectory: {
      joint: 'thighL',
      type: 'squat_depth',
      startOffset: [0, 0, 0],
      endOffset: [0, -0.38, -0.15]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Crease Below Patella (Parallel Depth)', bone: 'shinL', color: 'emerald' },
        { text: '✓ 360° Intra-Abdominal Core Brace', bone: 'spine001', color: 'emerald' },
        { text: '✓ Knees Tracking Over Second Toe', bone: 'footL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Inhale into your belly and brace 360°. Push knees outward over your mid-foot and descend until the hip crease dips just below knees.',
      tempo: '3s Controlled Descent • 1s Hole Pause • Explosive Drive Up'
    },
    commonMistake: {
      title: 'Knee Valgus Collapse & Excessive Forward Lean',
      badges: [
        { text: '⚠ Knees Caving Inward (Valgus)', bone: 'shinL', color: 'rose' },
        { text: '⚠ Excessive Lumbar Rounding', bone: 'spine001', color: 'rose' },
        { text: '⚠ Heels Lifting Off Ground', bone: 'footL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not let knees cave inward or heels lift. Drive knees outward over pinky toes and push the floor away through your mid-foot.',
      spineTwist: 0.35,
      elbowFlare: 0.20,
      romCut: 0.30
    },
    aiPrompts: [
      { id: 'knees_out', text: 'Push knees outward', targetBone: 'shinL', cue: 'Engages glute medius and prevents knee joint collapse.' },
      { id: 'core_brace', text: 'Brace abdominal wall', targetBone: 'spine001', cue: 'Protects lumbar spine from shearing forces under load.' },
      { id: 'depth', text: 'Reach parallel depth', targetBone: 'thighL', cue: 'Full range of motion maximizes quadriceps hypertrophy.' }
    ]
  },
  'leg-press': {
    id: 'leg-press',
    name: 'Angled Leg Press',
    equipment: 'machine',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.25, targetY: 0.75 },
    primaryMuscles: ['quadriceps_femoris', 'gluteus_maximus'],
    secondaryMuscles: ['adductors'],
    jointAngle: {
      name: 'Knee Press Depth',
      jointA: 'thighL',
      pivot: 'shinL',
      jointB: 'footL',
      optimalStretchDeg: 85,
      optimalPeakDeg: 170
    },
    trajectory: {
      joint: 'footL',
      type: 'sled_press',
      startOffset: [0, -0.35, 0.2],
      endOffset: [0, 0.15, 0.45]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Lower Back Glued to Pad (Zero Butt Wink)', bone: 'spine001', color: 'emerald' },
        { text: '✓ 90° Knee Depth Without Hyperextension', bone: 'shinL', color: 'emerald' },
        { text: '✓ Feet Shoulder-Width on Platform', bone: 'footL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Keep your sacrum glued to the seat backrest. Lower the sled smoothly to 90° without letting your pelvis curl forward. Never lock knees forcefully at top.',
      tempo: '3s Sled Lowering • 1s Deep Pause • Drive Through Whole Foot'
    },
    commonMistake: {
      title: 'Pelvis Curling & Hard Knee Lockout',
      badges: [
        { text: '⚠ Butt Wink / Pelvic Curl', bone: 'spine001', color: 'rose' },
        { text: '⚠ Dangerous Knee Hyperextension', bone: 'shinL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Lowering too deep curls your lower back off the pad. Stop before your tailbone lifts, and keep a soft knee unlock at the top.',
      spineTwist: 0.30,
      elbowFlare: 0.0,
      romCut: 0.25
    },
    aiPrompts: [
      { id: 'glued_back', text: 'Anchor lower back into pad', targetBone: 'spine001', cue: 'Prevents herniating forces on lumbar spine under sled load.' }
    ]
  },

  // 11. LEG EXTENSION
  'leg-extension': {
    id: 'leg-extension',
    name: 'Leg Extension Machine',
    equipment: 'machine',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.75 },
    primaryMuscles: ['quadriceps_femoris'],
    secondaryMuscles: ['rectus_femoris'],
    jointAngle: {
      name: 'Knee Extension Angle',
      jointA: 'thighL',
      pivot: 'shinL',
      jointB: 'footL',
      optimalStretchDeg: 90,
      optimalPeakDeg: 175
    },
    trajectory: {
      joint: 'footL',
      type: 'knee_extension_arc',
      startOffset: [0, -0.45, 0],
      endOffset: [0, -0.05, 0.40]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Hips Planted Firmly (Hold Handles)', bone: 'thighL', color: 'emerald' },
        { text: '✓ Full Terminal Knee Extension', bone: 'shinL', color: 'emerald' },
        { text: '✓ 1s Peak Quad Contraction', bone: 'footL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Grip the handles tight to lock your pelvis down. Extend knees smoothly until legs are horizontal, pause for 1s, and lower with a controlled 3s tempo.',
      tempo: '2s Extension • 1s Peak Quad Lockout • 3s Controlled Lower'
    },
    commonMistake: {
      title: 'Kicking with Momentum & Hips Rising',
      badges: [
        { text: '⚠ Hips Lifting Off Seat', bone: 'thighL', color: 'rose' },
        { text: '⚠ Violent Kicking Momentum', bone: 'shinL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not kick the weight up with momentum or let your hips lift. Squeeze through the quads under strict control.',
      spineTwist: 0.25,
      elbowFlare: 0.0,
      romCut: 0.30
    },
    aiPrompts: [
      { id: 'peak_quad', text: 'Lock out and pause at top', targetBone: 'shinL', cue: 'Maximizes motor unit recruitment at peak shortened position.' }
    ]
  },

  // 12. SEATED HAMSTRING CURL
  'seated-leg-curl': {
    id: 'seated-leg-curl',
    name: 'Seated Hamstring Curl',
    equipment: 'machine',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.75 },
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['gastrocnemius'],
    jointAngle: {
      name: 'Knee Flexion Angle',
      jointA: 'thighL',
      pivot: 'shinL',
      jointB: 'footL',
      optimalStretchDeg: 170,
      optimalPeakDeg: 80
    },
    trajectory: {
      joint: 'footL',
      type: 'knee_flexion_arc',
      startOffset: [0, -0.05, 0.40],
      endOffset: [0, -0.45, -0.05]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Thigh Clamp Securely Locked', bone: 'thighL', color: 'emerald' },
        { text: '✓ Torso Hinged Slightly Forward 15°', bone: 'spine001', color: 'emerald' },
        { text: '✓ Curl Heels Deep Beneath Seat', bone: 'shinL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Hinge slightly forward at your hips to stretch the hamstrings at their pelvic origin. Curl your heels forcefully beneath the seat and control the return.',
      tempo: '2s Curl Under • 1s Peak Hamstring Squeeze • 3s Controlled Extension'
    },
    commonMistake: {
      title: 'Loose Thigh Clamp & Half Range',
      badges: [
        { text: '⚠ Thighs Bouncing Off Pad', bone: 'thighL', color: 'rose' },
        { text: '⚠ Incomplete Heel Curl', bone: 'shinL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Tighten the thigh clamp so thighs cannot lift. Curl fully beneath your knees to achieve full contraction.',
      spineTwist: 0.20,
      elbowFlare: 0.0,
      romCut: 0.35
    },
    aiPrompts: [
      { id: 'full_curl', text: 'Pull heels under seat', targetBone: 'shinL', cue: 'Shortens biceps femoris through complete active range.' }
    ]
  },

  // 13. STANDING CALF RAISE
  'standing-calf-raise': {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    equipment: 'machine',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.8 },
    primaryMuscles: ['gastrocnemius'],
    secondaryMuscles: ['soleus', 'tibialis_posterior'],
    jointAngle: {
      name: 'Ankle Plantarflexion',
      jointA: 'shinL',
      pivot: 'footL',
      jointB: 'toeL',
      optimalStretchDeg: 70,
      optimalPeakDeg: 145
    },
    trajectory: {
      joint: 'footL',
      type: 'vertical_rise',
      startOffset: [0, -0.08, 0],
      endOffset: [0, 0.12, 0]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ 2s Deep Heel Drop Stretch', bone: 'footL', color: 'emerald' },
        { text: '✓ Push Through Big Toe Ball', bone: 'shinL', color: 'emerald' },
        { text: '✓ Knees Soft (Unlocked 5°)', bone: 'thighL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Drop your heels into a deep, pain-free stretch for 2 full seconds to dissipate the Achilles tendon bounce. Rise high onto the balls of your big toes.',
      tempo: '2s Deep Stretch • 1.5s Rise • 1s Peak Toe Squeeze'
    },
    commonMistake: {
      title: 'Rapid Bouncing & Bending Knees',
      badges: [
        { text: '⚠ Achilles Spring Bouncing', bone: 'footL', color: 'rose' },
        { text: '⚠ Bending Knees into a Squat', bone: 'shinL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Bouncing uses tendon recoil rather than calf muscle fibers. Pause 2 seconds at the bottom stretch before pushing up.',
      spineTwist: 0.15,
      elbowFlare: 0.0,
      romCut: 0.35
    },
    aiPrompts: [
      { id: 'stretch_pause', text: 'Pause 2s in deep stretch', targetBone: 'footL', cue: 'Dissipates elastic strain energy and forces muscular contraction.' }
    ]
  },

  // 14. SEATED OVERHEAD DUMBBELL PRESS
  'overhead-dumbbell-press': {
    id: 'overhead-dumbbell-press',
    name: 'Seated Overhead Dumbbell Press',
    equipment: 'dumbbell',
    defaultCamera: 'front',
    cameraConfig: { theta: 0, phi: Math.PI / 2.3, radius: 2.1, targetY: 0.85 },
    primaryMuscles: ['anterior_deltoid', 'lateral_deltoid'],
    secondaryMuscles: ['triceps_brachii', 'upper_trapezius', 'serratus_anterior'],
    jointAngle: {
      name: 'Overhead Press Arc',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 80,
      optimalPeakDeg: 175
    },
    trajectory: {
      joint: 'handL',
      type: 'overhead_press',
      startOffset: [-0.05, -0.15, 0],
      endOffset: [-0.02, 0.45, 0]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ 30° Scapular Plane (Elbows In Front)', bone: 'upper_armL', color: 'emerald' },
        { text: '✓ Ribcage Pulled Down / Core Braced', bone: 'spine001', color: 'emerald' },
        { text: '✓ Full Overhead Extension', bone: 'handL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Press dumbbells in the scapular plane (~30° forward of body line). Lock out overhead directly above ears without clanking weights.',
      tempo: '2s Explosive Press • 1s Overhead Control • 3s Controlled Lower'
    },
    commonMistake: {
      title: '180° Elbow Flare & Lumbar Arching',
      badges: [
        { text: '⚠ Flared 180° Elbows (Impingement)', bone: 'upper_armL', color: 'rose' },
        { text: '⚠ Severe Lumbar Hyperextension', bone: 'spine001', color: 'rose' },
        { text: '⚠ Clanking Weights Overhead', bone: 'handL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Flaring elbows straight out to 180° pinches the rotator cuff. Bring elbows slightly in front of shoulders and keep your core braced.',
      spineTwist: 0.25,
      elbowFlare: 0.50,
      romCut: 0.20
    },
    aiPrompts: [
      { id: 'scapular_plane', text: 'Press in scapular plane', targetBone: 'upper_armL', cue: 'Natural shoulder socket angle eliminates impingement risk.' },
      { id: 'ribs_down', text: 'Pull ribs down / brace abs', targetBone: 'spine001', cue: 'Stops lower back hyperextension under overhead load.' },
      { id: 'no_clank', text: 'Control the apex without clanking', targetBone: 'handL', cue: 'Maintains constant tension on the deltoids.' }
    ]
  },

  // 15. DUMBBELL LATERAL RAISE
  'dumbbell-lateral-raise': {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    equipment: 'dumbbell',
    defaultCamera: 'front',
    cameraConfig: { theta: 0, phi: Math.PI / 2.3, radius: 2.1, targetY: 0.9 },
    primaryMuscles: ['lateral_deltoid'],
    secondaryMuscles: ['anterior_deltoid', 'posterior_deltoid', 'supraspinatus'],
    jointAngle: {
      name: 'Shoulder Abduction',
      jointA: 'spine003',
      pivot: 'shoulderL',
      jointB: 'forearmL',
      optimalStretchDeg: 15,
      optimalPeakDeg: 90
    },
    trajectory: {
      joint: 'handL',
      type: 'lateral_sweep',
      startOffset: [0, -0.40, 0],
      endOffset: [0.45, 0.05, 0]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Lead With Elbows (Pouring Pitcher)', bone: 'forearmL', color: 'emerald' },
        { text: '✓ Slight 15° Forward Torso Hinge', bone: 'spine001', color: 'emerald' },
        { text: '✓ Parallel T-Pose Apex (No Shrugging)', bone: 'shoulderL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Raise dumbbells out and away as if pushing walls apart. Lead with elbows, keep pinkies slightly higher than thumbs, and pause at shoulder level.',
      tempo: '1.5s Smooth Sweep • 1s Apex Pause • 3s Slow Fall'
    },
    commonMistake: {
      title: 'Trapezius Shrug & Torso Momentum',
      badges: [
        { text: '⚠ Excessive Trap Shrugging', bone: 'shoulderL', color: 'rose' },
        { text: '⚠ Rocking Torso Back & Forth', bone: 'spine001', color: 'rose' },
        { text: '⚠ Hands Higher Than Elbows', bone: 'handL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not shrug shoulders up into your ears. Depress your traps and lead with elbows to keep the load on your side delts.',
      spineTwist: 0.30,
      elbowFlare: 0.20,
      romCut: 0.30
    },
    aiPrompts: [
      { id: 'lead_elbows', text: 'Lead with your elbows', targetBone: 'forearmL', cue: 'Ensures lateral deltoid fibers remain directly against gravity.' },
      { id: 'depress_traps', text: 'Keep traps relaxed down', targetBone: 'shoulderL', cue: 'Prevents upper trap dominance over shoulder abduction.' },
      { id: 'reach_out', text: 'Push out toward the walls', targetBone: 'handL', cue: 'Maximizes the lever arm length for superior muscle activation.' }
    ]
  },

  // 16. ROPE FACE PULL
  'face-pull': {
    id: 'face-pull',
    name: 'Rope Face Pull',
    equipment: 'cable',
    defaultCamera: 'threeQuarter',
    cameraConfig: { theta: Math.PI / 3.2, phi: Math.PI / 2.5, radius: 2.15, targetY: 0.9 },
    primaryMuscles: ['posterior_deltoid', 'infraspinatus'],
    secondaryMuscles: ['rhomboids', 'middle_trapezius'],
    jointAngle: {
      name: 'External Rotation Angle',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 155,
      optimalPeakDeg: 80
    },
    trajectory: {
      joint: 'handL',
      type: 'face_pull_arc',
      startOffset: [0, 0.1, 0.40],
      endOffset: [0.15, 0.15, -0.05]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Thumbs Backward / External Rotation', bone: 'handL', color: 'emerald' },
        { text: '✓ High Elbows Level With Ears', bone: 'forearmL', color: 'emerald' },
        { text: '✓ 1s Rear Delt & Rotator Cuff Squeeze', bone: 'shoulderL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Pull the center of the rope toward your bridge of nose. Flay the rope ends apart, drive elbows high and back, and rotate thumbs toward the wall behind you.',
      tempo: '2s Pull & Rotate • 1.5s Rear Delt Hold • 3s Rebound Stretch'
    },
    commonMistake: {
      title: 'Elbows Dropping into Low Row',
      badges: [
        { text: '⚠ Elbows Dropping to Chest', bone: 'forearmL', color: 'rose' },
        { text: '⚠ Zero External Rotation', bone: 'handL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not turn this into a row. Keep elbows high and rotate thumbs backward to activate your rear delts and rotator cuffs.',
      spineTwist: 0.20,
      elbowFlare: 0.20,
      romCut: 0.30
    },
    aiPrompts: [
      { id: 'thumbs_back', text: 'Rotate thumbs backward', targetBone: 'handL', cue: 'Triggers active external rotation of the humerus.' }
    ]
  },

  // 17. INCLINE DUMBBELL BICEP CURL & HAMMER CURL
  'incline-dumbbell-curl': {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Bicep Curl',
    equipment: 'dumbbell',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.1, targetY: 0.85 },
    primaryMuscles: ['biceps_long_head', 'biceps_short_head'],
    secondaryMuscles: ['brachialis', 'brachioradialis'],
    jointAngle: {
      name: 'Elbow Flexion',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 170,
      optimalPeakDeg: 55
    },
    trajectory: {
      joint: 'handL',
      type: 'curl_arc',
      startOffset: [0, -0.40, -0.05],
      endOffset: [0, 0.15, 0.12]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Upper Arm Locked Perpendicular', bone: 'upper_armL', color: 'emerald' },
        { text: '✓ Supinated Wrist at Apex', bone: 'handL', color: 'emerald' },
        { text: '✓ Full Long-Head Passive Stretch', bone: 'shoulderL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Keep upper arms pointing straight to the floor throughout. Curl up, rotate your pinkies toward your shoulders, and resist the 3s descent.',
      tempo: '1.5s Curl • 1s Squeeze Peak • 3s Strict Eccentric Stretch'
    },
    commonMistake: {
      title: 'Elbow Forward Drift & Front Delt Swing',
      badges: [
        { text: '⚠ Elbows Drifting Forward', bone: 'upper_armL', color: 'rose' },
        { text: '⚠ Swinging Torso Off Bench', bone: 'spine001', color: 'rose' },
        { text: '⚠ Half-Rep Bottom Cut', bone: 'forearmL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Do not swing your elbows forward to cheat with front delts. Pin your elbows behind your torso to isolate the bicep long head.',
      spineTwist: 0.20,
      elbowFlare: 0.35,
      romCut: 0.35
    },
    aiPrompts: [
      { id: 'pin_elbows', text: 'Lock upper arms stationary', targetBone: 'upper_armL', cue: 'Zero shoulder flexion; pure elbow flexion.' },
      { id: 'supinate', text: 'Supinate pinkies upward', targetBone: 'handL', cue: 'Bicep serves as the prime forearm supinator.' },
      { id: 'full_stretch', text: 'Embrace the bottom stretch', targetMuscle: 'biceps_long_head', cue: 'Stretch-mediated hypertrophy is highest in this lengthened position.' }
    ]
  },
  'hammer-curl': {
    id: 'hammer-curl',
    name: 'Dumbbell Hammer Curl',
    equipment: 'dumbbell',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.1, targetY: 0.85 },
    primaryMuscles: ['brachialis', 'brachioradialis'],
    secondaryMuscles: ['biceps_brachii'],
    jointAngle: {
      name: 'Neutral Grip Curl',
      jointA: 'shoulderL',
      pivot: 'forearmL',
      jointB: 'handL',
      optimalStretchDeg: 170,
      optimalPeakDeg: 60
    },
    trajectory: {
      joint: 'handL',
      type: 'hammer_arc',
      startOffset: [0, -0.40, 0],
      endOffset: [0, 0.15, 0.15]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Neutral Palms-Facing Grip', bone: 'handL', color: 'emerald' },
        { text: '✓ Elbows Pinned Under Shoulders', bone: 'upper_armL', color: 'emerald' },
        { text: '✓ Arm Thickness Focus (Brachialis)', bone: 'forearmL', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Keep palms facing each other throughout the rep. Curl up to shoulder height without twisting your wrists, then lower slowly for 3 seconds.',
      tempo: '1.5s Hammer Up • 1s Contraction • 3s Controlled Lower'
    },
    commonMistake: {
      title: 'Swinging Torso & Wrists Twisting',
      badges: [
        { text: '⚠ Torso Momentum Swing', bone: 'spine001', color: 'rose' },
        { text: '⚠ Twisting Wrists / Losing Neutral', bone: 'handL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Avoid swinging your upper body. Maintain a strict neutral hammer grip to keep tension squarely on the brachialis and forearm.',
      spineTwist: 0.25,
      elbowFlare: 0.25,
      romCut: 0.30
    },
    aiPrompts: [
      { id: 'neutral_grip', text: 'Keep thumbs pointing up', targetBone: 'handL', cue: 'Maximizes brachialis recruitment beneath the biceps.' }
    ]
  },

  // 18. HANGING LEG / KNEE RAISE
  'hanging-leg-raise': {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg / Knee Raise',
    equipment: 'bodyweight',
    defaultCamera: 'side',
    cameraConfig: { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.35, targetY: 1.1 },
    primaryMuscles: ['rectus_abdominis'],
    secondaryMuscles: ['iliopsoas', 'obliques'],
    jointAngle: {
      name: 'Pelvic Curl Angle',
      jointA: 'shoulderL',
      pivot: 'thighL',
      jointB: 'shinL',
      optimalStretchDeg: 175,
      optimalPeakDeg: 75
    },
    trajectory: {
      joint: 'footL',
      type: 'leg_raise_arc',
      startOffset: [0, -0.65, 0],
      endOffset: [0, -0.15, 0.45]
    },
    correctForm: {
      title: 'Correct Biomechanical Form',
      badges: [
        { text: '✓ Posterior Pelvic Curl (Roll Hips Up)', bone: 'thighL', color: 'emerald' },
        { text: '✓ Deadhang with Active Shoulders', bone: 'shoulderL', color: 'emerald' },
        { text: '✓ Zero Pendulum Momentum', bone: 'spine001', color: 'emerald' }
      ],
      aiCoaching: 'Nouriq AI: Do not merely lift your thighs with hip flexors. Roll your pelvis upward toward your ribs to crunch your lower abs. Eliminate body swing.',
      tempo: '2s Curl Up • 1s Lower Ab Squeeze • 3s Zero-Swing Descent'
    },
    commonMistake: {
      title: 'Pendulum Swinging & Hip Flexor Domination',
      badges: [
        { text: '⚠ Pendulum Torso Swing', bone: 'spine001', color: 'rose' },
        { text: '⚠ Flat Pelvis (Hip Flexors Only)', bone: 'thighL', color: 'rose' }
      ],
      aiCoaching: 'Nouriq AI: Swinging your torso bypasses the abs. Stabilize your deadhang and curl your tailbone upward toward your chest.',
      spineTwist: 0.35,
      elbowFlare: 0.0,
      romCut: 0.35
    },
    aiPrompts: [
      { id: 'pelvic_curl', text: 'Roll tailbone toward sternum', targetBone: 'thighL', cue: 'Posterior pelvic tilt is essential to activate lower abdominal fibers.' }
    ]
  }
};

/**
 * Returns biomechanical metadata for any exercise ID, falling back to a robust default.
 */
export function getExerciseBiomechanics(exerciseId) {
  if (!exerciseId) return EXERCISE_BIOMECHANICS['one-arm-dumbbell-row'];
  const normalizedId = String(exerciseId).toLowerCase().trim();

  if (EXERCISE_BIOMECHANICS[normalizedId]) {
    return EXERCISE_BIOMECHANICS[normalizedId];
  }

  // Exact ID aliases
  if (normalizedId === 'incline-dumbbell-press') return EXERCISE_BIOMECHANICS['incline-dumbbell-press'];
  if (normalizedId === 'cable-chest-fly') return EXERCISE_BIOMECHANICS['cable-chest-fly'];
  if (normalizedId === 'cable-woodchopper') return EXERCISE_BIOMECHANICS['cable-woodchopper'];
  if (normalizedId === 'seated-cable-row') return EXERCISE_BIOMECHANICS['seated-cable-row'];
  if (normalizedId === 'barbell-deadlift') return EXERCISE_BIOMECHANICS['barbell-deadlift'];
  if (normalizedId === 'leg-press') return EXERCISE_BIOMECHANICS['leg-press'];
  if (normalizedId === 'leg-extension') return EXERCISE_BIOMECHANICS['leg-extension'];
  if (normalizedId === 'seated-leg-curl') return EXERCISE_BIOMECHANICS['seated-leg-curl'];
  if (normalizedId === 'standing-calf-raise') return EXERCISE_BIOMECHANICS['standing-calf-raise'];
  if (normalizedId === 'face-pull') return EXERCISE_BIOMECHANICS['face-pull'];
  if (normalizedId === 'hammer-curl') return EXERCISE_BIOMECHANICS['hammer-curl'];
  if (normalizedId === 'hanging-leg-raise') return EXERCISE_BIOMECHANICS['hanging-leg-raise'];

  // Substring matching
  if (normalizedId.includes('row') && normalizedId.includes('dumbbell')) return EXERCISE_BIOMECHANICS['one-arm-dumbbell-row'];
  if (normalizedId.includes('row')) return EXERCISE_BIOMECHANICS['seated-cable-row'];
  if (normalizedId.includes('tricep') && normalizedId.includes('overhead')) return EXERCISE_BIOMECHANICS['overhead-cable-tricep-extension'];
  if (normalizedId.includes('tricep') || normalizedId.includes('pushdown')) return EXERCISE_BIOMECHANICS['rope-tricep-pushdown'];
  if (normalizedId.includes('incline') && normalizedId.includes('press')) return EXERCISE_BIOMECHANICS['incline-dumbbell-press'];
  if (normalizedId.includes('bench') || normalizedId.includes('press') && normalizedId.includes('barbell')) return EXERCISE_BIOMECHANICS['barbell-bench-press'];
  if (normalizedId.includes('fly') || normalizedId.includes('woodchop')) return EXERCISE_BIOMECHANICS['cable-chest-fly'];
  if (normalizedId.includes('squat')) return EXERCISE_BIOMECHANICS['barbell-back-squat'];
  if (normalizedId.includes('leg-press')) return EXERCISE_BIOMECHANICS['leg-press'];
  if (normalizedId.includes('extension')) return EXERCISE_BIOMECHANICS['leg-extension'];
  if (normalizedId.includes('leg-curl') || normalizedId.includes('hamstring')) return EXERCISE_BIOMECHANICS['seated-leg-curl'];
  if (normalizedId.includes('calf')) return EXERCISE_BIOMECHANICS['standing-calf-raise'];
  if (normalizedId.includes('pulldown') || normalizedId.includes('pull-up')) return EXERCISE_BIOMECHANICS['lat-pulldown'];
  if (normalizedId.includes('hammer')) return EXERCISE_BIOMECHANICS['hammer-curl'];
  if (normalizedId.includes('curl')) return EXERCISE_BIOMECHANICS['incline-dumbbell-curl'];
  if (normalizedId.includes('rdl') || normalizedId.includes('romanian')) return EXERCISE_BIOMECHANICS['romanian-deadlift'];
  if (normalizedId.includes('deadlift')) return EXERCISE_BIOMECHANICS['barbell-deadlift'];
  if (normalizedId.includes('overhead') || (normalizedId.includes('shoulder') && normalizedId.includes('press'))) return EXERCISE_BIOMECHANICS['overhead-dumbbell-press'];
  if (normalizedId.includes('lateral') || normalizedId.includes('raise')) return EXERCISE_BIOMECHANICS['dumbbell-lateral-raise'];
  if (normalizedId.includes('face') || normalizedId.includes('pull')) return EXERCISE_BIOMECHANICS['face-pull'];
  if (normalizedId.includes('hanging') || normalizedId.includes('leg-raise')) return EXERCISE_BIOMECHANICS['hanging-leg-raise'];

  return EXERCISE_BIOMECHANICS['one-arm-dumbbell-row'];
}
