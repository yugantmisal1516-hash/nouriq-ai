// Intermittent Fasting Protocols & Metabolic Stages

export const FASTING_PROTOCOLS = [
  {
    id: '16:8',
    name: '16:8 Lean Gains',
    fastHours: 16,
    eatHours: 8,
    difficulty: 'Popular / Moderate',
    description: '16 hours fasting with an 8-hour eating window (e.g. 12 PM to 8 PM). Ideal for fat loss and muscle maintenance.'
  },
  {
    id: '18:6',
    name: '18:6 Deep Fast',
    fastHours: 18,
    eatHours: 6,
    difficulty: 'Intermediate',
    description: 'Extended 18-hour fast that accelerates ketosis and stimulates initial autophagy cellular repair.'
  },
  {
    id: '20:4',
    name: '20:4 Warrior Diet',
    fastHours: 20,
    eatHours: 4,
    difficulty: 'Advanced',
    description: '20 hours fasting daily with a concentrated 4-hour eating window.'
  },
  {
    id: 'OMAD',
    name: 'OMAD (One Meal A Day)',
    fastHours: 23,
    eatHours: 1,
    difficulty: 'Expert',
    description: '23-hour daily fast ending with one nutrient-dense meal. Maximum metabolic reset.'
  }
];

export const METABOLIC_STAGES = [
  {
    id: 'digestion',
    name: 'Anabolic / Digestion Phase',
    minHours: 0,
    maxHours: 4,
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    description: 'Blood sugar rises as your body digests and absorbs nutrients from your last meal.'
  },
  {
    id: 'stabilization',
    name: 'Blood Sugar Stabilization',
    minHours: 4,
    maxHours: 8,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    description: 'Insulin levels drop to baseline. Liver glycogen is mobilized to maintain steady energy.'
  },
  {
    id: 'fat-burning',
    name: 'Fat Burning Activation',
    minHours: 8,
    maxHours: 12,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description: 'Glycogen stores decline. Human Growth Hormone (HGH) increases and fat burning begins.'
  },
  {
    id: 'ketosis',
    name: 'Ketosis State',
    minHours: 12,
    maxHours: 16,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'The liver converts fatty acids into ketones for brain energy. Accelerated fat loss.'
  },
  {
    id: 'autophagy',
    name: 'Autophagy & Cellular Repair',
    minHours: 16,
    maxHours: 24,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    description: 'Cells break down and recycle damaged proteins and mitochondria. Deep rejuvenation.'
  }
];
