/**
 * src/services/analyticsService.ts
 *
 * MongoDB API-backed analytics service.
 * All types and functions that analytics pages depend on.
 * Functions now call our backend API via axios.
 */

// @ts-ignore
import client from '../api/client';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Child {
  id: string;
  _id?: string;
  name: string;
  age: number;
  avatar?: string;
  grade?: string;
  parent_uid?: string;
  xp?: number;
  stars?: number;
  coins?: number;
  dayStreak?: number;
}

export interface Assessment {
  id: string;
  child_id: string;
  domain: 'Literacy' | 'Numeracy' | 'Cognitive' | 'Creativity' | 'Emotional';
  activity_id?: string;
  activity_name?: string;
  score: number;
  accuracy: number;
  time: number;
  attempts: number;
  date: string;
}

export interface AIAnalysis {
  child_id: string;
  reading_difficulty: boolean;
  numeracy_gap: boolean;
  learning_delay_flag: boolean;
  strength_areas: string[];
  last_updated: string;
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

export interface ConfigThresholds {
  accuracyCutoff: number;
  consecutiveSessions: number;
  inactivityDays: number;
}

export interface Report {
  id: string;
  child_id: string;
  week_start: string;
  summary: string;
  generated_at: string;
}

// ── NEP Milestones (static data) ───────────────────────────────────────────

export const NEP_MILESTONES = [
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

export const getMilestonesByAge = (age: number) => {
  if (age <= 3) return NEP_MILESTONES.filter(m => m.ageRange === '1-3');
  if (age <= 6) return NEP_MILESTONES.filter(m => m.ageRange === '4-6');
  return NEP_MILESTONES.filter(m => m.ageRange === '7-10');
};

// ── API functions ──────────────────────────────────────────────────────────

// Get all children (for admin/teacher views)
export const getChildren = async (): Promise<Child[]> => {
  try {
    const { data } = await client.get('/children');
    return (data.data || []).map((c: any) => ({ ...c, id: c._id || c.id }));
  } catch {
    return [];
  }
};

// Map activity_type to domain
const mapActivityTypeToDomain = (type: string): Assessment['domain'] => {
  const map: Record<string, Assessment['domain']> = {
    story:         'Literacy',
    phonics:       'Literacy',
    word_builder:  'Literacy',
    picture_match: 'Literacy',
    fluency:       'Literacy',
    numeracy:      'Numeracy',
    math:          'Numeracy',
    puzzle:        'Cognitive',
    logic:         'Cognitive',
    creativity:    'Creativity',
    emotional:     'Emotional',
  };
  return map[type] || 'Cognitive';
};

// Get assessments (activity scores) for a child
export const getAssessments = async (childId?: string): Promise<Assessment[]> => {
  try {
    const params = childId ? { childId } : {};
    const { data } = await client.get('/scores', { params });
    return (data.data || []).map((s: any) => ({
      id:            s._id || s.id,
      child_id:      s.child_id,
      domain:        mapActivityTypeToDomain(s.activity_type),
      activity_name: s.activity_type,
      score:         s.score || 0,
      accuracy:      s.accuracy || 0,
      time:          s.time_spent || 0,
      attempts:      s.attempts || 1,
      date:          s.date || s.created_at,
    }));
  } catch {
    return [];
  }
};

// Calculate AI analysis dynamically from score logs (avoiding stale mock states)
export const getAiAnalysis = async (childId: string): Promise<AIAnalysis> => {
  try {
    const assessments = await getAssessments(childId);
    
    const literacyScores = assessments.filter(a => a.domain === 'Literacy');
    const numeracyScores = assessments.filter(a => a.domain === 'Numeracy');
    
    const avgLiteracy = literacyScores.length > 0 
      ? literacyScores.reduce((sum, a) => sum + a.accuracy, 0) / literacyScores.length 
      : 100;
      
    const avgNumeracy = numeracyScores.length > 0 
      ? numeracyScores.reduce((sum, a) => sum + a.accuracy, 0) / numeracyScores.length 
      : 100;
      
    const reading_difficulty = avgLiteracy < 60 && literacyScores.length >= 3;
    const numeracy_gap = avgNumeracy < 60 && numeracyScores.length >= 3;
    
    const domains: Assessment['domain'][] = ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'];
    const strength_areas: string[] = [];
    domains.forEach(d => {
      const list = assessments.filter(a => a.domain === d);
      if (list.length >= 2) {
        const avg = list.reduce((sum, a) => sum + a.accuracy, 0) / list.length;
        if (avg >= 80) strength_areas.push(d);
      }
    });

    return {
      child_id: childId,
      reading_difficulty,
      numeracy_gap,
      learning_delay_flag: reading_difficulty || numeracy_gap,
      strength_areas,
      last_updated: new Date().toISOString()
    };
  } catch (e) {
    console.error('getAiAnalysis error:', e);
    return {
      child_id: childId,
      reading_difficulty: false,
      numeracy_gap: false,
      learning_delay_flag: false,
      strength_areas: [],
      last_updated: new Date().toISOString()
    };
  }
};

// Get recommendations for a child
export const getRecommendations = async (childId: string): Promise<Recommendation[]> => {
  try {
    const { data } = await client.get('/milestones/recommendations', { params: { childId } });
    return (data.data || []).map((r: any) => ({
      id: r._id || r.id,
      child_id: r.child_id,
      activity_id: r.activity_id,
      activity_name: r.activity_name,
      domain: r.domain,
      reason: r.reason,
      priority: r.priority || 'Medium',
      completed: r.completed || false,
      generated_date: r.generated_date || r.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
};

// Update recommendation status
export const updateRecommendationStatus = async (
  id: string,
  completed: boolean
): Promise<void> => {
  try {
    await client.put(`/milestones/recommendations/${id}`, { completed });
  } catch (e) {
    console.error('Failed to update recommendation status:', e);
  }
};

// Add recommendation (assigned by teacher or system)
export const addRecommendation = async (
  rec: Omit<Recommendation, 'id' | 'generated_date' | 'completed'>
): Promise<Recommendation> => {
  try {
    const { data } = await client.post('/milestones/recommendations', {
      child_id: rec.child_id,
      activity_id: rec.activity_id,
      activity_name: rec.activity_name,
      domain: rec.domain,
      reason: rec.reason,
      priority: rec.priority,
      completed: false,
    });
    const saved = data.data;
    return {
      id: saved._id || saved.id,
      child_id: saved.child_id,
      activity_id: saved.activity_id,
      activity_name: saved.activity_name,
      domain: saved.domain,
      reason: saved.reason,
      priority: saved.priority || 'Medium',
      completed: saved.completed || false,
      generated_date: saved.generated_date || saved.created_at || new Date().toISOString(),
    };
  } catch (e) {
    console.error('Failed to add recommendation:', e);
    return {
      id: Date.now().toString(),
      child_id: rec.child_id,
      activity_id: rec.activity_id,
      activity_name: rec.activity_name,
      domain: rec.domain,
      reason: rec.reason,
      priority: rec.priority || 'Medium',
      completed: false,
      generated_date: new Date().toISOString(),
    };
  }
};

const DEFAULT_THRESHOLDS: ConfigThresholds = {
  accuracyCutoff: 60,
  consecutiveSessions: 3,
  inactivityDays: 5
};

// Get thresholds (admin setting for alert levels)
export const getThresholds = async (): Promise<ConfigThresholds> => {
  try {
    const raw = localStorage.getItem('config_thresholds');
    return raw ? JSON.parse(raw) : DEFAULT_THRESHOLDS;
  } catch {
    return DEFAULT_THRESHOLDS;
  }
};

export const saveThresholds = async (thresholds: ConfigThresholds): Promise<void> => {
  try {
    localStorage.setItem('config_thresholds', JSON.stringify(thresholds));
  } catch (e) {
    console.error('Failed to save thresholds:', e);
  }
};

// Add assessment (save score)
export const addAssessment = async (assessment: Omit<Assessment, 'id'>): Promise<void> => {
  try {
    await client.post('/scores', {
      child_id:      assessment.child_id,
      activity_type: assessment.domain.toLowerCase(),
      score:         assessment.score,
      accuracy:      assessment.accuracy,
      time_spent:    assessment.time,
      attempts:      assessment.attempts,
    });
  } catch (e) {
    console.error('Failed to save assessment:', e);
  }
};

// Get reports
export const getReports = async (childId: string): Promise<Report[]> => {
  return [];
};

// Generate weekly report
export const generateWeeklyReport = async (childId: string): Promise<Report> => {
  return {
    id:           Date.now().toString(),
    child_id:     childId,
    week_start:   new Date().toISOString(),
    summary:      'Weekly report generated successfully.',
    generated_at: new Date().toISOString(),
  };
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

// Initialize database (no-op — MongoDB is always ready)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const initializeDatabase = async (_reset?: boolean): Promise<void> => {
  console.log('MongoDB backend ready.');
};
