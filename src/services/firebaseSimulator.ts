import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Assessment {
  id: string;
  child_id: string;
  domain: 'Literacy' | 'Numeracy' | 'Cognitive' | 'Creativity' | 'Emotional';
  activity_id: string;
  activity_name: string;
  score: number;
  accuracy: number;
  time: number;
  attempts: number;
  date: string;
}

export interface ProgressTracking {
  child_id: string;
  domain: string;
  weekly_score: number;
  streak: number;
  milestone_flags: string[];
}

export interface AIReport {
  id: string;
  child_id: string;
  report_date: string;
  domain_scores: Record<string, number>;
  time_spent: Record<string, number>;
  ai_flags: string[];
  recommendations: string[];
  school_readiness_score: number;
}

export interface Recommendation {
  id: string;
  child_id: string;
  activity_id: string;
  activity_name: string;
  domain: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  generated_date: string;
  completed: boolean;
}

export interface AIAnalysis {
  child_id: string;
  reading_difficulty: boolean;
  numeracy_gap: boolean;
  learning_delay_flag: boolean;
  strength_areas: string[];
  last_updated: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  grade: string;
  parent_name: string;
  teacher_name: string;
}

export interface ConfigThresholds {
  accuracyCutoff: number;
  consecutiveSessions: number;
  inactivityDays: number;
}

// ─── Firestore Collection Names ───────────────────────────────────────────────

const COLLECTIONS = {
  CHILDREN: "children",
  ASSESSMENTS: "assessments",
  AI_ANALYSIS: "ai_analysis",
  RECOMMENDATIONS: "recommendations",
  REPORTS: "reports",
  THRESHOLDS: "thresholds",
};

// ─── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_CHILDREN: Child[] = [
  { id: 'child_1', name: 'Aria Chen', age: 5, avatar: '👧', grade: 'Kindergarten', parent_name: 'Helen Chen', teacher_name: 'Ms. Sarah' },
  { id: 'child_2', name: 'Leo Gupta', age: 3, avatar: '👦', grade: 'Preschool', parent_name: 'Raj Gupta', teacher_name: 'Ms. Sarah' },
  { id: 'child_3', name: 'Sam Miller', age: 8, avatar: '🦁', grade: 'Grade 2', parent_name: 'Tina Miller', teacher_name: 'Ms. Sarah' }
];

const DEFAULT_THRESHOLDS: ConfigThresholds = {
  accuracyCutoff: 60,
  consecutiveSessions: 3,
  inactivityDays: 5
};

const getMockActivityName = (domain: string, index: number): string => {
  const names: Record<string, string[]> = {
    Literacy: ['Letter Tracing Safari', 'Phonics Matching Fun', 'Sight Words Collector', 'Rhyme Builder'],
    Numeracy: ['Count the Apples', 'Geometry Shape Puzzle', 'Pattern Quest', 'Number Line Runner'],
    Cognitive: ['Memory Matching Cards', 'Hidden Object Finder', 'Logic Sorting Puzzle', 'Path Navigator'],
    Creativity: ['Dynamic Mosaic Art', 'Free Paint Sandbox', 'Block Builder Space', 'Musical Chords Sandbox'],
    Emotional: ['Emotion Recognition Cards', 'Sharing & Caring Story', 'Breathing Bubble Coach', 'Social Scenario Choices']
  };
  const list = names[domain] || ['General Fun Activity'];
  return list[index % list.length];
};

