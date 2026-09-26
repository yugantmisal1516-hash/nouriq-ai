/**
 * NOURIQ AI — EXERCISE BIOMECHANICS & SPORTS SCIENCE ENGINE DATABASE
 * 
 * Defines deep anatomical maps, primary & secondary muscle targets,
 * dynamic joint angle tracking configurations, movement trajectory curves,
 * correct textbook kinematics, realistic common mistake kinematics,
 * and reactive AI coach cues.
 */

export const EXERCISE_BIOMECHANICS = {
  // 1. ONE-ARM DUMBBELL ROW (The Signature Reference Benchmark)
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

  // 3. BARBELL BENCH PRESS
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

  // 4. BARBELL BACK SQUAT
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

  // 5. LAT PULLDOWN (WIDE GRIP)
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

  // 6. INCLINE DUMBBELL BICEP CURL
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

  // 7. DUMBBELL / BARBELL ROMANIAN DEADLIFT (RDL)
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

  // 8. SEATED OVERHEAD DUMBBELL PRESS
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

  // 9. DUMBBELL LATERAL RAISE
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

  // Substring matching
  if (normalizedId.includes('row')) return EXERCISE_BIOMECHANICS['one-arm-dumbbell-row'];
  if (normalizedId.includes('tricep') || normalizedId.includes('pushdown')) return EXERCISE_BIOMECHANICS['rope-tricep-pushdown'];
  if (normalizedId.includes('bench') || normalizedId.includes('press') && normalizedId.includes('incline')) return EXERCISE_BIOMECHANICS['barbell-bench-press'];
  if (normalizedId.includes('squat')) return EXERCISE_BIOMECHANICS['barbell-back-squat'];
  if (normalizedId.includes('pulldown')) return EXERCISE_BIOMECHANICS['lat-pulldown'];
  if (normalizedId.includes('curl')) return EXERCISE_BIOMECHANICS['incline-dumbbell-curl'];
  if (normalizedId.includes('deadlift') || normalizedId.includes('rdl')) return EXERCISE_BIOMECHANICS['romanian-deadlift'];
  if (normalizedId.includes('overhead') || (normalizedId.includes('shoulder') && normalizedId.includes('press'))) return EXERCISE_BIOMECHANICS['overhead-dumbbell-press'];
  if (normalizedId.includes('lateral') || normalizedId.includes('raise')) return EXERCISE_BIOMECHANICS['dumbbell-lateral-raise'];

  return EXERCISE_BIOMECHANICS['one-arm-dumbbell-row'];
}
