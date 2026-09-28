import { GameInfo } from '../types';

export const GAMES_DATA: Record<string, GameInfo> = {
  'reaction-rush': {
    id: 'reaction-rush',
    title: 'Reaction Rush',
    tagline: 'Test raw synaptic reflex speed down to the millisecond',
    description: 'Wait for the screen to turn vibrant emerald green, then tap as fast as humanly possible! Avoid false starts.',
    category: 'reflex',
    iconName: 'Zap',
    accentColor: 'from-emerald-500 to-teal-600',
    gradient: 'bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30',
    unit: 'ms',
    isLowerScoreBetter: true,
    howToPlay: [
      'Click start to begin the trial round.',
      'Wait patiently while the screen remains red.',
      'The moment it turns GREEN, click or tap immediately!',
      'Premature clicks trigger a false start penalty.',
      'Complete 5 rounds to get your certified reaction average.'
    ],
    tips: [
      'Focus your eyes slightly ahead of the screen center.',
      'Keep your finger hovering 1-2mm above the surface.',
      'Sub-200ms is considered esports professional level!'
    ]
  },
  'dodgeZone': {
    id: 'dodge-zone',
    title: 'Dodge Zone',
    tagline: 'Navigate chaotic bullet fields with surgical spatial evasion',
    description: 'Guide your energy orb through waves of incoming ballistic pulses, lasers, and tracking orbs. Pick up time-slow and shield orbs!',
    category: 'reflex',
    iconName: 'ShieldAlert',
    accentColor: 'from-amber-500 to-rose-600',
    gradient: 'bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-transparent border-amber-500/30',
    unit: 'sec',
    isLowerScoreBetter: false,
    howToPlay: [
      'Control your energy spark using mouse, touch drag, or arrow keys.',
      'Avoid all red and violet projectile hazards.',
      'Grab blue shields for invulnerability and cyan clocks for slow-motion.',
      'Graze close to hazards without touching them for extra combo points.'
    ],
    tips: [
      'Avoid staying pinned near the arena corners.',
      'Small micro-movements are much safer than wide erratic sweeps.'
    ]
  },
  'dodge-zone': {
    id: 'dodge-zone',
    title: 'Dodge Zone',
    tagline: 'Navigate chaotic bullet fields with surgical spatial evasion',
    description: 'Guide your energy orb through waves of incoming ballistic pulses, lasers, and tracking orbs. Pick up time-slow and shield orbs!',
    category: 'reflex',
    iconName: 'ShieldAlert',
    accentColor: 'from-amber-500 to-rose-600',
    gradient: 'bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-transparent border-amber-500/30',
    unit: 'sec',
    isLowerScoreBetter: false,
    howToPlay: [
      'Control your energy spark using mouse, touch drag, or arrow keys.',
      'Avoid all red and violet projectile hazards.',
      'Grab blue shields for invulnerability and cyan clocks for slow-motion.',
      'Graze close to hazards without touching them for extra combo points.'
    ],
    tips: [
      'Avoid staying pinned near the arena corners.',
      'Small micro-movements are much safer than wide erratic sweeps.'
    ]
  },
  'memory-matrix': {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    tagline: 'Spatial working memory and working span expansion',
    description: 'Observe a brief flash of illuminated tiles on a grid, then recall and activate each one. As you advance, grid dimensions and tile count expand.',
    category: 'memory',
    iconName: 'Grid3X3',
    accentColor: 'from-cyan-500 to-blue-600',
    gradient: 'bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30',
    unit: 'lvl',
    isLowerScoreBetter: false,
    howToPlay: [
      'A pattern of tiles will glow neon for 1.2 seconds.',
      'Commit their exact spatial positions to memory.',
      'Tap all highlighted tiles once the grid resets.',
      'You have 3 strikes before the memory matrix collapses.'
    ],
    tips: [
      'Group tiles into geometric shapes or lines (chunking technique).',
      'Track quadrant density rather than individual isolated points.'
    ]
  },
  'aim-master': {
    id: 'aim-master',
    title: 'Aim Master',
    tagline: 'Rotating revolver timing, orbital ball intercepts, and lethal hazards',
    description: 'A revolving cylinder rests at the center while green targets and red hazard balls orbit around it. Tap to fire your 6 bullets, eliminate all 3 green balls, and avoid hitting red balls!',
    category: 'precision',
    iconName: 'Crosshair',
    accentColor: 'from-rose-500 to-orange-600',
    gradient: 'bg-gradient-to-br from-rose-500/20 via-orange-500/10 to-transparent border-rose-500/30',
    unit: 'pts',
    isLowerScoreBetter: false,
    howToPlay: [
      'There is NO TIME LIMIT: take all the time you need to line up the perfect shot.',
      'The revolver in the center rotates continuously.',
      'Tap the screen (or press Space) to fire a bullet along the barrel\'s current heading.',
      'Your gun contains 6 bullets to destroy all 3 green target balls.',
      'When all 6 bullets are shot without destroying all green targets, the game ends.',
      'WARNING: Hitting any red ball results in instant elimination!'
    ],
    tips: [
      'No timer pressure: be patient and wait for the laser sight to align with a green ball.',
      'You have 6 bullets for 3 targets, allowing up to 3 misses before running out of ammo.',
      'Higher sectors increase orbital speeds and introduce direction shifts.'
    ]
  },
  'number-blitz': {
    id: 'number-blitz',
    title: 'Number Blitz',
    tagline: 'Visual scanning, sequential ordering, and cognitive speed',
    description: 'Search a randomized board of numbers and click them in ascending order from 1 to 24. Race against the ticking timer with zero mistakes!',
    category: 'speed',
    iconName: 'ListOrdered',
    accentColor: 'from-violet-500 to-purple-600',
    gradient: 'bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30',
    unit: 'sec',
    isLowerScoreBetter: true,
    howToPlay: [
      'Locate number 1 and tap it to start the clock.',
      'Quickly find and tap 2, then 3, all the way to 24 in sequence.',
      'A misclick incurs a +1.0 second time penalty!',
      'Clear the entire board in minimum time.'
    ],
    tips: [
      'While your hand moves to tap the current number, scan ahead for the next one.',
      'Mentally partition the grid into 4 sectors.'
    ]
  },
  'tap-master': {
    id: 'tap-master',
    title: 'Tap Master',
    tagline: 'Burst click frequency, finger cadence, and mechanical endurance',
    description: 'How many clicks can you unleash in 5 or 10 seconds? Push your CPS (clicks per second) into overdrive and unlock turbo flame frenzy.',
    category: 'speed',
    iconName: 'Flame',
    accentColor: 'from-amber-400 to-orange-600',
    gradient: 'bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent border-amber-400/30',
    unit: 'cps',
    isLowerScoreBetter: false,
    howToPlay: [
      'Choose a 5-second sprint or 10-second endurance mode.',
      'Tap the core button as fast as physically possible.',
      'Crossing 8 CPS sparks electrical arcs; 11+ CPS activates Supernova Flame mode!',
      'Watch your real-time CPS graph.'
    ],
    tips: [
      'On touchscreens, butterfly tap using alternating index and middle fingers.',
      'Keep your wrist loose and tap from the finger knuckle.'
    ]
  },
  'pattern-breaker': {
    id: 'pattern-breaker',
    title: 'Pattern Breaker',
    tagline: 'Sequential audio-visual mnemonic encoding and reproduction',
    description: 'Engage four harmonic sensory quadrants. Remember and repeat expanding musical and lighting sequences of increasing tempo.',
    category: 'memory',
    iconName: 'Sparkles',
    accentColor: 'from-indigo-500 to-blue-600',
    gradient: 'bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-transparent border-indigo-500/30',
    unit: 'seq',
    isLowerScoreBetter: false,
    howToPlay: [
      'Watch the sequence of glowing quadrants and listen to the tones.',
      'When the prompt changes to "YOUR TURN", reproduce the exact order.',
      'Each successful round adds another step to the pattern.',
      'One mistake ends the session.'
    ],
    tips: [
      'Associate numbers (1-4) or musical pitch (low to high) with each color.',
      'Repeat the sequence verbally in your mind rhythmically.'
    ]
  },
  'color-clash': {
    id: 'color-clash',
    title: 'Color Clash',
    tagline: 'Stroop effect inhibitory control and cognitive conflict resolution',
    description: 'Overcome cognitive interference! Determine in split seconds whether the word meaning matches the ink color, or identify the true ink color.',
    category: 'focus',
    iconName: 'Palette',
    accentColor: 'from-fuchsia-500 to-pink-600',
    gradient: 'bg-gradient-to-br from-fuchsia-500/20 via-pink-500/10 to-transparent border-fuchsia-500/30',
    unit: 'pts',
    isLowerScoreBetter: false,
    howToPlay: [
      'Read the color word (e.g. "BLUE") rendered in colored ink (e.g. yellow).',
      'Quickly decide if the displayed word matches the question requirement.',
      'Answer correctly to build a streak multiplier.',
      'Beat the 30-second countdown with maximum focus.'
    ],
    tips: [
      'Squint slightly if word reading reflex overwhelms your color detection.',
      'Train your eyes on the physical pigment, not the linguistic spelling.'
    ]
  },
  'memory-words': {
    id: 'memory-words',
    title: 'Memory Words',
    tagline: 'Verbal memory capacity and lexical recognition threshold',
    description: 'Words appear one after another. Decide whether you have already seen each word during this session, or if it is brand new.',
    category: 'memory',
    iconName: 'BookOpen',
    accentColor: 'from-teal-500 to-emerald-600',
    gradient: 'bg-gradient-to-br from-teal-500/20 via-emerald-500/10 to-transparent border-teal-500/30',
    unit: 'words',
    isLowerScoreBetter: false,
    howToPlay: [
      'A word appears in the center of the display.',
      'Click "SEEN" if this word has been shown before in this round.',
      'Click "NEW" if it is the first time you are seeing this word.',
      'You have 3 strikes. How many words can your working memory hold?'
    ],
    tips: [
      'Form vivid mental images or stories connecting seen words.',
      'Take 1 second to pause before clicking when unsure.'
    ]
  },
  'precision-path': {
    id: 'precision-path',
    title: 'Precision Path',
    tagline: 'Fine motor control, moving laser hazards, and narrow cyber conduits',
    description: 'Guide your neon spark through winding treacherous corridors and past lethal oscillating laser gates across 4 atmospheric themes!',
    category: 'precision',
    iconName: 'Route',
    accentColor: 'from-sky-500 to-indigo-600',
    gradient: 'bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-transparent border-sky-500/30',
    unit: 'pct',
    isLowerScoreBetter: false,
    howToPlay: [
      'Choose your theme (Cyber Neon, Molten Core, Bio-Crypt, Nebula Void) and difficulty.',
      'Click and hold the probe at START to engage navigation.',
      'Trace along the pathway through hairpin chicanes without touching barrier walls.',
      'Time your movements to slip past lethal oscillating hazard laser gates.',
      'Reach FINISH with maximum core integrity for huge score multipliers!'
    ],
    tips: [
      'Apex difficulty shrinks conduit width to a razor-thin 12.5px with 2.4x score multiplier!',
      'Watch laser oscillation cycles and pause in wider pockets before sprinting through.',
      'Maintain smooth, fluid hand motion rather than jerky stop-start clicks.'
    ]
  }
};

export const GAMES_LIST: GameInfo[] = [
  GAMES_DATA['reaction-rush'],
  GAMES_DATA['dodge-zone'],
  GAMES_DATA['memory-matrix'],
  GAMES_DATA['aim-master'],
  GAMES_DATA['number-blitz'],
  GAMES_DATA['tap-master'],
  GAMES_DATA['pattern-breaker'],
  GAMES_DATA['color-clash'],
  GAMES_DATA['memory-words'],
  GAMES_DATA['precision-path']
];
