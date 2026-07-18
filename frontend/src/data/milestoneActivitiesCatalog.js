/**
 * Milestone-Wise E-Activity & Educational Game Catalog
 * Ages 0 to 6 Years (Levels 1-12)
 * Five developmental domains: Physical, Social, Emotional, Cognitive, and Aesthetic
 */

import milestones3to6Raw from './milestones_3_6.json';

// Dynamically compile level 7-12 milestones
const milestonesByLevel = {};
milestones3to6Raw.forEach(item => {
  const lvlKey = `L${item.level}`;
  if (!milestonesByLevel[lvlKey]) {
    milestonesByLevel[lvlKey] = {
      level: item.level,
      ageRange: item.age_group,
      description: `Development milestones and activities for children aged ${item.age_group}`,
      domains: {
        physical: [],
        social: [],
        emotional: [],
        cognitive: [],
        aesthetic: []
      }
    };
  }

  // Map domain name in JSON to key in domains
  let domainKey = 'physical';
  const rawDomain = item.domain?.toLowerCase() || '';
  if (rawDomain.includes('phys')) domainKey = 'physical';
  else if (rawDomain.includes('soc')) domainKey = 'social';
  else if (rawDomain.includes('emot')) domainKey = 'emotional';
  else if (rawDomain.includes('cogn')) domainKey = 'cognitive';
  else if (rawDomain.includes('aest')) domainKey = 'aesthetic';

  // Construct activity object
  const activity = {
    milestone: item.milestone,
    eActivity: item.skill,
    description: item.assessment_question,
    gameIdea: `Play Activity: Encourage the child to demonstrate "${item.skill}" during play sessions or structured exercises.`,
    aiIntegration: `AI computer vision checks motion symmetry and accuracy for "${item.skill}" during session log.`,
    learningOutcome: `Child develops capabilities in "${item.skill}" matching age expectations.`
  };

  // Avoid duplicates if same skill is repeated
  if (!milestonesByLevel[lvlKey].domains[domainKey].some(act => act.eActivity === activity.eActivity)) {
    milestonesByLevel[lvlKey].domains[domainKey].push(activity);
  }
});