const generateSeedAssessments = (): Omit<Assessment, 'id'>[] => {
  const assessments: Omit<Assessment, 'id'>[] = [];
  const domains: Assessment['domain'][] = ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'];
  const now = new Date();

  // Child 1 (Aria Chen)
  for (let i = 90; i >= 0; i--) {
    if (i % 5 === 0) continue;
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    domains.forEach(domain => {
      if (Math.random() > 0.3) {
        assessments.push({ child_id: 'child_1', domain, activity_id: `${domain.toLowerCase()}_act_${i % 3}`, activity_name: getMockActivityName(domain, i), score: Math.floor(Math.random() * 20) + 80, accuracy: Math.floor(Math.random() * 20) + 80, time: Math.floor(Math.random() * 200) + 150, attempts: Math.floor(Math.random() * 2) + 1, date });
      }
    });
  }

  // Child 2 (Leo Gupta)
  for (let i = 80; i >= 0; i--) {
    if (i % 3 === 0) continue;
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (i <= 5) {
      assessments.push({ child_id: 'child_2', domain: 'Literacy', activity_id: 'lit_phonics_check', activity_name: 'Phonics Matching Fun', score: Math.floor(Math.random() * 15) + 40, accuracy: Math.floor(Math.random() * 15) + 40, time: Math.floor(Math.random() * 300) + 250, attempts: 3, date });
    } else {
      assessments.push({ child_id: 'child_2', domain: 'Literacy', activity_id: 'lit_letter_trace', activity_name: 'Letter Tracing Safari', score: Math.floor(Math.random() * 20) + 55, accuracy: Math.floor(Math.random() * 20) + 55, time: Math.floor(Math.random() * 250) + 200, attempts: 2, date });
    }
    assessments.push({ child_id: 'child_2', domain: 'Creativity', activity_id: 'cre_shape_art', activity_name: 'Dynamic Mosaic Art', score: Math.floor(Math.random() * 10) + 90, accuracy: Math.floor(Math.random() * 10) + 90, time: Math.floor(Math.random() * 150) + 100, attempts: 1, date });
    const otherDomains: Assessment['domain'][] = ['Numeracy', 'Cognitive', 'Emotional'];
    otherDomains.forEach(domain => {
      if (Math.random() > 0.4) {
        assessments.push({ child_id: 'child_2', domain, activity_id: `${domain.toLowerCase()}_act_${i % 2}`, activity_name: getMockActivityName(domain, i), score: Math.floor(Math.random() * 25) + 65, accuracy: Math.floor(Math.random() * 25) + 65, time: Math.floor(Math.random() * 200) + 180, attempts: Math.floor(Math.random() * 2) + 1, date });
      }
    });
  }

  // Child 3 (Sam Miller)
  for (let i = 90; i >= 6; i--) {
    if (i % 4 === 0) continue;
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    domains.forEach(domain => {
      if (Math.random() > 0.3) {
        assessments.push({ child_id: 'child_3', domain, activity_id: `${domain.toLowerCase()}_act_${i % 2}`, activity_name: getMockActivityName(domain, i), score: Math.floor(Math.random() * 20) + 70, accuracy: Math.floor(Math.random() * 20) + 70, time: Math.floor(Math.random() * 200) + 150, attempts: 1, date });
      }
    });
  }

  return assessments;
};

// ─── Database Initialization ──────────────────────────────────────────────────

export const initializeDatabase = async (force = false): Promise<void> => {
  try {
    const thresholdsRef = doc(db, COLLECTIONS.THRESHOLDS, "config");
    const thresholdsSnap = await getDoc(thresholdsRef);

    if (!thresholdsSnap.exists() || force) {
      // Seed children
      for (const child of DEFAULT_CHILDREN) {
        await setDoc(doc(db, COLLECTIONS.CHILDREN, child.id), child);
      }

      // Seed thresholds
      await setDoc(thresholdsRef, DEFAULT_THRESHOLDS);

      // Seed assessments
      const seedAssessments = generateSeedAssessments();
      for (const assessment of seedAssessments) {
        await addDoc(collection(db, COLLECTIONS.ASSESSMENTS), assessment);
      }

      // Run AI for each child
      for (const child of DEFAULT_CHILDREN) {
        await runAiGapDetection(child.id);
        await generateWeeklyReport(child.id);
      }
    }
  } catch (err) {
    console.error("initializeDatabase error:", err);
  }
};

// ─── CRUD Services ─────────────────────────────────────────────────────────────

export const getChildren = async (): Promise<Child[]> => {
  const snap = await getDocs(collection(db, COLLECTIONS.CHILDREN));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Child));
};

export const getThresholds = async (): Promise<ConfigThresholds> => {
  const snap = await getDoc(doc(db, COLLECTIONS.THRESHOLDS, "config"));
  return snap.exists() ? (snap.data() as ConfigThresholds) : DEFAULT_THRESHOLDS;
};

export const saveThresholds = async (thresholds: ConfigThresholds): Promise<void> => {
  await setDoc(doc(db, COLLECTIONS.THRESHOLDS, "config"), thresholds);
  const children = await getChildren();
  for (const c of children) {
    await runAiGapDetection(c.id);
  }
};

