/**
 * activityRecommendations.js
 *
 * Static curated activity catalogue keyed by developmental domain.
 * The recommendation engine reads this map and filters by the child's
 * weakest/needs-support domains from their latest milestone assessment.
 *
 * Each activity entry:
 *   id          — stable unique key
 *   title       — short display name
 *   description — one-sentence parent guidance note
 *   emoji       — visual icon for the card
 *   category    — maps to ActivityCard category colours
 *   duration    — human-readable estimate
 *   difficulty  — "Easy" | "Medium" | "Hard"
 *   coins       — reward shown on card
 *   tips        — array of 2-3 practical tips for parents
 *   tags        — searchable keywords
 */

export const DOMAIN_META = {
  'Physical Development': {
    label:   'Physical Development',
    emoji:   '🏃',
    color:   '#10B981',
    bgColor: 'rgba(16,185,129,0.10)',
    description: 'Activities that build gross motor skills, coordination, and body awareness.',
  },
  'Cognitive Development': {
    label:   'Cognitive Development',
    emoji:   '🧠',
    color:   '#7C3AED',
    bgColor: 'rgba(124,58,237,0.10)',
    description: 'Activities that strengthen problem-solving, memory, and early thinking skills.',
  },
  'Social Development': {
    label:   'Social Development',
    emoji:   '🤝',
    color:   '#2563EB',
    bgColor: 'rgba(37,99,235,0.10)',
    description: 'Activities that develop communication, sharing, and relationship skills.',
  },
  'Emotional Development': {
    label:   'Emotional Development',
    emoji:   '❤️',
    color:   '#DC2626',
    bgColor: 'rgba(220,38,38,0.10)',
    description: 'Activities that help children identify, express, and regulate their emotions.',
  },
  'Aesthetic Development': {
    label:   'Aesthetic Development',
    emoji:   '🎨',
    color:   '#D97706',
    bgColor: 'rgba(217,119,6,0.10)',
    description: 'Activities that nurture creativity, imagination, music, and sensory play.',
  },
};

// ─────────────────────────────────────────────────────────────
// ACTIVITY CATALOGUE  (3–4 activities per domain)
// ─────────────────────────────────────────────────────────────