export const MILESTONE_ACTIVITIES_CATALOG = {
  // LEVEL 1: 0-6 Months
  "0-6": {
    level: 1,
    ageRange: "0-6 Months",
    description: "Sensory awareness, early bonding, basic reflexes, beginning communication",
    domains: {
      physical: [
        {
          milestone: "Lifts head briefly during tummy time",
          eActivity: "Tummy Time Tracker",
          description: "An animated screen with high-contrast black-and-white patterns moves slowly to encourage the baby to lift its head during tummy time",
          gameIdea: "Head-Up Hero - A floating star rises every time the baby lifts their head",
          aiIntegration: "AI camera via tablet detects head elevation angle during tummy time and triggers celebratory animations automatically",
          learningOutcome: "Baby develops neck muscle strength and early proprioception"
        },
        {
          milestone: "Turns head side to side while on stomach",
          eActivity: "Sound Compass",
          description: "Left-and-right audio cues (gentle bells, familiar voices) prompt the baby to turn their head in each direction",
          gameIdea: "Follow the Sound - A sound travels left and right on screen",
          aiIntegration: "AI voice recognition detects caregiver-spoken cues and generates matching directional animations",
          learningOutcome: "Baby builds lateral neck control and auditory-motor connection"
        },
        {
          milestone: "Moves arms and legs in smooth, coordinated movements",
          eActivity: "Rhythm Mover",
          description: "Screen plays soft rhythmic music with bouncing visuals; caregiver gently moves baby's limbs in sync",
          gameIdea: "Wiggle Band - Each smooth movement earns a note on a music staff",
          aiIntegration: "AI detects periodic movement patterns via wearable sensor data or caregiver input",
          learningOutcome: "Baby develops bilateral motor coordination and body awareness"
        },
        {
          milestone: "Brings hands to mouth",
          eActivity: "Hand Discovery",
          description: "Interactive animations encourage baby to explore their hands and bring them to mouth",
          gameIdea: "Hand Explorer - Tracking hand-to-mouth movements with visual rewards",
          aiIntegration: "AI tracks hand movement patterns and celebrates self-soothing behaviors",
          learningOutcome: "Baby develops hand-eye coordination and self-soothing skills"
        },
        {
          milestone: "Reaches for and grasps toys",
          eActivity: "Reach & Grab",
          description: "Virtual toys appear on screen prompting reaching and grasping motions",
          gameIdea: "Treasure Grab - Each reach attempt earns a colorful reward",
          aiIntegration: "AI detects reaching movements and adjusts difficulty based on success rate",
          learningOutcome: "Baby develops fine motor skills and intentional movement"
        }
      ],
      social: [
        {
          milestone: "Makes eye contact while feeding or being held",
          eActivity: "Eye Connect",
          description: "Screen shows a gentle close-up of an expressive cartoon face making eye contact",
          gameIdea: "Gaze Garden - Each moment of eye contact grows a flower on the screen",
          aiIntegration: "AI front-camera estimates gaze direction and auto-starts a timer when eye contact is detected",
          learningOutcome: "Baby develops early social bonding and joint attention capacity"
        },
        {
          milestone: "Shows a social smile in response to a caregiver",
          eActivity: "Smile Journal",
          description: "Daily log where caregiver records first social smiles",
          gameIdea: "Smile Streak - Logging smiles daily builds a streak counter with confetti rewards",
          aiIntegration: "AI sentiment detection from caregiver selfie photos analyzes adult expression to match with baby smile logs",
          learningOutcome: "Baby develops early positive social response and emotional reciprocity"
        },
        {
          milestone: "Recognizes familiar faces",
          eActivity: "Face Friends",
          description: "Display photos of family members with names and baby's recognition logged",
          gameIdea: "Family Circle - Building a gallery of recognized loved ones",
          aiIntegration: "AI tracks which faces baby looks at longest and suggests bonding activities",
          learningOutcome: "Baby develops facial recognition and attachment to caregivers"
        },
        {
          milestone: "Enjoys being held and cuddled",
          eActivity: "Cuddle Time Tracker",
          description: "Log bonding moments with duration and baby's response",
          gameIdea: "Love Bank - Accumulating cuddle time builds connection points",
          aiIntegration: "AI suggests optimal cuddle times based on baby's mood patterns",
          learningOutcome: "Baby develops secure attachment and trust"
        }
      ],
      emotional: [
        {
          milestone: "Social smiling in response to others",
          eActivity: "Smile Gallery",
          description: "Caregiver captures baby's first social smiles via photo log",
          gameIdea: "Smile Collector - Each unique first smile earns a star",
          aiIntegration: "AI analyzes photo timestamps to plot smile frequency growth curves",
          learningOutcome: "Baby develops reciprocal emotional expression and early joy response"
        },
        {
          milestone: "Calms when picked up",
          eActivity: "Comfort Tracker",
          description: "Track how quickly baby calms when held by different caregivers",
          gameIdea: "Peace Finder - Measure calming time and patterns",
          aiIntegration: "AI identifies which soothing techniques work best for individual baby",
          learningOutcome: "Baby develops trust and emotional regulation with caregiver support"
        },
        {
          milestone: "Shows excitement through body movements",
          eActivity: "Joy Jumps",
          description: "Detect and celebrate excited movements like kicking and arm waving",
          gameIdea: "Happy Dance - Movement detection triggers celebration animations",
          aiIntegration: "AI recognizes excitement patterns and links them to triggering events",
          learningOutcome: "Baby develops emotional expression through physical movement"
        }
      ],
      cognitive: [
        {
          milestone: "Responds to own name",
          eActivity: "Name Recognition Log",
          description: "Caregiver calls baby's name during play; taps when baby pauses, turns, or vocalizes in response",
          gameIdea: "Name Game - Each name response earns a letter badge spelling the baby's name",
          aiIntegration: "AI voice recognition auto-detects when the baby's name is spoken and times the response delay",
          learningOutcome: "Baby develops early phonological awareness and self-identification"
        },
        {
          milestone: "Tracks moving objects with eyes",
          eActivity: "Follow the Ball",
          description: "Animated objects move across screen at varying speeds for visual tracking",
          gameIdea: "Eye Detective - Track the bouncing ball and earn points",
          aiIntegration: "AI adjusts movement speed based on baby's tracking ability",
          learningOutcome: "Baby develops visual tracking and prediction skills"
        },
        {
          milestone: "Shows curiosity about surroundings",
          eActivity: "Wonder World",
          description: "Display various objects and sounds to stimulate curiosity",
          gameIdea: "Curiosity Catalog - New items added as baby explores",
          aiIntegration: "AI suggests novel stimuli based on what captures baby's attention",
          learningOutcome: "Baby develops curiosity and exploratory behavior"
        },
        {
          milestone: "Recognizes familiar sounds",
          eActivity: "Sound Memory",
          description: "Play familiar sounds (doorbell, pet, caregiver voice) and log recognition",
          gameIdea: "Sound Safari - Match sounds to their sources",
          aiIntegration: "AI creates personalized sound libraries from baby's environment",
          learningOutcome: "Baby develops auditory memory and environmental awareness"
        }
      ],
      aesthetic: [
        {
          milestone: "Responds to high-contrast visual patterns",
          eActivity: "Pattern Play",
          description: "Rotating high-contrast black-and-white patterns animate slowly on screen with soft ambient music",
          gameIdea: "Pattern Explorer - Caregiver taps which pattern baby fixated on longest",
          aiIntegration: "AI tracks fixation patterns and progressively increases visual complexity based on baby's attention span data",
          learningOutcome: "Baby develops visual cortex stimulation and early aesthetic attention"
        },
        {
          milestone: "Enjoys music and rhythmic sounds",
          eActivity: "Musical Moments",
          description: "Variety of gentle lullabies and rhythmic songs with visual accompaniment",
          gameIdea: "Melody Garden - Different songs grow different flowers",
          aiIntegration: "AI learns which musical styles baby prefers and creates playlists",
          learningOutcome: "Baby develops musical appreciation and auditory discrimination"
        },
        {
          milestone: "Responds to colorful objects",
          eActivity: "Color Carousel",
          description: "Bright primary colors rotate slowly with naming and sounds",
          gameIdea: "Rainbow Ride - Explore the color wheel with rewards",
          aiIntegration: "AI tracks which colors attract longest gaze times",
          learningOutcome: "Baby develops color perception and visual preferences"
        },
        {
          milestone: "Watches faces intently",
          eActivity: "Expression Explorer",
          description: "Animated faces show different expressions with gentle sounds",
          gameIdea: "Feeling Faces - Match expressions to emotions",
          aiIntegration: "AI detects which expressions baby mirrors or responds to",
          learningOutcome: "Baby develops facial expression recognition and emotional awareness"
        }
      ]
    }
  },

  // LEVEL 2: 6-12 Months
  "6-12": {
    level: 2,
    ageRange: "6-12 Months",
    description: "Emerging mobility, object exploration, early language sounds, cause-effect understanding",
    domains: {
      physical: [
        {
          milestone: "Sits without support",
          eActivity: "Sit & Explore",
          description: "Camera-based posture check animation shows a seated baby",
          gameIdea: "Sit Champ Timer - Each second sitting earns a point; longest sit time earns a throne badge",
          aiIntegration: "AI posture detection estimates trunk stability and flags progression from supported to unsupported sitting",
          learningOutcome: "Baby develops core trunk stability and postural balance"
        },
        {
          milestone: "Crawls on hands and knees",
          eActivity: "Crawl Course",
          description: "Animated obstacle course on screen; caregiver drags toy across floor to motivate crawling",
          gameIdea: "Crawl Rally - Distance logged unlocks new terrain levels (carpet → grass → sand)",
          aiIntegration: "AI via floor camera tracks crawling path and estimates speed, distance, and symmetry",
          learningOutcome: "Baby develops cross-lateral movement, upper body strength, and spatial navigation"
        },
        {
          milestone: "Pulls to standing",
          eActivity: "Stand Up Star",
          description: "Motivational animations encourage pulling up using furniture",
          gameIdea: "Rising Champion - Track standing attempts and duration",
          aiIntegration: "AI monitors standing posture and balance improvement over time",
          learningOutcome: "Baby develops leg strength and balance for walking preparation"
        },
        {
          milestone: "Transfers objects from hand to hand",
          eActivity: "Hand Switch",
          description: "Interactive game encouraging passing toys between hands",
          gameIdea: "Pass Master - Each successful transfer earns a point",
          aiIntegration: "AI tracks hand preference and coordination development",
          learningOutcome: "Baby develops bilateral coordination and fine motor control"
        },
        {
          milestone: "Uses pincer grasp",
          eActivity: "Tiny Treasure Hunt",
          description: "Virtual small objects to pick up using thumb and finger",
          gameIdea: "Precision Picker - Collect gems using pincer grip",
          aiIntegration: "AI detects pincer grasp formation and celebrates milestones",
          learningOutcome: "Baby develops fine motor precision and finger strength"
        }
      ],
      social: [
        {
          milestone: "Shares toys with peers",
          eActivity: "Share & Trade",
          description: "Animated sequence shows two cartoon children trading toys",
          gameIdea: "Share Streak - Each sharing moment earns a gift box",
          aiIntegration: "AI monitors play session patterns and generates prompts for caregivers when a sharing opportunity arises",
          learningOutcome: "Baby develops early prosocial behavior and turn-taking foundation"
        },
        {
          milestone: "Waves bye-bye",
          eActivity: "Wave Hello",
          description: "Interactive characters wave and encourage baby to wave back",
          gameIdea: "Goodbye Buddy - Each wave attempt earns a friendly response",
          aiIntegration: "AI detects waving gestures via camera and responds with encouragement",
          learningOutcome: "Baby develops social gestures and communication skills"
        },
        {
          milestone: "Plays peek-a-boo",
          eActivity: "Peek-a-Boo Party",
          description: "Interactive peek-a-boo game with various characters",
          gameIdea: "Hide & Seek Fun - Characters hide and reveal with baby's participation",
          aiIntegration: "AI adapts hiding duration based on baby's anticipation behavior",
          learningOutcome: "Baby develops social play and object permanence understanding"
        },
        {
          milestone: "Shows preferences for people",
          eActivity: "Favorite Faces",
          description: "Track which people baby reaches for or responds to most",
          gameIdea: "Friend Finder - Map baby's social preferences and bonds",
          aiIntegration: "AI analyzes reaction patterns to different caregivers",
          learningOutcome: "Baby develops selective attachment and social preferences"
        }
      ],
      emotional: [
        {
          milestone: "Shows stranger anxiety",
          eActivity: "Safe Face Trainer",
          description: "New face introduced gradually on screen alongside familiar face",
          gameIdea: "Familiar Friends Map - Faces that become comfortable over sessions move from 'New' to 'Safe'",
          aiIntegration: "AI tracks stranger anxiety severity over time and generates gradual exposure schedules",
          learningOutcome: "Baby develops healthy attachment and self-protective social instinct"
        },
        {
          milestone: "Shows separation anxiety",
          eActivity: "Goodbye Games",
          description: "Practice short separations with reassuring return animations",
          gameIdea: "Return Rewards - Build trust through separation and reunion cycles",
          aiIntegration: "AI tracks separation tolerance and suggests gradual increase strategies",
          learningOutcome: "Baby develops secure attachment and coping with separation"
        },
        {
          milestone: "Expresses various emotions",
          eActivity: "Emotion Wheel",
          description: "Display and name different emotions baby shows throughout day",
          gameIdea: "Feeling Tracker - Catalog baby's emotional expressions",
          aiIntegration: "AI facial analysis identifies emotional states and patterns",
          learningOutcome: "Baby develops emotional expression and caregiver understanding"
        },
        {
          milestone: "Seeks comfort when upset",
          eActivity: "Comfort Connection",
          description: "Track what soothes baby and how quickly calming occurs",
          gameIdea: "Calm Down Coach - Find best soothing techniques",
          aiIntegration: "AI identifies most effective calming methods for individual baby",
          learningOutcome: "Baby develops emotional regulation with caregiver support"
        }
      ],
      cognitive: [
        {
          milestone: "Understands object permanence",
          eActivity: "Peek Behind",
          description: "Screen shows an object disappearing behind a curtain, then reappearing",
          gameIdea: "Find the Hidden Toy - 3-cup shell game with a digital scoreboard",
          aiIntegration: "AI generates progressively harder hiding sequences based on baby's correct-find percentage",
          learningOutcome: "Baby develops object permanence, memory, and anticipatory search"
        },
        {
          milestone: "Explores objects in different ways",
          eActivity: "Discovery Lab",
          description: "Present virtual objects to shake, bang, throw, and drop",
          gameIdea: "Science Baby - Experiment with cause and effect",
          aiIntegration: "AI catalogs exploration methods and suggests new object types",
          learningOutcome: "Baby develops problem-solving and experimentation skills"
        },
        {
          milestone: "Finds hidden objects easily",
          eActivity: "Treasure Hunt",
          description: "Progressive hiding game with increasing difficulty",
          gameIdea: "Master Finder - Locate objects in various hiding spots",
          aiIntegration: "AI adjusts difficulty based on success rate",
          learningOutcome: "Baby develops memory and spatial reasoning"
        },
        {
          milestone: "Responds to simple verbal requests",
          eActivity: "Action Helper",
          description: "Simple commands like 'come here' or 'give me' with visual cues",
          gameIdea: "Command Captain - Follow directions for rewards",
          aiIntegration: "AI voice recognition tracks comprehension of verbal cues",
          learningOutcome: "Baby develops receptive language and instruction following"
        },
        {
          milestone: "Imitates gestures and sounds",
          eActivity: "Copycat Game",
          description: "Characters make sounds and gestures for baby to imitate",
          gameIdea: "Mimic Master - Copy actions and sounds",
          aiIntegration: "AI detects imitation attempts and provides encouraging feedback",
          learningOutcome: "Baby develops imitation skills and learning through observation"
        }
      ],
      aesthetic: [
        {
          milestone: "Responds to music with body movement",
          eActivity: "Move to the Beat",
          description: "Screen plays varied tempos; caregiver logs whether baby bounces, sways, or claps in response",
          gameIdea: "Dance Diary - Each rhythmic response earns a dance move icon",
          aiIntegration: "AI audio analysis matches baby movement timestamps to musical beats to measure rhythmic entrainment",
          learningOutcome: "Baby develops auditory-motor integration and musicality"
        },
        {
          milestone: "Explores texture and materials",
          eActivity: "Touch & Feel Journey",
          description: "Virtual textures paired with real sensory materials",
          gameIdea: "Texture Explorer - Discover soft, rough, smooth, bumpy",
          aiIntegration: "AI tracks tactile preferences and suggests sensory activities",
          learningOutcome: "Baby develops tactile discrimination and sensory awareness"
        },
        {
          milestone: "Shows interest in picture books",
          eActivity: "Story Time Starter",
          description: "Simple picture books with animations and sounds",
          gameIdea: "Page Turner - Explore colorful picture books",
          aiIntegration: "AI tracks engagement duration and favorite book types",
          learningOutcome: "Baby develops visual literacy and attention span"
        },
        {
          milestone: "Enjoys cause-effect toys",
          eActivity: "Button Pusher",
          description: "Interactive buttons that trigger sounds, lights, and animations",
          gameIdea: "Magic Buttons - Press to see what happens",
          aiIntegration: "AI introduces progressively complex cause-effect relationships",
          learningOutcome: "Baby develops understanding of cause and effect"
        }
      ]
    }
  },

  // LEVEL 3: 1-1.5 Years (12-18 Months)
  "12-18": {
    level: 3,
    ageRange: "1-1.5 Years",
    description: "Walking development, vocabulary expansion, increased independence, simple problem-solving",
    domains: {
      physical: [
        {
          milestone: "Walks independently (first steps)",
          eActivity: "First Steps Celebration",
          description: "Screen activates 'First Steps Fireworks' animation when caregiver logs baby's first unaided steps",
          gameIdea: "Step Collector - Daily step count logs build a 'Walking Wall'",
          aiIntegration: "AI step detection via phone accelerometer tracks walking frequency and gait stability over weeks",
          learningOutcome: "Baby develops dynamic balance, leg strength, and autonomous locomotion"
        },
        {
          milestone: "Scribbles spontaneously",
          eActivity: "Scribble Studio",
          description: "Digital drawing surface lets child make first marks with finger",
          gameIdea: "Art Board - Each unique scribble session generates an 'artwork' saved in a digital gallery",
          aiIntegration: "AI analyzes scribble complexity over time (random → circular → directional)",
          learningOutcome: "Child develops pre-writing hand control, creative expression, and visual-motor coordination"
        },
        {
          milestone: "Climbs onto furniture",
          eActivity: "Climb Quest",
          description: "Track climbing milestones and safety awareness",
          gameIdea: "Mountain Climber - Log different surfaces climbed successfully",
          aiIntegration: "AI monitors climbing safety patterns and suggests appropriate challenges",
          learningOutcome: "Child develops gross motor skills, spatial awareness, and confidence"
        },
        {
          milestone: "Throws ball overhand",
          eActivity: "Throw Pro",
          description: "Practice throwing with targets and distance tracking",
          gameIdea: "Target Master - Hit different targets for points",
          aiIntegration: "AI tracks throwing accuracy and distance improvements",
          learningOutcome: "Child develops arm strength, hand-eye coordination, and aim"
        },
        {
          milestone: "Stacks blocks",
          eActivity: "Tower Builder",
          description: "Virtual and physical block stacking challenges",
          gameIdea: "Sky Tower - Build progressively taller towers",
          aiIntegration: "AI counts blocks and celebrates height milestones",
          learningOutcome: "Child develops fine motor precision, balance, and spatial reasoning"
        }
      ],
      social: [
        {
          milestone: "Plays alongside peers (parallel play)",
          eActivity: "Side-by-Side Studio",
          description: "Caregiver logs parallel play sessions: duration, materials shared, peer proximity",
          gameIdea: "Play Date Planner - Each parallel play session earns a 'friend dot' on a friendship map",
          aiIntegration: "AI suggests activity setups that naturally bring children into parallel play proximity",
          learningOutcome: "Child develops awareness of peers and readiness for cooperative play"
        },
        {
          milestone: "Shows affection to familiar people",
          eActivity: "Hug Tracker",
          description: "Log spontaneous hugs, kisses, and affection displays",
          gameIdea: "Love Counter - Track affectionate moments throughout day",
          aiIntegration: "AI identifies patterns in when child shows most affection",
          learningOutcome: "Child develops emotional expression and bonding"
        },
        {
          milestone: "Helps with simple household tasks",
          eActivity: "Little Helper",
          description: "Assign age-appropriate chores with visual checklists",
          gameIdea: "Helper Hero - Earn badges for completing tasks",
          aiIntegration: "AI suggests appropriate tasks based on child's skill level",
          learningOutcome: "Child develops sense of responsibility and capability"
        },
        {
          milestone: "Points to show others something interesting",
          eActivity: "Point & Share",
          description: "Track joint attention moments when child points to share discoveries",
          gameIdea: "Discovery Pointer - Log interesting things child points out",
          aiIntegration: "AI recognizes pointing gestures and catalogs shared interests",
          learningOutcome: "Child develops social communication and shared attention"
        }
      ],
      emotional: [
        {
          milestone: "Shows affection spontaneously (hugs, kisses)",
          eActivity: "Affection Diary",
          description: "Caregiver logs spontaneous affection events (who, when, what triggered)",
          gameIdea: "Love Map - Each person the child shows affection to gets a heart on a 'People I Love' map",
          aiIntegration: "AI identifies which contexts most frequently trigger affection and suggests affection-rich routine designs",
          learningOutcome: "Child develops emotional warmth, attachment expression, and loving relationships"
        },
        {
          milestone: "Has temper tantrums",
          eActivity: "Tantrum Tracker",
          description: "Log tantrum triggers, duration, and effective calming strategies",
          gameIdea: "Calm Down Kit - Build toolbox of successful soothing methods",
          aiIntegration: "AI identifies tantrum patterns and prevention strategies",
          learningOutcome: "Child learns emotional regulation with caregiver support"
        },
        {
          milestone: "May be fearful of strangers",
          eActivity: "Brave Steps",
          description: "Gradual exposure to new people with comfort strategies",
          gameIdea: "Courage Coins - Earn rewards for brave social moments",
          aiIntegration: "AI tracks comfort levels and suggests pacing for new introductions",
          learningOutcome: "Child develops healthy caution while building confidence"
        },
        {
          milestone: "Shows preferences for certain toys",
          eActivity: "Favorite Things",
          description: "Track preferred toys, books, and activities",
          gameIdea: "Treasure Box - Catalog of most-loved items",
          aiIntegration: "AI identifies patterns in preferences and suggests similar items",
          learningOutcome: "Child develops personal preferences and self-awareness"
        }
      ],
      cognitive: [
        {
          milestone: "Follows simple 1-step directions",
          eActivity: "Do This!",
          description: "Caregiver gives one-step instructions; screen shows a visual cue card",
          gameIdea: "Action Star - Each correctly followed instruction earns a star",
          aiIntegration: "AI generates age-appropriate one-step instruction scripts and tracks response accuracy",
          learningOutcome: "Child develops receptive language, instruction compliance, and listening attention"
        },
        {
          milestone: "Knows what ordinary things are for",
          eActivity: "Object Expert",
          description: "Match objects to their uses (cup for drinking, brush for hair)",
          gameIdea: "Tool Time - Connect items to their purposes",
          aiIntegration: "AI generates everyday object recognition quizzes",
          learningOutcome: "Child develops functional understanding of environment"
        },
        {
          milestone: "Points to one body part",
          eActivity: "Body Map",
          description: "Interactive body diagram teaching body part names",
          gameIdea: "Body Detective - Find and name different body parts",
          aiIntegration: "AI tracks which body parts child knows and adds new ones",
          learningOutcome: "Child develops body awareness and vocabulary"
        },
        {
          milestone: "Says several single words",
          eActivity: "Word Collection",
          description: "Log new words child says with pronunciation recordings",
          gameIdea: "Word Bank - Growing vocabulary treasure chest",
          aiIntegration: "AI analyzes speech clarity and suggests word expansion targets",
          learningOutcome: "Child develops expressive language and communication skills"
        },
        {
          milestone: "Finds things even when hidden",
          eActivity: "Hide & Seek Pro",
          description: "Advanced hiding games with multiple locations",
          gameIdea: "Super Seeker - Find items in increasingly tricky spots",
          aiIntegration: "AI designs hiding challenges based on success rate",
          learningOutcome: "Child develops memory, problem-solving, and persistence"
        }
      ],
      aesthetic: [
        {
          milestone: "Shows interest in finger painting / messy play",
          eActivity: "Color Splash",
          description: "Digital finger paint canvas lets child 'paint' on screen with bright colors",
          gameIdea: "Color Artist - Each new color used earns a palette dot",
          aiIntegration: "AI detects color patterns in digital paintings and narrates what child 'made'",
          learningOutcome: "Child develops sensory tolerance, creative expression, and color association"
        },
        {
          milestone: "Enjoys music and dancing",
          eActivity: "Dance Party",
          description: "Variety of music styles with movement encouragement",
          gameIdea: "Groove Master - Dance to different rhythms and beats",
          aiIntegration: "AI detects movement patterns and suggests favorite music types",
          learningOutcome: "Child develops rhythm, coordination, and musical appreciation"
        },
        {
          milestone: "Explores different textures",
          eActivity: "Sensory Safari",
          description: "Guided exploration of various tactile experiences",
          gameIdea: "Touch Explorer - Discover and name different textures",
          aiIntegration: "AI suggests new sensory materials based on preferences",
          learningOutcome: "Child develops sensory discrimination and vocabulary"
        },
        {
          milestone: "Interested in cause-effect relationships",
          eActivity: "What Happens If?",
          description: "Experiments with actions and consequences",
          gameIdea: "Science Lab - Try different actions and see results",
          aiIntegration: "AI creates progressively complex cause-effect scenarios",
          learningOutcome: "Child develops scientific thinking and curiosity"
        }
      ]
    }
  },

  // LEVEL 4: 1.5-2 Years (18-24 Months)
  "18-24": {
    level: 4,
    ageRange: "1.5-2 Years",
    description: "Language explosion, running and climbing, parallel play, early imaginative play",
    domains: {
      physical: [
        {
          milestone: "Runs (though may fall often)",
          eActivity: "Run Racer",
          description: "Outdoor/indoor running path marked; caregiver logs run distance, frequency of falls, and recovery speed",
          gameIdea: "Sprint Stars - Weekly run distance logged earns running shoe icons",
          aiIntegration: "AI gait analysis via camera identifies stride symmetry and fall frequency",
          learningOutcome: "Child develops cardiovascular fitness, running mechanics, and fall recovery"
        },
        {
          milestone: "Kicks a stationary ball",
          eActivity: "Kick Zone",
          description: "Target on floor/screen; caregiver logs each ball kick (direction, power, accuracy)",
          gameIdea: "Goal Getter - Kicks that reach the target earn 'goals'",
          aiIntegration: "AI camera tracks ball trajectory post-kick and maps directional accuracy improvement",
          learningOutcome: "Child develops unilateral leg control, visual-motor aim, and force modulation"
        },
        {
          milestone: "Walks up and down stairs holding on",
          eActivity: "Stair Master Jr",
          description: "Track stair climbing with support and safety",
          gameIdea: "Step Champion - Count stairs climbed daily",
          aiIntegration: "AI monitors stair-climbing confidence and independence progress",
          learningOutcome: "Child develops leg strength, balance, and spatial awareness"
        },
        {
          milestone: "Throws ball underhand",
          eActivity: "Underhand Ace",
          description: "Practice underhand throwing with various targets",
          gameIdea: "Bowling Buddy - Roll and throw at pins",
          aiIntegration: "AI tracks throwing technique development",
          learningOutcome: "Child develops arm coordination and release timing"
        },
        {
          milestone: "Jumps in place",
          eActivity: "Jump Zone",
          description: "Practice jumping with music and visual cues",
          gameIdea: "Bounce Master - Jump to the beat",
          aiIntegration: "AI counts jumps and measures height improvement",
          learningOutcome: "Child develops explosive leg power and rhythm"
        }
      ],
      social: [
        {
          milestone: "Participates in pretend scenarios",
          eActivity: "Pretend Play Studio",
          description: "Themed scenario on screen (kitchen, doctor's office); child acts out role with toy props",
          gameIdea: "Role Play Passport - Each new pretend role tried earns a passport stamp",
          aiIntegration: "AI generates personalized pretend play scripts based on child's logged favorite scenarios",
          learningOutcome: "Child develops symbolic thinking, narrative understanding, and social role concepts"
        },
        {
          milestone: "Shows increasing independence",
          eActivity: "I Can Do It!",
          description: "Track independent accomplishments like dressing, feeding",
          gameIdea: "Independence Star - Earn stars for self-care skills",
          aiIntegration: "AI suggests next independence milestones based on current skills",
          learningOutcome: "Child develops autonomy and self-confidence"
        },
        {
          milestone: "Begins to show defiant behavior",
          eActivity: "Choice Champion",
          description: "Offer appropriate choices to build decision-making",
          gameIdea: "My Choice - Make age-appropriate decisions",
          aiIntegration: "AI tracks choice patterns and suggests effective options",
          learningOutcome: "Child develops decision-making and autonomy"
        },
        {
          milestone: "Imitates adults and friends",
          eActivity: "Copycat Pro",
          description: "Advanced imitation games with complex actions",
          gameIdea: "Mirror Master - Copy multi-step sequences",
          aiIntegration: "AI detects imitation accuracy and complexity",
          learningOutcome: "Child develops observational learning and memory"
        }
      ],
      emotional: [
        {
          milestone: "Responds to simple requests",
          eActivity: "Request Ranger",
          description: "Caregiver gives simple requests during play; screen shows a visual cue card for each request",
          gameIdea: "Listening Leap - Each correctly executed request earns a jump on a hopscotch board",
          aiIntegration: "AI tracks which request types have highest compliance and suggests natural incorporation into routines",
          learningOutcome: "Child develops receptive language, social cooperation, and behavioral compliance"
        },
        {
          milestone: "Expresses many emotions",
          eActivity: "Emotion Chart",
          description: "Identify and name feelings throughout the day",
          gameIdea: "Feeling Faces - Match emotions to situations",
          aiIntegration: "AI creates emotion timeline showing patterns",
          learningOutcome: "Child develops emotional vocabulary and awareness"
        },
        {
          milestone: "Shows affection for familiar playmates",
          eActivity: "Friendship Builder",
          description: "Track positive interactions with peers",
          gameIdea: "Friend Circle - Build connections with others",
          aiIntegration: "AI suggests activities for developing friendships",
          learningOutcome: "Child develops peer relationships and social bonds"
        },
        {
          milestone: "May have separation anxiety",
          eActivity: "Goodbye Helper",
          description: "Practice separations with comfort routines",
          gameIdea: "Brave Heart - Build confidence in separations",
          aiIntegration: "AI tracks separation comfort levels over time",
          learningOutcome: "Child develops coping strategies for separations"
        }
      ],
      cognitive: [
        {
          milestone: "Names familiar objects and pictures",
          eActivity: "Name the World",
          description: "Digital picture book shows objects; caregiver prompts naming and logs each new object word produced",
          gameIdea: "Word Collector - Each named object is added to a digital 'My World Dictionary'",
          aiIntegration: "AI speech recognition logs correctly named objects and auto-updates vocabulary growth chart",
          learningOutcome: "Child develops expressive vocabulary and object-word mapping"
        },
        {
          milestone: "Sorts shapes and colors",
          eActivity: "Sort Master",
          description: "Practice categorizing objects by attributes",
          gameIdea: "Category Captain - Group items correctly",
          aiIntegration: "AI creates progressively complex sorting challenges",
          learningOutcome: "Child develops classification and logical thinking"
        },
        {
          milestone: "Completes simple puzzles",
          eActivity: "Puzzle Pro",
          description: "Age-appropriate puzzles with increasing pieces",
          gameIdea: "Piece Master - Complete puzzles of growing difficulty",
          aiIntegration: "AI tracks puzzle-solving speed and complexity handled",
          learningOutcome: "Child develops spatial reasoning and problem-solving"
        },
        {
          milestone: "Uses 2-word phrases",
          eActivity: "Phrase Builder",
          description: "Practice combining words into simple sentences",
          gameIdea: "Word Pairs - Create meaningful two-word combinations",
          aiIntegration: "AI tracks grammatical development and suggests expansions",
          learningOutcome: "Child develops syntactic skills and expression"
        },
        {
          milestone: "Follows 2-step instructions",
          eActivity: "Two-Step Challenge",
          description: "Practice multi-step directions with visual support",
          gameIdea: "Sequence Star - Complete action sequences",
          aiIntegration: "AI generates appropriate two-step command sequences",
          learningOutcome: "Child develops working memory and sequential processing"
        }
      ],
      aesthetic: [
        {
          milestone: "Draws circular or vertical lines",
          eActivity: "Line Art",
          description: "Digital drawing canvas captures child's marks; caregiver also photographs paper drawings to upload",
          gameIdea: "Drawing Evolution - Drawings saved over weeks show progression",
          aiIntegration: "AI analyzes mark types (scribble → intentional line → proto-circle) and tracks fine motor drawing development",
          learningOutcome: "Child develops pre-writing motor patterns, visual-spatial planning, and creative expression"
        },
        {
          milestone: "Shows interest in different art materials",
          eActivity: "Art Explorer",
          description: "Introduce various art supplies and techniques",
          gameIdea: "Art Box - Try crayons, markers, paint, chalk",
          aiIntegration: "AI tracks material preferences and suggests new media",
          learningOutcome: "Child develops artistic exploration and creativity"
        },
        {
          milestone: "Enjoys songs and rhymes",
          eActivity: "Rhyme Time",
          description: "Interactive nursery rhymes with actions",
          gameIdea: "Rhyme Master - Learn and perform songs",
          aiIntegration: "AI tracks favorite rhymes and suggests similar ones",
          learningOutcome: "Child develops phonological awareness and memory"
        },
        {
          milestone: "Moves to music with more purpose",
          eActivity: "Dance Moves",
          description: "Specific dance moves matched to different songs",
          gameIdea: "Dancer Pro - Learn different dance styles",
          aiIntegration: "AI detects rhythm synchronization and movement quality",
          learningOutcome: "Child develops motor planning and musical expression"
        }
      ]
    }
  },

  // LEVEL 5: 2-2.5 Years (24-30 Months)
  "24-30": {
    level: 5,
    ageRange: "2-2.5 Years",
    description: "Sentence formation, improved coordination, cooperative play beginnings, creative exploration",
    domains: {
      physical: [
        {
          milestone: "Walks up/down steps (alternating feet)",
          eActivity: "Stair Master",
          description: "Screen shows animated staircase; caregiver logs whether child alternates feet or steps one-at-a-time",
          gameIdea: "Step Up Challenge - Alternating feet earns double points vs. same-foot stepping",
          aiIntegration: "AI gait analysis via camera detects foot alternation pattern and automatically scores each stair session",
          learningOutcome: "Child develops alternating gait pattern, lower limb coordination, and spatial sequencing"
        },
        {
          milestone: "Jumps with both feet",
          eActivity: "Jump Academy",
          description: "Different jumping challenges each week (jump over a line, jump from step, jump as far as possible)",
          gameIdea: "Jump Crew - Each jump type mastered adds a character to a 'Jump Crew' team roster",
          aiIntegration: "AI jump detection records height, distance, and landing quality to track power and balance development",
          learningOutcome: "Child develops bilateral explosive power, landing control, and body confidence"
        },
        {
          milestone: "Stands on one foot momentarily",
          eActivity: "Balance Star",
          description: "Practice single-leg balance with games and challenges",
          gameIdea: "Flamingo Time - Hold balance as long as possible",
          aiIntegration: "AI tracks balance duration improvements over time",
          learningOutcome: "Child develops balance, core strength, and body control"
        },
        {
          milestone: "Pedals tricycle",
          eActivity: "Trike Rider",
          description: "Track tricycle riding progress and distance",
          gameIdea: "Wheel Champion - Log riding achievements",
          aiIntegration: "AI monitors pedaling coordination and steering control",
          learningOutcome: "Child develops leg strength and bilateral coordination"
        },
        {
          milestone: "Catches large ball",
          eActivity: "Catch Master",
          description: "Practice catching with progressively smaller balls",
          gameIdea: "Catcher Pro - Catch different sized balls for points",
          aiIntegration: "AI tracks catching success rate and hand positioning",
          learningOutcome: "Child develops hand-eye coordination and reaction time"
        }
      ],
      social: [
        {
          milestone: "Shows interest in peers' lives",
          eActivity: "Friend Finder",
          description: "Caregiver facilitates 'friendship interviews' - child asks peer one question",
          gameIdea: "Friendship Book - Each peer interview page added fills a 'Friends Book'",
          aiIntegration: "AI suggests age-appropriate conversation starter questions based on children's shared interests",
          learningOutcome: "Child develops peer curiosity, conversational turn-taking, and relationship building"
        },
        {
          milestone: "Begins cooperative play",
          eActivity: "Team Player",
          description: "Simple games requiring cooperation with peers",
          gameIdea: "Together Time - Complete tasks as a team",
          aiIntegration: "AI suggests cooperative activities matching children's interests",
          learningOutcome: "Child develops collaboration and shared goals"
        },
        {
          milestone: "Understands 'mine' and 'yours'",
          eActivity: "Ownership Helper",
          description: "Practice identifying possessions and respecting boundaries",
          gameIdea: "My Things, Your Things - Sort items by owner",
          aiIntegration: "AI creates scenarios teaching possession concepts",
          learningOutcome: "Child develops property understanding and respect"
        },
        {
          milestone: "Shows concern when others are upset",
          eActivity: "Empathy Builder",
          description: "Recognize and respond to others' emotions",
          gameIdea: "Caring Heart - Show empathy in different situations",
          aiIntegration: "AI tracks empathetic responses and suggests development",
          learningOutcome: "Child develops empathy and compassion"
        }
      ],
      emotional: [
        {
          milestone: "Identifies and labels basic emotions",
          eActivity: "Emotion Expert",
          description: "Screen shows 5 emotion faces; child names them",
          gameIdea: "Feelings Flash Cards - Naming all 5 emotions without error earns an 'Emotion Expert' badge",
          aiIntegration: "AI facial expression detection quizzes children using real or animated faces and scores accuracy",
          learningOutcome: "Child develops emotional vocabulary, self-awareness, and social-emotional literacy"
        },
        {
          milestone: "Expresses affection openly",
          eActivity: "Love Language",
          description: "Encourage various ways of showing affection",
          gameIdea: "Kindness Chain - Build chain of loving actions",
          aiIntegration: "AI tracks different affection expressions child uses",
          learningOutcome: "Child develops emotional expression and bonding"
        },
        {
          milestone: "Shows pride in accomplishments",
          eActivity: "Achievement Album",
          description: "Celebrate and document successes",
          gameIdea: "Pride Board - Display accomplishments with photos",
          aiIntegration: "AI generates achievement certificates for milestones",
          learningOutcome: "Child develops self-esteem and confidence"
        },
        {
          milestone: "May show jealousy",
          eActivity: "Sharing Feelings",
          description: "Help process and express jealous feelings appropriately",
          gameIdea: "Feeling Helper - Identify and manage difficult emotions",
          aiIntegration: "AI suggests strategies for managing jealousy situations",
          learningOutcome: "Child develops emotional regulation and coping skills"
        }
      ],
      cognitive: [
        {
          milestone: "Follows 2-3 step directions",
          eActivity: "Command Quest",
          description: "Caregiver gives multi-step instructions; child follows and steps are checked off on screen",
          gameIdea: "Mission Possible - Successfully completing a 3-step mission earns a secret agent badge",
          aiIntegration: "AI generates age-appropriate 3-step instruction scripts and tracks which step sequences produce highest success",
          learningOutcome: "Child develops working memory, sequential processing, and multi-step compliance"
        },
        {
          milestone: "Understands concept of 'two'",
          eActivity: "Number Explorer",
          description: "Practice counting and recognizing small quantities",
          gameIdea: "Count Master - Identify groups of 1, 2, 3 objects",
          aiIntegration: "AI creates progressively complex counting scenarios",
          learningOutcome: "Child develops early numeracy and quantity recognition"
        },
        {
          milestone: "Names colors correctly",
          eActivity: "Color Quiz",
          description: "Interactive color identification and naming",
          gameIdea: "Rainbow Expert - Name all basic colors correctly",
          aiIntegration: "AI tracks color knowledge and adds new shades",
          learningOutcome: "Child develops color vocabulary and discrimination"
        },
        {
          milestone: "Uses 3-4 word sentences",
          eActivity: "Sentence Builder",
          description: "Practice expanding vocabulary into longer phrases",
          gameIdea: "Word Chain - Build longer and longer sentences",
          aiIntegration: "AI analyzes sentence length and grammatical complexity",
          learningOutcome: "Child develops expressive language and syntax"
        },
        {
          milestone: "Understands prepositions (in, on, under)",
          eActivity: "Position Master",
          description: "Practice spatial concepts through games",
          gameIdea: "Where Is It? - Place objects in correct positions",
          aiIntegration: "AI generates spatial reasoning challenges",
          learningOutcome: "Child develops spatial vocabulary and concepts"
        }
      ],
      aesthetic: [
        {
          milestone: "Creates recognizable drawings",
          eActivity: "My First Drawings",
          description: "Child draws on digital canvas; caregiver labels what child says the drawing represents",
          gameIdea: "Gallery Wall - Each labeled drawing is added to a digital gallery",
          aiIntegration: "AI image recognition attempts to match child's description of drawing with the visual marks",
          learningOutcome: "Child develops symbolic visual representation, drawing intention, and creative self-expression"
        },
        {
          milestone: "Enjoys pretend play scenarios",
          eActivity: "Imagination Station",
          description: "Complex pretend play with story elements",
          gameIdea: "Story Maker - Create and act out stories",
          aiIntegration: "AI suggests plot ideas based on child's interests",
          learningOutcome: "Child develops narrative thinking and creativity"
        },
        {
          milestone: "Sings simple songs",
          eActivity: "Song Star",
          description: "Learn and perform children's songs",
          gameIdea: "Concert Hall - Build song repertoire",
          aiIntegration: "AI tracks songs learned and suggests new ones",
          learningOutcome: "Child develops musical memory and performance"
        },
        {
          milestone: "Shows interest in crafts",
          eActivity: "Craft Corner",
          description: "Simple craft projects with various materials",
          gameIdea: "Creator Badge - Complete different craft types",
          aiIntegration: "AI suggests age-appropriate craft projects",
          learningOutcome: "Child develops fine motor skills and creativity"
        }
      ]
    }
  },

  // LEVEL 6: 2.5-3 Years
  // LEVEL 6: 2.5-3 Years (30-36 Months)
  "30-36": {
    level: 6,
    ageRange: "2.5-3 Years",
    description: "Complex language, refined motor skills, group play, emotional regulation development",
    domains: {
      physical: [
        {
          milestone: "Walks up/down steps with confidence",
          eActivity: "Stair Champion",
          description: "Caregiver logs stair walking: steps alternated, handrail used, speed, confidence level",
          gameIdea: "Free Climber - Achieving handrail-free stair walking earns a 'Mountain Conqueror' badge",
          aiIntegration: "AI gait analysis detects bilateral foot alternation and railing dependence reduction over time",
          learningOutcome: "Child develops mature stair gait, bilateral coordination, and physical confidence"
        },
        {
          milestone: "Uses scissors with guidance",
          eActivity: "Snip Station",
          description: "Simple cutting lines (straight, then curved) practiced with safety scissors",
          gameIdea: "Cut It Out - Each successful cut earns a snippet",
          aiIntegration: "AI image recognition evaluates cut line accuracy and suggests next complexity level",
          learningOutcome: "Child develops bilateral hand coordination, fine motor control, and tool use skills"
        },
        {
          milestone: "Hops on one foot",
          eActivity: "Hop Champion",
          description: "Practice hopping on each foot separately",
          gameIdea: "Hopping Hero - Hop courses and challenges",
          aiIntegration: "AI counts hops and measures balance duration",
          learningOutcome: "Child develops single-leg strength and dynamic balance"
        },
        {
          milestone: "Throws ball overhand with aim",
          eActivity: "Precision Throw",
          description: "Target practice with various distances and sizes",
          gameIdea: "Bullseye Master - Hit targets accurately",
          aiIntegration: "AI tracks accuracy improvements and suggests challenges",
          learningOutcome: "Child develops throwing accuracy and arm strength"
        },
        {
          milestone: "Builds tower of 9+ blocks",
          eActivity: "Tower Architect",
          description: "Complex building challenges with blocks",
          gameIdea: "Sky Builder - Create tallest stable towers",
          aiIntegration: "AI counts blocks and celebrates construction milestones",
          learningOutcome: "Child develops fine motor precision and spatial planning"
        }
      ],
      social: [
        {
          milestone: "Takes turns with less reminders",
          eActivity: "Self-Turner",
          description: "Caregiver logs unprompted vs. prompted turn-taking",
          gameIdea: "Auto-Turn Award - 5 consecutive unprompted turns earns a 'Self-Regulator' badge",
          aiIntegration: "AI tracks prompt frequency decline over sessions as evidence of internalized turn-taking",
          learningOutcome: "Child develops self-regulated turn-taking, delayed gratification, and social fairness"
        },
        {
          milestone: "Plays cooperatively with peers",
          eActivity: "Team Games",
          description: "Structured cooperative activities requiring teamwork",
          gameIdea: "Together Champions - Complete group challenges",
          aiIntegration: "AI suggests cooperative games matching group dynamics",
          learningOutcome: "Child develops collaboration and shared problem-solving"
        },
        {
          milestone: "Understands social rules",
          eActivity: "Rules Master",
          description: "Learn and follow simple game rules",
          gameIdea: "Fair Play - Follow rules consistently",
          aiIntegration: "AI tracks rule-following and suggests appropriate games",
          learningOutcome: "Child develops social understanding and self-control"
        },
        {
          milestone: "Shows concern for crying friend",
          eActivity: "Comforter",
          description: "Practice appropriate responses to others' distress",
          gameIdea: "Kind Helper - Respond with empathy",
          aiIntegration: "AI models empathetic responses in scenarios",
          learningOutcome: "Child develops empathy and prosocial behavior"
        },
        {
          milestone: "Engages in group activities",
          eActivity: "Group Star",
          description: "Participate in circle time and group games",
          gameIdea: "Team Player - Join group activities confidently",
          aiIntegration: "AI tracks group participation comfort levels",
          learningOutcome: "Child develops group social skills"
        }
      ],
      emotional: [
        {
          milestone: "Manages transitions",
          eActivity: "Transition Toolkit",
          description: "5-minute warning system: screen timer + transition song plays",
          gameIdea: "Smooth Switcher - Completing a transition without meltdown earns a token",
          aiIntegration: "AI learns each child's most challenging transitions and preemptively activates warning systems",
          learningOutcome: "Child develops time awareness, transition preparation, and emotional self-regulation"
        },
        {
          milestone: "Expresses wide range of emotions",
          eActivity: "Emotion Rainbow",
          description: "Identify and name complex emotions beyond basic 5",
          gameIdea: "Feeling Expert - Master emotion vocabulary",
          aiIntegration: "AI introduces nuanced emotion words based on readiness",
          learningOutcome: "Child develops sophisticated emotional vocabulary"
        },
        {
          milestone: "Shows guilt when misbehaves",
          eActivity: "Conscience Builder",
          description: "Recognize and process feelings about behavior",
          gameIdea: "Right Choice - Make amends after mistakes",
          aiIntegration: "AI guides through appropriate responses to misbehavior",
          learningOutcome: "Child develops moral understanding and responsibility"
        },
        {
          milestone: "Separates more easily from parents",
          eActivity: "Brave Goodbye",
          description: "Practice confident separations with coping strategies",
          gameIdea: "Independence Star - Master separations",
          aiIntegration: "AI tracks separation confidence growth",
          learningOutcome: "Child develops independence and emotional resilience"
        },
        {
          milestone: "Shows pride and shame appropriately",
          eActivity: "Self-Aware",
          description: "Develop appropriate self-evaluation",
          gameIdea: "Feeling Right - Understand pride and shame",
          aiIntegration: "AI helps differentiate healthy vs unhealthy emotions",
          learningOutcome: "Child develops self-awareness and emotional intelligence"
        }
      ],
      cognitive: [
        {
          milestone: "Uses 3-4 word sentences",
          eActivity: "Sentence Stretcher",
          description: "Caregiver logs longest sentence used each day",
          gameIdea: "Word Snake - Each new sentence length record makes the snake longer",
          aiIntegration: "AI speech recognition measures mean length of utterance (MLU) and tracks grammatical complexity growth",
          learningOutcome: "Child develops expressive syntax, sentence construction, and narrative language"
        },
        {
          milestone: "Counts to 10",
          eActivity: "Number Master",
          description: "Practice counting objects and rote counting",
          gameIdea: "Count Champion - Master numbers 1-10",
          aiIntegration: "AI creates counting games and tracks accuracy",
          learningOutcome: "Child develops number sense and counting skills"
        },
        {
          milestone: "Names common colors",
          eActivity: "Color Expert",
          description: "Master all basic colors plus shades",
          gameIdea: "Rainbow Scholar - Identify all colors correctly",
          aiIntegration: "AI quizzes on colors in various contexts",
          learningOutcome: "Child develops color knowledge and discrimination"
        },
        {
          milestone: "Understands 'same' and 'different'",
          eActivity: "Comparison Pro",
          description: "Practice identifying similarities and differences",
          gameIdea: "Match Master - Find same and different attributes",
          aiIntegration: "AI creates comparison challenges",
          learningOutcome: "Child develops classification and analytical thinking"
        },
        {
          milestone: "Follows 3-step instructions consistently",
          eActivity: "Task Commander",
          description: "Complex multi-step directions practice",
          gameIdea: "Mission Master - Complete 3-step sequences",
          aiIntegration: "AI generates varied instruction sequences",
          learningOutcome: "Child develops executive function and working memory"
        },
        {
          milestone: "Understands time concepts (morning, night)",
          eActivity: "Time Detective",
          description: "Learn daily routine and time vocabulary",
          gameIdea: "Day Tracker - Match activities to times",
          aiIntegration: "AI creates personalized time concept lessons",
          learningOutcome: "Child develops temporal understanding"
        }
      ],
      aesthetic: [
        {
          milestone: "Creates detailed drawings",
          eActivity: "Masterpiece Maker",
          description: "Child draws a planned subject (family, house, animal) with increasing detail",
          gameIdea: "Detail Detective - Each new element added to drawings over time earns a 'Detail Badge'",
          aiIntegration: "AI image analysis counts distinct drawn elements and compares detail complexity across weekly drawings",
          learningOutcome: "Child develops visual representation complexity, planning ahead in art, and sustained creative attention"
        },
        {
          milestone: "Tells stories with toys",
          eActivity: "Story Creator",
          description: "Use toys to create and narrate stories",
          gameIdea: "Tale Teller - Create complete story narratives",
          aiIntegration: "AI prompts story elements (beginning, middle, end)",
          learningOutcome: "Child develops narrative skills and imagination"
        },
        {
          milestone: "Sings songs from memory",
          eActivity: "Memory Singer",
          description: "Learn complete songs with all verses",
          gameIdea: "Song Library - Master full songs independently",
          aiIntegration: "AI tracks songs learned and lyric accuracy",
          learningOutcome: "Child develops auditory memory and performance skills"
        },
        {
          milestone: "Shows preferences for art activities",
          eActivity: "Art Style",
          description: "Explore different artistic media and techniques",
          gameIdea: "Artist Profile - Discover favorite art forms",
          aiIntegration: "AI identifies artistic preferences and suggests projects",
          learningOutcome: "Child develops artistic identity and preferences"
        },
        {
          milestone: "Engages in complex pretend play",
          eActivity: "Fantasy World",
          description: "Elaborate imaginative scenarios with multiple elements",
          gameIdea: "World Builder - Create detailed pretend scenarios",
          aiIntegration: "AI suggests props and storylines based on interests",
          learningOutcome: "Child develops advanced symbolic thinking and creativity"
        }
      ]
    }
  },
  ...milestonesByLevel
};