export const getAssessments = async (childId?: string): Promise<Assessment[]> => {
  let q;
  if (childId) {
    q = query(collection(db, COLLECTIONS.ASSESSMENTS), where("child_id", "==", childId));
  } else {
    q = collection(db, COLLECTIONS.ASSESSMENTS);
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Assessment));
};

export const addAssessment = async (assessment: Omit<Assessment, 'id'>): Promise<Assessment> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.ASSESSMENTS), assessment);
  await runAiGapDetection(assessment.child_id);
  return { id: docRef.id, ...assessment };
};

export const getRecommendations = async (childId: string): Promise<Recommendation[]> => {
  const q = query(collection(db, COLLECTIONS.RECOMMENDATIONS), where("child_id", "==", childId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Recommendation));
};

export const updateRecommendationStatus = async (recId: string, completed: boolean): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.RECOMMENDATIONS, recId), { completed });
};

export const addRecommendation = async (rec: Omit<Recommendation, 'id' | 'generated_date' | 'completed'>): Promise<Recommendation> => {
  const newRec = {
    ...rec,
    generated_date: new Date().toISOString().split('T')[0],
    completed: false
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.RECOMMENDATIONS), newRec);
  return { id: docRef.id, ...newRec };
};

export const getAiAnalysis = async (childId: string): Promise<AIAnalysis> => {
  const snap = await getDoc(doc(db, COLLECTIONS.AI_ANALYSIS, childId));
  if (snap.exists()) return snap.data() as AIAnalysis;
  return { child_id: childId, reading_difficulty: false, numeracy_gap: false, learning_delay_flag: false, strength_areas: [], last_updated: new Date().toISOString() };
};

