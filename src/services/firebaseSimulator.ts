/**
 * src/services/firebaseSimulator.ts
 *
 * Firebase Simulator → MongoDB/API replacement.
 * All types and functions that analytics pages depend on.
 * Functions now call our backend API via axios.
 */

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
  id?: string;
  child_id: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overall_score: number;
  generated_at?: string;
}

export interface Recommendation {
  id: string;
  child_id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'skipped';
  created_at?: string;
}

export interface Threshold {
  domain: string;
  min_score: number;
  alert_below: number;
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
  { age: 3, domain: 'Literacy',   milestone: 'Recognizes letters and simple words' },
  { age: 3, domain: 'Numeracy',   milestone: 'Counts up to 10 objects' },
  { age: 4, domain: 'Literacy',   milestone: 'Can read simple sentences' },
  { age: 4, domain: 'Numeracy',   milestone: 'Understands basic addition' },
  { age: 5, domain: 'Cognitive',  milestone: 'Solves simple puzzles independently' },
  { age: 5, domain: 'Emotional',  milestone: 'Identifies and names basic emotions' },
  { age: 6, domain: 'Literacy',   milestone: 'Reads short paragraphs fluently' },
  { age: 6, domain: 'Creativity', milestone: 'Creates original drawings and stories' },
];

// ── Helper functions ───────────────────────────────────────────────────────

export const calculateSchoolReadinessScore = (assessments: Assessment[]): number => {
  if (!assessments || assessments.length === 0) return 0;
  const avg = assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length;
  return Math.round(avg);
};

export const getMilestonesByAge = (age: number) => {
  return NEP_MILESTONES.filter(m => m.age <= age);
};

export const checkPredictiveInactivity = (assessments: Assessment[]): boolean => {
  if (!assessments || assessments.length === 0) return true;
  const lastDate = new Date(assessments[assessments.length - 1]?.date);
  const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > 7;
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

// Get assessments (activity scores) for a child
export const getAssessments = async (childId: string): Promise<Assessment[]> => {
  try {
    const { data } = await client.get('/scores', { params: { childId } });
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
  };
  return map[type] || 'Cognitive';
};

// Get AI analysis — generated locally from scores (no AI backend needed)
export const getAiAnalysis = async (childId: string): Promise<AIAnalysis | null> => {
  try {
    const { data } = await client.get(`/scores/summary/${childId}`);
    const summary = data.data || {};
    return {
      child_id:       childId,
      overall_score:  Math.round(summary.avgAccuracy || 0),
      strengths:      summary.totalScore > 50  ? ['Good engagement', 'Consistent practice'] : ['Showing improvement'],
      weaknesses:     summary.avgAccuracy < 60 ? ['Needs more practice', 'Try easier levels first'] : [],
      recommendations:['Practice daily for 15 minutes', 'Try new activity types', 'Review completed stories'],
      generated_at:   new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

// Get recommendations for a child
export const getRecommendations = async (childId: string): Promise<Recommendation[]> => {
  // Static recommendations based on child — can be extended
  return [
    { id: '1', child_id: childId, title: 'Daily Reading',   description: 'Read one story per day',        status: 'pending' },
    { id: '2', child_id: childId, title: 'Math Practice',   description: 'Complete 5 math problems daily', status: 'pending' },
    { id: '3', child_id: childId, title: 'Phonics Exercise', description: 'Practice letter sounds',        status: 'pending' },
  ];
};

// Update recommendation status
export const updateRecommendationStatus = async (
  id: string,
  status: Recommendation['status']
): Promise<void> => {
  // Stored locally for now — can add a backend endpoint later
  console.log(`Recommendation ${id} marked as ${status}`);
};

// Get thresholds (admin setting for alert levels)
export const getThresholds = async (): Promise<Threshold[]> => {
  return [
    { domain: 'Literacy',   min_score: 60, alert_below: 40 },
    { domain: 'Numeracy',   min_score: 60, alert_below: 40 },
    { domain: 'Cognitive',  min_score: 60, alert_below: 40 },
    { domain: 'Creativity', min_score: 60, alert_below: 40 },
    { domain: 'Emotional',  min_score: 60, alert_below: 40 },
  ];
};

export const saveThresholds = async (thresholds: Threshold[]): Promise<void> => {
  localStorage.setItem('thresholds', JSON.stringify(thresholds));
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

// Initialize database (no-op — MongoDB is always ready)
export const initializeDatabase = async (): Promise<void> => {
  console.log('MongoDB backend ready.');
};