export const ACTIVITY_CATALOGUE = {
  'Physical Development': [
    {
      id: 'phy_001',
      title: 'Tummy Time Play',
      description: 'Place baby on their tummy on a soft mat for 5 minutes to build neck and shoulder strength.',
      emoji: '🐢',
      category: 'Science',
      duration: '5–10 min',
      difficulty: 'Easy',
      coins: 5,
      tips: [
        'Start with 2–3 minutes and gradually increase.',
        'Place a colourful toy in front to encourage lifting.',
        'Always supervise — never leave baby alone.',
      ],
      tags: ['gross motor', 'neck strength', 'tummy time'],
    },
    {
      id: 'phy_002',
      title: 'Ball Roll & Chase',
      description: 'Gently roll a soft ball toward your child and encourage them to push or roll it back.',
      emoji: '⚽',
      category: 'Social',
      duration: '10 min',
      difficulty: 'Easy',
      coins: 8,
      tips: [
        'Use a large, light, brightly coloured ball.',
        'Cheer enthusiastically when they push it back.',
        'Roll slowly so they can track the movement.',
      ],
      tags: ['coordination', 'reaching', 'cause-effect'],
    },
    {
      id: 'phy_003',
      title: 'Obstacle Course Crawl',
      description: 'Set up soft pillows and cushions to create a safe crawling obstacle course.',
      emoji: '🏔️',
      category: 'Science',
      duration: '15 min',
      difficulty: 'Medium',
      coins: 12,
      tips: [
        'Keep obstacles low and well-padded.',
        'Crawl through with them to model the path.',
        'Praise every attempt, not just completions.',
      ],
      tags: ['crawling', 'gross motor', 'spatial awareness'],
    },
    {
      id: 'phy_004',
      title: 'Dance & Move Together',
      description: 'Hold your baby and sway, bounce gently, or move to music — great for balance and bonding.',
      emoji: '💃',
      category: 'Music',
      duration: '5–10 min',
      difficulty: 'Easy',
      coins: 6,
      tips: [
        'Support head and neck at all times for young babies.',
        'Use upbeat, familiar nursery rhymes.',
        'Mirror your child\'s movements to encourage imitation.',
      ],
      tags: ['balance', 'vestibular', 'bonding', 'music'],
    },
  ],

  'Cognitive Development': [
    {
      id: 'cog_001',
      title: 'Peek-a-Boo Game',
      description: 'Classic peek-a-boo teaches object permanence — that things still exist when hidden.',
      emoji: '🙈',
      category: 'Literacy',
      duration: '5 min',
      difficulty: 'Easy',
      coins: 5,
      tips: [
        'Start by hiding your face behind your hands.',
        'Use a cloth or blanket for variation.',
        'Pause before revealing to build anticipation.',
      ],
      tags: ['object permanence', 'attention', 'memory'],
    },
    {
      id: 'cog_002',
      title: 'Sorting & Stacking',
      description: 'Provide large soft blocks or rings to sort by colour or stack into towers.',
      emoji: '🧱',
      category: 'Math',
      duration: '10–15 min',
      difficulty: 'Easy',
      coins: 8,
      tips: [
        'Name colours as you sort: "Let\'s put the red one here!"',
        'Knock the tower down together — it\'s part of the fun.',
        'Let them lead and avoid correcting placements.',
      ],
      tags: ['sorting', 'spatial', 'colour recognition', 'problem-solving'],
    },
    {
      id: 'cog_003',
      title: 'Mirror Exploration',
      description: 'Hold your child in front of a mirror and make faces together to build self-awareness.',
      emoji: '🪞',
      category: 'Science',
      duration: '5 min',
      difficulty: 'Easy',
      coins: 5,
      tips: [
        'Point to their reflection and say their name.',
        'Make different expressions: happy, surprised, silly.',
        'Tap the mirror and describe what happens.',
      ],
      tags: ['self-recognition', 'imitation', 'cause-effect'],
    },
    {
      id: 'cog_004',
      title: 'Simple Puzzle Play',
      description: 'Use 2–3 piece wooden puzzles with knobs to develop early problem-solving.',
      emoji: '🧩',
      category: 'Math',
      duration: '10 min',
      difficulty: 'Medium',
      coins: 10,
      tips: [
        'Guide their hand without doing it for them.',
        'Name each piece as they pick it up.',
        'Celebrate loudly when a piece fits!',
      ],
      tags: ['problem-solving', 'hand-eye coordination', 'shape recognition'],
    },
  ],

  'Social Development': [
    {
      id: 'soc_001',
      title: 'Storytime Together',
      description: 'Read a board book daily, pointing to pictures and asking "What\'s that?" to build language.',
      emoji: '📚',
      category: 'Literacy',
      duration: '10 min',
      difficulty: 'Easy',
      coins: 8,
      tips: [
        'Let them touch and turn the pages.',
        'Use different voices for different characters.',
        'Re-read the same book — repetition builds vocabulary.',
      ],
      tags: ['language', 'listening', 'bonding', 'vocabulary'],
    },
    {
      id: 'soc_002',
      title: 'Wave Hello & Goodbye',
      description: 'Practice waving and saying hello/goodbye with family members to build social gestures.',
      emoji: '👋',
      category: 'Social',
      duration: '5 min',
      difficulty: 'Easy',
      coins: 5,
      tips: [
        'Wave yourself first so they can copy.',
        'Do it every time someone arrives or leaves.',
        'Clap and cheer when they wave.',
      ],
      tags: ['gesture', 'imitation', 'communication', 'routine'],
    },
    {
      id: 'soc_003',
      title: 'Playtime with a Friend',
      description: 'Arrange a brief playdate with a same-age child to build early parallel play skills.',
      emoji: '👫',
      category: 'Social',
      duration: '30 min',
      difficulty: 'Medium',
      coins: 15,
      tips: [
        'Set out duplicate toys to reduce conflict.',
        'Stay close but let them explore together.',
        'Narrate what you see: "Look, Priya is stacking!"',
      ],
      tags: ['parallel play', 'social interaction', 'sharing'],
    },
    {
      id: 'soc_004',
      title: 'Turn-Taking Clapping Game',
      description: 'Clap a pattern and wait for your child to copy — a fun way to learn taking turns.',
      emoji: '👏',
      category: 'Music',
      duration: '5 min',
      difficulty: 'Easy',
      coins: 6,
      tips: [
        'Start with a single clap and wait patiently.',
        'Add more claps as they get confident.',
        'Maintain eye contact and smile encouragingly.',
      ],
      tags: ['turn-taking', 'listening', 'imitation', 'rhythm'],
    },
  ],

  'Emotional Development': [
    {
      id: 'emo_001',
      title: 'Feelings Faces Book',
      description: 'Use a picture book with faces showing different emotions to name feelings together.',
      emoji: '😊',
      category: 'Literacy',
      duration: '5–10 min',
      difficulty: 'Easy',
      coins: 6,
      tips: [
        'Point to a face and say "She looks happy! When do you feel happy?"',
        'Make the face yourself to match.',
        'Validate all emotions — even the big ones.',
      ],
      tags: ['emotion recognition', 'vocabulary', 'empathy'],
    },
    {
      id: 'emo_002',
      title: 'Comfort Object Ritual',
      description: 'Introduce a consistent comfort object (stuffed toy) to help with self-soothing.',
      emoji: '🧸',
      category: 'Social',
      duration: 'Daily routine',
      difficulty: 'Easy',
      coins: 5,
      tips: [
        'Use the same object at nap and bedtime every day.',
        'Name the toy together to build attachment.',
        'Keep a spare identical toy in case of loss.',
      ],
      tags: ['self-soothing', 'security', 'attachment', 'routine'],
    },
    {
      id: 'emo_003',
      title: 'Big Feelings Breathing',
      description: 'Teach simple belly breathing with fun imagery — "smell the flower, blow the candle."',
      emoji: '🌬️',
      category: 'Science',
      duration: '3–5 min',
      difficulty: 'Easy',
      coins: 5,
      tips: [
        'Practice when calm so it\'s ready for difficult moments.',
        'Breathe together — don\'t just instruct.',
        'Use a pinwheel or bubbles as a visual anchor.',
      ],
      tags: ['self-regulation', 'calm down', 'breathing'],
    },
    {
      id: 'emo_004',
      title: 'Puppet Play Emotions',
      description: 'Use sock puppets to act out simple emotional stories and model healthy responses.',
      emoji: '🧦',
      category: 'Art',
      duration: '10–15 min',
      difficulty: 'Medium',
      coins: 10,
      tips: [
        'Let the puppet "feel sad" and show comfort.',
        'Ask "What should Mr. Sock do when he\'s mad?"',
        'Let your child be the puppet master too.',
      ],
      tags: ['role play', 'empathy', 'emotional vocabulary', 'creative play'],
    },
  ],

  'Aesthetic Development': [
    {
      id: 'aes_001',
      title: 'Finger Painting Fun',
      description: 'Use child-safe, washable paints on large paper for free-form sensory creativity.',
      emoji: '🎨',
      category: 'Art',
      duration: '15–20 min',
      difficulty: 'Easy',
      coins: 10,
      tips: [
        'Cover the surface well — messy is the point!',
        'Name colours as you use them.',
        'Display their art to build pride in their creation.',
      ],
      tags: ['fine motor', 'creativity', 'sensory', 'colour'],
    },
    {
      id: 'aes_002',
      title: 'Musical Instrument Exploration',
      description: 'Provide simple instruments (shaker, drum, xylophone) for free sound exploration.',
      emoji: '🥁',
      category: 'Music',
      duration: '10 min',
      difficulty: 'Easy',
      coins: 8,
      tips: [
        'Let them bang and shake freely before guiding.',
        'Play along with them to create a duet.',
        'Name the sounds: "That\'s loud! Now try soft."',
      ],
      tags: ['auditory', 'rhythm', 'creativity', 'cause-effect'],
    },
    {
      id: 'aes_003',
      title: 'Nature Texture Walk',
      description: 'Walk outside and let your child touch different textures — bark, grass, leaves, pebbles.',
      emoji: '🌿',
      category: 'Science',
      duration: '15–20 min',
      difficulty: 'Easy',
      coins: 8,
      tips: [
        'Describe each texture: "That\'s rough! This is smooth."',
        'Collect a few safe items to bring home and explore.',
        'Let them lead and follow their curiosity.',
      ],
      tags: ['sensory', 'nature', 'vocabulary', 'exploration'],
    },
    {
      id: 'aes_004',
      title: 'Play-Dough Sculpting',
      description: 'Roll, squeeze, and shape play-dough together to build fine motor and imagination.',
      emoji: '🫶',
      category: 'Art',
      duration: '15 min',
      difficulty: 'Easy',
      coins: 8,
      tips: [
        'Make simple shapes and name them: ball, snake, pancake.',
        'Use safe tools like a wooden spoon or plastic fork.',
        'Let them make whatever they like — it\'s process, not product.',
      ],
      tags: ['fine motor', 'creativity', 'sensory', 'imagination'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// RECOMMENDATION ENGINE  (pure functions — no side effects)
// ─────────────────────────────────────────────────────────────

/**
 * Ranks domains from weakest to strongest based on assessment domainScores.
 * Domains with no data are treated as needing support (percentage = 0).
 *
 * @param {Record<string, {earned, maxPossible, percentage}>} domainScores
 * @returns {{ domain: string, percentage: number }[]} sorted ascending by percentage
 */
export function rankDomainsByNeed(domainScores) {
  const ALL_DOMAINS = Object.keys(DOMAIN_META);
  return ALL_DOMAINS
    .map((domain) => ({
      domain,
      percentage: domainScores?.[domain]?.percentage ?? 0,
    }))
    .sort((a, b) => a.percentage - b.percentage);
}

/**
 * Selects up to `count` activity recommendations.
 * Picks activities from the weakest domain(s) first, then rounds up from
 * stronger domains to fill the count.
 *
 * Each returned activity is enriched with its domain metadata.
 *
 * @param {Record<string, {earned, maxPossible, percentage}>} domainScores
 * @param {number} count  Total cards to return (default 4)
 * @returns {object[]}    Enriched activity objects ready for rendering
 */
export function generateRecommendations(domainScores, count = 4) {
  const ranked = rankDomainsByNeed(domainScores);
  const picked = [];

  // Round-robin from weakest domain first, picking 1 activity per domain per round
  const domainPointers = {};
  while (picked.length < count) {
    let addedThisRound = false;
    for (const { domain } of ranked) {
      if (picked.length >= count) break;
      const pool = ACTIVITY_CATALOGUE[domain] || [];
      const idx  = domainPointers[domain] ?? 0;
      if (idx < pool.length) {
        picked.push({
          ...pool[idx],
          domain,
          domainMeta: DOMAIN_META[domain],
          domainPercentage: domainScores?.[domain]?.percentage ?? 0,
        });
        domainPointers[domain] = idx + 1;
        addedThisRound = true;
      }
    }
    if (!addedThisRound) break;
  }

  return picked;
}