// Helper function to get activities for a specific age in months
export function getActivitiesForAge(ageMonths) {
  if (ageMonths < 0 || ageMonths > 72) return null;
  
  if (ageMonths <= 6) return MILESTONE_ACTIVITIES_CATALOG["0-6"];
  if (ageMonths <= 12) return MILESTONE_ACTIVITIES_CATALOG["6-12"];
  if (ageMonths <= 18) return MILESTONE_ACTIVITIES_CATALOG["12-18"];
  if (ageMonths <= 24) return MILESTONE_ACTIVITIES_CATALOG["18-24"];
  if (ageMonths <= 30) return MILESTONE_ACTIVITIES_CATALOG["24-30"];
  if (ageMonths <= 36) return MILESTONE_ACTIVITIES_CATALOG["30-36"];
  if (ageMonths <= 42) return MILESTONE_ACTIVITIES_CATALOG["L7"];
  if (ageMonths <= 48) return MILESTONE_ACTIVITIES_CATALOG["L8"];
  if (ageMonths <= 54) return MILESTONE_ACTIVITIES_CATALOG["L9"];
  if (ageMonths <= 60) return MILESTONE_ACTIVITIES_CATALOG["L10"];
  if (ageMonths <= 66) return MILESTONE_ACTIVITIES_CATALOG["L11"];
  return MILESTONE_ACTIVITIES_CATALOG["L12"];
}

// Get all activities across all domains for a level
export function getAllActivitiesForLevel(levelKey) {
  const level = MILESTONE_ACTIVITIES_CATALOG[levelKey];
  if (!level) return [];
  
  const allActivities = [];
  Object.entries(level.domains).forEach(([domainName, activities]) => {
    activities.forEach(activity => {
      allActivities.push({
        ...activity,
        domain: domainName,
        level: level.level,
        ageRange: level.ageRange
      });
    });
  });
  
  return allActivities;
}