export const getReports = async (childId: string): Promise<AIReport[]> => {
  const q = query(collection(db, COLLECTIONS.REPORTS), where("child_id", "==", childId), orderBy("report_date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIReport));
};

// ─── AI Engine ────────────────────────────────────────────────────────────────

const checkConsecutiveFailures = (sessions: Assessment[], cutoff: number, consecutiveCount: number): boolean => {
  if (sessions.length < consecutiveCount) return false;
  const recent = sessions.slice(0, consecutiveCount);
  return recent.every(s => s.accuracy < cutoff);
};

export const runAiGapDetection = async (childId: string): Promise<void> => {
  const assessments = await getAssessments(childId);
  const thresholds = await getThresholds();
  const sorted = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const literacySessions = sorted.filter(a => a.domain === 'Literacy');
  const numeracySessions = sorted.filter(a => a.domain === 'Numeracy');
  const consecutiveLitFails = checkConsecutiveFailures(literacySessions, thresholds.accuracyCutoff, thresholds.consecutiveSessions);
  const consecutiveNumFails = checkConsecutiveFailures(numeracySessions, thresholds.accuracyCutoff, thresholds.consecutiveSessions);

  const domains: Assessment['domain'][] = ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'];
  const strength_areas: string[] = [];
  domains.forEach(domain => {
    const domainSessions = sorted.filter(a => a.domain === domain);
    if (domainSessions.length >= 2) {
      const avgScore = domainSessions.reduce((acc, curr) => acc + curr.score, 0) / domainSessions.length;
      if (avgScore >= 80) strength_areas.push(domain);
    }
  });

  const analysis: AIAnalysis = {
    child_id: childId,
    reading_difficulty: consecutiveLitFails,
    numeracy_gap: consecutiveNumFails,
    learning_delay_flag: consecutiveLitFails || consecutiveNumFails,
    strength_areas,
    last_updated: new Date().toISOString()
  };

  await setDoc(doc(db, COLLECTIONS.AI_ANALYSIS, childId), analysis);
  await syncRecommendations(childId, analysis);
};

const syncRecommendations = async (childId: string, analysis: AIAnalysis): Promise<void> => {
  const recs = await getRecommendations(childId);
  const activeIds = new Set(recs.map(r => r.activity_id));

  if (analysis.reading_difficulty && !activeIds.has('lit_remedial_reading')) {
    await addRecommendation({ child_id: childId, activity_id: 'lit_remedial_reading', activity_name: 'Phonics Safari & Sound Blending', domain: 'Literacy', reason: 'AI detected a pattern of reading speed and spelling accuracy gaps (<60%). Focused letter-sound blending recommended.', priority: 'High' });
  }
  if (analysis.numeracy_gap && !activeIds.has('num_remedial_math')) {
    await addRecommendation({ child_id: childId, activity_id: 'num_remedial_math', activity_name: 'Building Blocks Counting Game', domain: 'Numeracy', reason: 'Numeracy scoring dropped. Interactive visual arithmetic using counting items recommended.', priority: 'High' });
  }
  if (analysis.strength_areas.includes('Creativity') && !activeIds.has('cre_advanced_art')) {
    await addRecommendation({ child_id: childId, activity_id: 'cre_advanced_art', activity_name: 'Advanced Canvas Paint Studio', domain: 'Creativity', reason: 'Strong creative scoring! Encourage advanced painting and freehand geometry projects.', priority: 'Medium' });
  }
  if (analysis.strength_areas.includes('Cognitive') && !activeIds.has('cog_advanced_puzzle')) {
    await addRecommendation({ child_id: childId, activity_id: 'cog_advanced_puzzle', activity_name: 'Logic Maze Master', domain: 'Cognitive', reason: 'Advanced spatial reasoning and problem solving demonstrated. Try logic maze navigation.', priority: 'Medium' });
  }
};

export const calculateSchoolReadinessScore = async (childId: string): Promise<number> => {
  const assessments = await getAssessments(childId);
  if (assessments.length === 0) return 0;

  const domains: Assessment['domain'][] = ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'];
  let sumOfAverages = 0;
  let domainsRepresented = 0;
  domains.forEach(domain => {
    const list = assessments.filter(a => a.domain === domain);
    if (list.length > 0) {
      sumOfAverages += list.reduce((acc, curr) => acc + curr.score, 0) / list.length;
      domainsRepresented++;
    }
  });
  if (domainsRepresented === 0) return 0;

  const baseScore = sumOfAverages / domainsRepresented;
  const coverageFactor = domainsRepresented / 5.0;
  const sessionVolumeBooster = Math.min(assessments.length / 20, 1) * 5;
  return Math.round(Math.min(Math.max((baseScore * 0.9) + (coverageFactor * 10) + sessionVolumeBooster, 0), 100));
};

export const checkPredictiveInactivity = async (childId: string): Promise<{ inactive: boolean; daysInactive: number }> => {
  const assessments = await getAssessments(childId);
  const thresholds = await getThresholds();
  if (assessments.length === 0) return { inactive: true, daysInactive: 99 };

  const dates = assessments.map(a => new Date(a.date).getTime());
  const maxDate = Math.max(...dates);
  const diffTime = Math.abs(new Date().getTime() - maxDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return { inactive: diffDays >= thresholds.inactivityDays, daysInactive: diffDays };
};

export const generateWeeklyReport = async (childId: string): Promise<AIReport> => {
  const assessments = await getAssessments(childId);
  const analysis = await getAiAnalysis(childId);
  const readiness = await calculateSchoolReadinessScore(childId);

  const domains: Assessment['domain'][] = ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'];
  const domain_scores: Record<string, number> = {};
  const time_spent: Record<string, number> = {};
  domains.forEach(d => {
    const list = assessments.filter(a => a.domain === d);
    if (list.length > 0) {
      domain_scores[d] = Math.round(list.reduce((acc, curr) => acc + curr.score, 0) / list.length);
      time_spent[d] = Math.round(list.reduce((acc, curr) => acc + curr.time, 0) / 60);
    } else {
      domain_scores[d] = 0;
      time_spent[d] = 0;
    }
  });

  const ai_flags: string[] = [];
  if (analysis.reading_difficulty) ai_flags.push('Reading Fluency / Phonics Difficulty Flagged');
  if (analysis.numeracy_gap) ai_flags.push('Early Counting / Numeracy Gap Flagged');
  const inactivity = await checkPredictiveInactivity(childId);
  if (inactivity.inactive) ai_flags.push(`Inactivity Warning: Child has not played for ${inactivity.daysInactive} days`);

  const activeRecs = (await getRecommendations(childId)).filter(r => !r.completed);
  const recommendations = activeRecs.map(r => `${r.activity_name}: ${r.reason}`);
  if (recommendations.length === 0) recommendations.push('Keep up the great work! Play 10 minutes of cognitive games daily to maintain progress.');

  const newReport = {
    child_id: childId,
    report_date: new Date().toISOString().split('T')[0],
    domain_scores,
    time_spent,
    ai_flags,
    recommendations,
    school_readiness_score: readiness
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.REPORTS), newReport);
  return { id: docRef.id, ...newReport };
};

// ─── NEP 2020 Milestones (static, unchanged) ──────────────────────────────────

export interface NepMilestone {
  stage: 'Early' | 'Foundational' | 'Preparatory';
  ageRange: '1-3' | '4-6' | '7-10';
  domain: string;
  milestone: string;
  description: string;
}

export const NEP_MILESTONES: NepMilestone[] = [
  { stage: 'Early', ageRange: '1-3', domain: 'Literacy', milestone: 'Pre-Verbal Sound Imitation', description: 'Mimicking simple speech sounds, recognizing parent voices, and identifying basic animals.' },
  { stage: 'Early', ageRange: '1-3', domain: 'Numeracy', milestone: 'Pre-Number Sorting', description: 'Understanding basic spatial orientation, and grouping blocks by basic color sets.' },
  { stage: 'Early', ageRange: '1-3', domain: 'Cognitive', milestone: 'Sensory Object Permanence', description: 'Finding hidden toys, matching 2-piece shapes, and tracing tactile boundaries.' },
  { stage: 'Early', ageRange: '1-3', domain: 'Creativity', milestone: 'Scribbling & Sound Play', description: 'Freely scribbling with digital crayons, tapping simple percussion rhythms, and stacking blocks.' },
  { stage: 'Early', ageRange: '1-3', domain: 'Emotional', milestone: 'Facial Emotion Recognition', description: 'Differentiating happy versus crying expressions, showing empathy indicators, and smiling at family members.' },
  { stage: 'Foundational', ageRange: '4-6', domain: 'Literacy', milestone: 'Oral Vocabulary & Phonics Foundation', description: 'Recognizing letters, phonics sounds, simple sight words, and basic rhyming.' },
  { stage: 'Foundational', ageRange: '4-6', domain: 'Numeracy', milestone: 'Pre-Number Concepts & Counting', description: 'One-to-one correspondence counting up to 20, basic geometric shape recognition, pattern matching.' },
  { stage: 'Foundational', ageRange: '4-6', domain: 'Cognitive', milestone: 'Sorting & Spatial Orientation', description: 'Sorting items by size/color, simple maze puzzle solving, memory match card games.' },
  { stage: 'Foundational', ageRange: '4-6', domain: 'Creativity', milestone: 'Freeform Expression & Color Play', description: 'Exploring digital tools, combining colors, drawing basic objects, sandbox block placement.' },
  { stage: 'Foundational', ageRange: '4-6', domain: 'Emotional', milestone: 'Self-Emotion Labeling', description: 'Labeling primary facial emotions (happy, sad, angry), expressing basic feelings, taking turns.' },
  { stage: 'Preparatory', ageRange: '7-10', domain: 'Literacy', milestone: 'Reading Comprehension & Grammar', description: 'Reading short stories independently, answering comprehension questions, basic grammar and sentence structure.' },
  { stage: 'Preparatory', ageRange: '7-10', domain: 'Numeracy', milestone: 'Four Basic Arithmetic Operations', description: 'Addition, subtraction, multiplication, division, and resolving simple word problems.' },
  { stage: 'Preparatory', ageRange: '7-10', domain: 'Cognitive', milestone: 'Logical Sequencing & Spatial Modeling', description: 'Multi-step planning, solving complex spatial mazes, logical deductions.' },
  { stage: 'Preparatory', ageRange: '7-10', domain: 'Creativity', milestone: 'Composition & Structured Design', description: 'Designing complex grid patterns, creating melodies, structured drawing challenges.' },
  { stage: 'Preparatory', ageRange: '7-10', domain: 'Emotional', milestone: 'Conflict Resolution & Self-Regulation', description: 'Demonstrating empathy in complex social scenarios, mindfulness breathing practice, cooperative behavior.' }
];

export const getMilestonesByAge = (age: number): NepMilestone[] => {
  if (age <= 3) return NEP_MILESTONES.filter(m => m.ageRange === '1-3');
  if (age <= 6) return NEP_MILESTONES.filter(m => m.ageRange === '4-6');
  return NEP_MILESTONES.filter(m => m.ageRange === '7-10');
};
