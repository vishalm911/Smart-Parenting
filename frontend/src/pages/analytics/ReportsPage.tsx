import React, { useMemo, useState, useEffect } from 'react';
import {
  FileText, Printer, Download, Compass, Sparkles, AlertTriangle, History, Info,
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, ClipboardList, Trash2, Copy, Users,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
// @ts-ignore
import { getMilestoneAssessments, getAllMilestoneAssessments, deleteMilestoneAssessment } from '../../api/services';
import { getAssessments, getAiAnalysis, getChildren, NEP_MILESTONES, calculateSchoolReadinessScore } from '../../services/analyticsService';
import type { Assessment, AIAnalysis, Child } from '../../services/analyticsService';
import { generateRecommendations } from '../../data/activityRecommendations';
import { DevelopmentalLearningCurves, getCompletedAtTime } from './DevelopmentalLearningCurves';

// "?"?"? Milestone Assessment Types "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

interface DomainScore { earned: number; maxPossible: number; percentage: number; }
interface MilestoneResponse { questionId: string; selectedAnswer: string; score: number; }
interface MilestoneAssessment {
  id: string; childId: string; milestone_level: number; totalScore: number;
  maxPossible: number; domainScores: Record<string, DomainScore>;
  responses: MilestoneResponse[]; completedAt: any;
}

// "?"?"? Trend helpers "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

type Trend = 'improved' | 'no-change' | 'needs-attention';
function getTrend(current: number, previous: number): Trend {
  if (current > previous) return 'improved';
  if (current === previous) return 'no-change';
  return 'needs-attention';
}

function formatTimestamp(ts: any): string {
  if (!ts) return '?"';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '?"'; }
}


const DOMAIN_EMOJIS: Record<string, string> = {
  'Physical Development': '[P]', 'Language Development': '[L]',
  'Cognitive Development': '[C]', 'Social-Emotional': '[SE]',
  'Fine Motor': '[FM]', 'Gross Motor': '[GM]', 'Communication': '[Com]', 'Self-Care': '[SC]',
  'Aesthetic Development': '[A]', 'Emotional Development': '[E]', 'Social Development': '[S]',
};
const getDomainEmoji = (d: string) => DOMAIN_EMOJIS[d] || '';


const TREND_CFG = {
  improved:          { label: 'Improved',         color: '#10B981', bg: 'rgba(16,185,129,0.12)',  Icon: TrendingUp   },
  'no-change':       { label: 'No Change',        color: '#818CF8', bg: 'rgba(129,140,248,0.12)', Icon: Minus        },
  'needs-attention': { label: 'Needs Attention',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  Icon: TrendingDown },
};

// "?"?"? Compute effective overall score "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?
// totalScore stored by AssessmentModule is already a percentage (0-100).
// Fallback: if stored as 0 but responses exist, re-derive from responses.
function effectiveScore(a: MilestoneAssessment): number {
  if (a.totalScore > 0) return a.totalScore;
  // Re-derive from responses if totalScore was saved as 0 incorrectly
  if (a.responses?.length > 0) {
    const earned = a.responses.reduce((s, r) => s + (r.score ?? 0), 0);
    const max    = a.responses.length * 2;
    return max > 0 ? Math.round((earned / max) * 100) : 0;
  }
  // Re-derive from domainScores if both above fail
  if (a.domainScores) {
    const vals = Object.values(a.domainScores);
    if (vals.length > 0) {
      const totalEarned = vals.reduce((s, d) => s + d.earned, 0);
      const totalMax    = vals.reduce((s, d) => s + d.maxPossible, 0);
      return totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    }
  }
  return 0;
}

// "?"?"? Score color helper "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?
const scoreColor = (pct: number) =>
  pct >= 80 ? '#059669' : pct >= 60 ? '#6366F1' : '#D97706';

// "?"?"? Individual Report Card "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

const ReportCard: React.FC<{
  assessment: MilestoneAssessment;
  index: number;          // 0 = newest
  totalCount: number;     // total number of assessments
  prevAssessment: MilestoneAssessment | null;
  childName: string;
}> = ({ assessment, index, totalCount, prevAssessment, childName }) => {
  const [open, setOpen] = useState(index === 0);

  // effective score with fallback
  const score = effectiveScore(assessment);

  const recommendations = useMemo(
    () => generateRecommendations(assessment.domainScores ?? {}, 4),
    [assessment.domainScores],
  );

  // Sort domains: lowest % first (needs attention first)
  const domains = Object.entries(assessment.domainScores ?? {})
    .sort(([, a], [, b]) => a.percentage - b.percentage);

  const hasPrev = prevAssessment !== null;
  const sc      = scoreColor(score);

  // Card label: #1 = oldest, #totalCount = newest ("Latest")
  const cardNumber = totalCount - index; // newest card gets #totalCount label
  const isLatest   = index === 0;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1.5px solid #F0E8DA',
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>

      {/* "?"? Header (always visible) "?"? */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '14px 18px',
          background: 'none', border: 'none', cursor: 'pointer', gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.62rem', fontWeight: '800', padding: '3px 10px',
            borderRadius: '20px', whiteSpace: 'nowrap',
            background: isLatest ? '#F4A300' : '#F0E8DA',
            color:      isLatest ? '#FFFFFF'  : '#5A5A5A',
          }}>
            {isLatest ? `Latest - #${cardNumber}` : `Assessment #${cardNumber}`}
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '700', fontSize: '0.93rem', color: '#1A1A1A' }}>
              {formatTimestamp(assessment.completedAt)}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#5A5A5A', marginTop: '1px' }}>
              {childName} - Milestone Level {assessment.milestone_level}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: sc }}>{score}%</div>
            <div style={{ fontSize: '0.62rem', color: '#8A8A8A', fontWeight: '600' }}>Overall Score</div>
          </div>
          {open
            ? <ChevronUp   size={18} color="#8A8A8A" />
            : <ChevronDown size={18} color="#8A8A8A" />}
        </div>
      </button>

      {/* "?"? Expanded body "?"? */}
      {open && (
        <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #F5F0E6' }}>

          {/* Comparison notice */}
          {!hasPrev && (
            <div style={{
              marginTop: '12px',
              fontSize: '0.78rem', color: '#8A8A8A', fontStyle: 'italic',
              background: '#FFF8EC', border: '1px solid #F0E8DA',
              borderRadius: '8px', padding: '9px 12px',
            }}>
              No previous assessment available for comparison.
            </div>
          )}

          {/* Domain Performance */}
          {domains.length > 0 && (
            <div style={{ marginTop: hasPrev ? '12px' : '4px' }}>
              <h4 style={{ fontSize: '0.82rem', color: '#5A5A5A', marginBottom: '10px', fontWeight: '800' }}>
                Domain Performance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {domains.map(([domain, scores]) => {
                  const pct      = scores.percentage;
                  const bc       = scoreColor(pct);
                  const prevPct  = prevAssessment?.domainScores?.[domain]?.percentage;
                  const trend    = hasPrev && prevPct !== undefined ? getTrend(pct, prevPct) : null;
                  const tc       = trend ? TREND_CFG[trend] : null;

                  return (
                    <div key={domain} style={{ display: 'grid', gridTemplateColumns: '1.4rem 1fr 44px auto', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{getDomainEmoji(domain)}</span>
                      <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: '700', color: '#1A1A1A', marginBottom: '4px' }}>{domain}</div>
                        {/* Progress bar track - visible on light bg */}
                        <div style={{ height: '7px', borderRadius: '4px', background: '#F0E8DA', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: bc, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: bc, textAlign: 'right' }}>{pct}%</span>
                      {tc ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          fontSize: '0.58rem', fontWeight: '800',
                          background: tc.bg, color: tc.color,
                          padding: '2px 7px', borderRadius: '20px', whiteSpace: 'nowrap',
                        }}>
                          <tc.Icon size={10} />{tc.label}
                        </span>
                      ) : <span />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parent Responses */}
          {assessment.responses?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.82rem', color: '#5A5A5A', marginBottom: '8px', fontWeight: '800' }}>
                Parent Responses
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '200px', overflowY: 'auto' }}>
                {assessment.responses.map((r, i) => {
                  const ac = r.selectedAnswer === 'Yes' ? '#059669'
                    : r.selectedAnswer === 'Sometimes' ? '#D97706' : '#DC2626';
                  const ae = r.selectedAnswer === 'Yes' ? '[Y]'
                    : r.selectedAnswer === 'Sometimes' ? '[~]' : '[N]';
                  return (
                    <div key={r.questionId || i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 10px', borderRadius: '7px',
                      background: '#FFF8EC', border: '1px solid #F0E8DA',
                    }}>
                      <span style={{ fontSize: '0.75rem' }}>{ae}</span>
                      <span style={{ fontSize: '0.71rem', color: '#5A5A5A', flex: 1 }}>
                        Q{i + 1}: {r.questionId}
                      </span>
                      <span style={{
                        fontSize: '0.64rem', fontWeight: '800', color: ac,
                        padding: '1px 8px', borderRadius: '20px',
                        background: `${ac}18`,
                      }}>{r.selectedAnswer}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Recommended Activities */}
          {recommendations.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '0.82rem', marginBottom: '8px', fontWeight: '800',
                display: 'flex', alignItems: 'center', gap: '6px', color: '#6366F1',
              }}>
                <Sparkles size={13} />AI Recommended Activities
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                {recommendations.map((act: any) => (
                  <div key={act.id} style={{
                    padding: '10px 12px', borderRadius: '10px',
                    background: act.domainMeta?.bgColor || '#FFF8EC',
                    border: `1.5px solid ${act.domainMeta?.color || '#F0E8DA'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1rem' }}>{act.emoji || '*'}</span>
                      <span style={{ fontSize: '0.71rem', fontWeight: '800', color: act.domainMeta?.color || '#1A1A1A' }}>
                        {act.title}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.67rem', color: '#5A5A5A', margin: 0, lineHeight: '1.4' }}>
                      {act.description}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.59rem', color: '#8A8A8A' }}>{act.duration}</span>
                      <span style={{ fontSize: '0.59rem', color: '#8A8A8A' }}>/ {act.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// "?"?"? Assessment History Section (Firestore) "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

interface AssessmentHistorySectionProps {
  selectedChild: { id: string; name: string };
  milestoneAssessments: MilestoneAssessment[];
  maLoading: boolean;
  setMilestoneAssessments: React.Dispatch<React.SetStateAction<MilestoneAssessment[]>>;
}

const AssessmentHistorySection: React.FC<AssessmentHistorySectionProps> = ({
  selectedChild,
  milestoneAssessments,
  maLoading,
  setMilestoneAssessments,
}) => {
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearRecords = async () => {
    setClearing(true);
    try {
      await Promise.all(
        milestoneAssessments.map(a => deleteMilestoneAssessment(a.id))
      );
      setMilestoneAssessments([]);
    } catch (e) {
      console.error('[AssessmentHistory] Failed to clear records:', e);
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  };

  // Timeline: oldest -> newest (for the bar chart)
  const timeline = useMemo(() =>
    [...milestoneAssessments].reverse().map((a, i) => ({
      label: `#${i + 1}`,
      score: effectiveScore(a),
      date:  formatTimestamp(a.completedAt),
    })),
    [milestoneAssessments],
  );

  if (maLoading) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>...</div>
        <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>Loading assessment history...</p>
      </div>
    );
  }

  if (milestoneAssessments.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <ClipboardList size={40} color="#8A8A8A" style={{ margin: '0 auto 12px' }} />
        <h4 style={{ marginBottom: '6px', color: '#1A1A1A' }}>No Assessment Reports Available</h4>
        <p style={{ fontSize: '0.82rem', color: '#5A5A5A' }}>
          No assessment reports available yet. Complete a milestone assessment from the child's dashboard to see results here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Progress Comparison ?" only when ?2 assessments */}
      {timeline.length >= 2 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1A1A1A' }}>
            <TrendingUp size={18} color="#F4A300" />Progress Comparison
          </h3>
          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '18px', paddingBottom: '6px', borderBottom: '2px solid #F0E8DA' }}>
            {timeline.map((pt, i) => {
              const bc       = scoreColor(pt.score);
              const isLatest = i === timeline.length - 1;
              const diff     = i > 0 ? pt.score - timeline[i - 1].score : null;
              const barH     = Math.max(24, pt.score * 1.5); // max ~150px at 100%
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: '1 1 60px', minWidth: '60px' }}>
                  {/* diff badge */}
                  {diff !== null && (
                    <span style={{
                      fontSize: '0.62rem', fontWeight: '800', marginBottom: '2px',
                      color: diff > 0 ? '#059669' : diff < 0 ? '#D97706' : '#6366F1',
                    }}>
                      {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : 'Same'}
                    </span>
                  )}
                  {/* score label above bar */}
                  <span style={{ fontSize: '0.72rem', fontWeight: '900', color: bc }}>{pt.score}%</span>
                  {/* bar */}
                  <div style={{
                    width: '100%', height: `${barH}px`,
                    borderRadius: '8px 8px 0 0',
                    background: isLatest ? bc : `${bc}66`,
                    border: isLatest ? `2px solid ${bc}` : `1px solid ${bc}44`,
                    position: 'relative',
                  }} />
                  <span style={{ fontSize: '0.65rem', color: '#5A5A5A', fontWeight: '700' }}>{pt.label}</span>
                  <span style={{ fontSize: '0.55rem', color: '#8A8A8A', textAlign: 'center' }}>{pt.date}</span>
                </div>
              );
            })}
          </div>
          {/* Legend text */}
          <div style={{ fontSize: '0.73rem', color: '#5A5A5A', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {timeline.map((pt, i) => (
              <span key={i}>
                {pt.label}: <strong style={{ color: scoreColor(pt.score) }}>{pt.score}%</strong>
                {i === timeline.length - 1 && <span style={{ color: '#F4A300', fontWeight: '700' }}> (Latest)</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Clear Modal */}
      {showClearConfirm && (
        <div className="print-hide" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '18px', padding: '32px 28px',
            maxWidth: '380px', width: '90%', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '50%',
              background: 'rgba(220,38,38,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Trash2 size={24} color="#DC2626" />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#1A1A1A', marginBottom: '8px', fontWeight: '800' }}>
              Clear All Records?
            </h3>
            <p style={{ fontSize: '0.83rem', color: '#5A5A5A', marginBottom: '24px', lineHeight: '1.5' }}>
              This will permanently delete all <strong>{milestoneAssessments.length}</strong> assessment
              report{milestoneAssessments.length !== 1 ? 's' : ''} for <strong>{selectedChild.name}</strong>.
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #E5E7EB',
                  background: '#F9FAFB', color: '#374151', fontWeight: '700',
                  fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearRecords}
                disabled={clearing}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: clearing ? '#FCA5A5' : '#DC2626', color: '#FFFFFF',
                  fontWeight: '700', fontSize: '0.85rem',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <Trash2 size={14} />
                {clearing ? 'Clearing...' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual report cards */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1A1A1A', margin: 0 }}>
            <ClipboardList size={18} color="#F4A300" />
            Assessment History
            <span style={{
              fontSize: '0.65rem', padding: '2px 10px', borderRadius: '20px',
              background: '#F4A300', color: '#FFFFFF', fontWeight: '800',
            }}>
              {milestoneAssessments.length} {milestoneAssessments.length === 1 ? 'Report' : 'Reports'}
            </span>
          </h3>
          {milestoneAssessments.length > 0 && (
            <button
              className="print-hide"
              onClick={() => setShowClearConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '20px',
                border: '1.5px solid #FECACA', background: 'rgba(220,38,38,0.06)',
                color: '#DC2626', fontWeight: '700', fontSize: '0.75rem',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.06)'; }}
            >
              <Trash2 size={13} />
              Clear Records
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {milestoneAssessments.map((a, i) => (
            <ReportCard
              key={a.id}
              assessment={a}
              index={i}
              totalCount={milestoneAssessments.length}
              prevAssessment={milestoneAssessments[i + 1] ?? null}
              childName={selectedChild.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Domain-wise Assessment History Table ─────────────────────────────────────

interface DomainWiseTableProps {
  milestoneAssessments: MilestoneAssessment[];
}

const DomainWiseTable: React.FC<DomainWiseTableProps> = ({ milestoneAssessments }) => {
  // Sort assessments chronologically (oldest = Assessment 1)
  const chronologicalAssessments = useMemo(() => {
    return [...milestoneAssessments].sort((a, b) => getCompletedAtTime(a.completedAt) - getCompletedAtTime(b.completedAt));
  }, [milestoneAssessments]);

  // Derive domains dynamically
  const domains = useMemo(() => {
    if (milestoneAssessments.length === 0) return [];
    return Object.keys(milestoneAssessments[0]?.domainScores || {});
  }, [milestoneAssessments]);

  const handleCopySummary = () => {
    const summaryText = domains.map(domain => {
      const latestVal = chronologicalAssessments[chronologicalAssessments.length - 1]?.domainScores?.[domain]?.percentage;
      const displayVal = latestVal !== undefined ? `${latestVal}%` : '—';
      return `${domain}: ${displayVal}`;
    }).join('\n');
    navigator.clipboard.writeText(summaryText)
      .then(() => alert('Summary copied to clipboard!'))
      .catch(err => console.error('Failed to copy text: ', err));
  };

  if (milestoneAssessments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No assessment history available.</p>
      </div>
    );
  }

  const isScrollable = chronologicalAssessments.length > 4;

  return (
    <>
      <div style={{ overflowX: isScrollable ? 'auto' : 'visible', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isScrollable ? '650px' : '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9F5EE', fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #F0E8DA' }}>Domain</th>
              {chronologicalAssessments.map((_, index) => (
                <th key={index} className="hidden sm:table-cell" style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #F0E8DA' }}>
                  Assessment {index + 1}
                </th>
              ))}
              <th style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #F0E8DA' }}>Latest</th>
              <th style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #F0E8DA', whiteSpace: 'nowrap' }}>
                <span style={{ marginRight: '6px' }}>Avg Growth / Assessment</span>
                <button 
                  onClick={handleCopySummary}
                  title="Copy Summary"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, verticalAlign: 'middle', color: 'var(--text-secondary)' }}
                >
                  <Copy size={14} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain, rowIndex) => {
              const rowBg = rowIndex % 2 === 0 ? '#FFFFFF' : '#FFF8EC';
              
              const latestVal = chronologicalAssessments[chronologicalAssessments.length - 1]?.domainScores?.[domain]?.percentage;
              
              const scores = chronologicalAssessments
                .map(a => a.domainScores?.[domain]?.percentage)
                .filter((val): val is number => val !== undefined);
  
              let avgGrowth: number | null = null;
              if (scores.length >= 2) {
                const firstScore = scores[0];
                const latestScore = scores[scores.length - 1];
                avgGrowth = Number(((latestScore - firstScore) / (scores.length - 1)).toFixed(1));
              }
  
              return (
                <tr key={domain} style={{ backgroundColor: rowBg, borderBottom: '1px solid #F0E8DA' }}>
                  <td style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 'bold', fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    <span style={{ marginRight: '8px' }}>{getDomainEmoji(domain)}</span>
                    {domain}
                  </td>
                  {chronologicalAssessments.map((a, colIndex) => {
                    const score = a.domainScores?.[domain]?.percentage;
                    return (
                      <td key={colIndex} className="hidden sm:table-cell" style={{ textAlign: 'center', padding: '12px', fontSize: '0.82rem', fontWeight: 'bold', color: score !== undefined ? scoreColor(score) : 'var(--text-muted)' }}>
                        {score !== undefined ? `${score}%` : '—'}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', padding: '12px', fontSize: '0.82rem', fontWeight: 'bold', color: latestVal !== undefined ? scoreColor(latestVal) : 'var(--text-muted)' }}>
                    {latestVal !== undefined ? `${latestVal}%` : '—'}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                    {avgGrowth === null ? (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: avgGrowth > 0 ? '#10B981' : avgGrowth < 0 ? '#EF4444' : '#8A8A8A'
                          }} />
                          <span style={{
                            color: avgGrowth > 0 ? '#10B981' : avgGrowth < 0 ? '#EF4444' : 'var(--text-muted)',
                            whiteSpace: 'nowrap'
                          }}>
                            {avgGrowth > 0 ? `+${avgGrowth}` : avgGrowth}% / assessment
                          </span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                          {avgGrowth > 0 ? '📈 Avg Increment' : avgGrowth < 0 ? '📉 Avg Decline' : '➡️ No Change'}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{
        marginTop: '16px',
        background: 'rgba(59, 130, 246, 0.06)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '0.78rem',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.6'
      }}>
        <strong style={{ color: '#1A1A1A' }}>📘 Parent Guide:</strong> Avg Growth / Assessment indicates the average improvement in your child's performance across all completed assessments within each developmental domain. This helps you understand long-term learning progress instead of focusing on a single assessment result.
      </div>
    </>
  );
};

// ─── Domain-wise Comparison Table Helpers ─────────────────────────────────────
const getDomainVisualInfo = (domain: string) => {
  switch (domain) {
    case 'Literacy':
      return {
        bg: 'rgba(16,185,129,0.15)',
        content: <span style={{ fontSize: '1rem' }}>📖</span>
      };
    case 'Numeracy':
      return {
        bg: 'rgba(99,102,241,0.15)',
        content: <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#6366F1' }}>123</span>
      };
    case 'Cognitive':
      return {
        bg: 'rgba(139,92,246,0.15)',
        content: <span style={{ fontSize: '1rem' }}>🧠</span>
      };
    case 'Creativity':
      return {
        bg: 'rgba(249,115,22,0.15)',
        content: <span style={{ fontSize: '1rem' }}>🎨</span>
      };
    case 'Emotional':
      return {
        bg: 'rgba(239,68,68,0.15)',
        content: <span style={{ fontSize: '1rem' }}>😊</span>
      };
    case 'physical':
    case 'Physical Development':
      return { bg: 'rgba(16,185,129,0.15)', content: <span style={{ fontSize: '1rem' }}>🏃</span> };
    case 'cognitive':
    case 'Cognitive Development':
      return { bg: 'rgba(139,92,246,0.15)', content: <span style={{ fontSize: '1rem' }}>🧠</span> };
    case 'emotional':
    case 'Emotional Development':
      return { bg: 'rgba(239,68,68,0.15)', content: <span style={{ fontSize: '1rem' }}>😊</span> };
    case 'social':
    case 'Social Development':
      return { bg: 'rgba(99,102,241,0.15)', content: <span style={{ fontSize: '1rem' }}>🤝</span> };
    case 'aesthetic':
    case 'Aesthetic Development':
      return { bg: 'rgba(249,115,22,0.15)', content: <span style={{ fontSize: '1rem' }}>🎨</span> };
    default:
      return {
        bg: 'rgba(156,163,175,0.15)',
        content: <span style={{ fontSize: '1rem' }}>📊</span>
      };
  }
};

const getDomainNote = (domain: string, status: 'above' | 'ontrack' | 'needs') => {
  const notes: Record<string, Record<'above' | 'ontrack' | 'needs', string>> = {
    Literacy: { above: 'Excellent!', ontrack: 'Keep practicing!', needs: 'Needs focus' },
    Numeracy: { above: 'Great work!', ontrack: 'Keep practicing!', needs: 'Needs focus' },
    Cognitive: { above: 'Great job!', ontrack: 'Keep practicing!', needs: 'Practice more!' },
    Creativity: { above: 'Great job!', ontrack: 'Keep practicing!', needs: 'Needs focus' },
    Emotional: { above: 'Excellent!', ontrack: 'Keep practicing!', needs: 'Focus area' },
    'physical': { above: 'Great strength!', ontrack: 'Keep active!', needs: 'Needs focus' },
    'cognitive': { above: 'Great job!', ontrack: 'Keep practicing!', needs: 'Practice more!' },
    'emotional': { above: 'Excellent!', ontrack: 'Keep practicing!', needs: 'Focus area' },
    'social': { above: 'Excellent!', ontrack: 'Keep interacting!', needs: 'Needs focus' },
    'aesthetic': { above: 'Great creativity!', ontrack: 'Keep creating!', needs: 'Needs focus' },
    'Physical Development': { above: 'Great strength!', ontrack: 'Keep active!', needs: 'Needs focus' },
    'Cognitive Development': { above: 'Great job!', ontrack: 'Keep practicing!', needs: 'Practice more!' },
    'Emotional Development': { above: 'Excellent!', ontrack: 'Keep practicing!', needs: 'Focus area' },
    'Social Development': { above: 'Excellent!', ontrack: 'Keep interacting!', needs: 'Needs focus' },
    'Aesthetic Development': { above: 'Great creativity!', ontrack: 'Keep creating!', needs: 'Needs focus' }
  };
  return notes[domain]?.[status] || '';
};

// "?"?"? ReportsPage (main export) "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

// Use a broad interface so both the real Firestore activeChild and the simulator
// Child type are accepted. The real child profile uses age_group (string) not age (number).
interface RealChild {
  id: string;
  name: string;
  age?: number;         // simulator Child has this
  age_group?: string;   // real Firestore child_profiles has this
  [key: string]: any;
}

interface ReportsPageProps { selectedChild: RealChild; }

export const ReportsPage: React.FC<ReportsPageProps> = ({ selectedChild }) => {
  const childId = selectedChild._id || selectedChild.id;
  console.log('[ReportsPage] Active childId being used for queries:', childId, '| name:', selectedChild.name);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfPhase, setPdfPhase] = useState('');
  // Derive age group from real child profile (age_group) or simulator profile (age number)
  const derivedAgeGroup: '1-3' | '4-6' | '7-10' = (() => {
    if (selectedChild.age_group) return selectedChild.age_group as '1-3' | '4-6' | '7-10';
    const age = selectedChild.age ?? 5;
    return age <= 3 ? '1-3' : age <= 6 ? '4-6' : '7-10';
  })();
  const [milestoneAgeGroup, setMilestoneAgeGroup] = useState<'1-3' | '4-6' | '7-10'>(derivedAgeGroup);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis>({ child_id: childId, reading_difficulty: false, numeracy_gap: false, learning_delay_flag: false, strength_areas: [], last_updated: '' });

  const [readiness, setReadiness] = useState(0);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [milestoneAssessments, setMilestoneAssessments] = useState<MilestoneAssessment[]>([]);
  const [maLoading, setMaLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setMaLoading(true);
    setMilestoneAssessments([]);
    console.log('[ReportsPage] Querying milestone_assessments for childId:', childId);
    (async () => {
      try {
        const { data } = await getMilestoneAssessments(childId);
        if (!cancelled) {
          const docs = [...data].sort((a, b) => {
            const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return tb - ta; // newest first
          });
          setMilestoneAssessments(docs);
        }
      } catch (e) {
        console.error('[ReportsPage] MongoDB error:', e);
        if (!cancelled) setMilestoneAssessments([]);
      } finally {
        if (!cancelled) setMaLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [childId]);

  // Real child averages from Firestore milestone_assessments
  const realChildAverages = useMemo(() => {
    const result: Record<string, number> = {};
    if (milestoneAssessments.length === 0) return result;
    // Get all domain keys dynamically from the first assessment
    const domainKeys = Object.keys(milestoneAssessments[0]?.domainScores ?? {});
    domainKeys.forEach(domain => {
      const allPercentages = milestoneAssessments
        .map(a => a.domainScores?.[domain]?.percentage)
        .filter((v): v is number => v !== undefined);
      result[domain] = allPercentages.length > 0
        ? Math.round(allPercentages.reduce((sum, v) => sum + v, 0) / allPercentages.length)
        : 0;
    });
    return result;
  }, [milestoneAssessments]);

  // Age-Group Average from real Firestore data using 2-step formula
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAssessments(childId),
      getAiAnalysis(childId),
      calculateSchoolReadinessScore(childId),
    ]).then(async ([a, an, r]) => {
      setAssessments(a); setAnalysis(an); setReadiness(r);

      const selectedAgeGroup: string =
        (selectedChild as any).age_group ??
        ((selectedChild.age ?? 5) <= 3 ? '1-3' : (selectedChild.age ?? 5) <= 6 ? '4-6' : '7-10');

      console.log('[Cohort] selectedAgeGroup:', selectedAgeGroup);

      // Fetch ALL milestone_assessments across all children in one query
      const { data: allAssessments } = await getAllMilestoneAssessments();
      console.log('[Cohort] Total milestone_assessments in MongoDB:', allAssessments.length);

      // Group by childId, exclude current child
      const byChild: Record<string, MilestoneAssessment[]> = {};
      allAssessments.forEach((d: any) => {
        const id = d._id || d.id;
        const data = { ...d, id } as MilestoneAssessment;
        if (data.childId === childId) return;
        if (!byChild[data.childId]) byChild[data.childId] = [];
        byChild[data.childId].push(data);
      });
      console.log('[Cohort] Other childIds with assessments:', Object.keys(byChild));

      // Fetch child_profiles to filter by age group
      const kids = await getChildren();
      const childProfiles: Record<string, any> = {};
      kids.forEach(c => { childProfiles[c.id] = c; });
      console.log('[Cohort] child_profiles count:', kids.length);

      // Filter to same age group
      const sameGroupChildIds = Object.keys(byChild).filter(cid => {
        const profile = childProfiles[cid];
        if (!profile) { console.log(`[Cohort] No profile for ${cid} — including`); return true; }
        const ag = profile.age_group ??
          ((profile.age ?? 5) <= 3 ? '1-3' : (profile.age ?? 5) <= 6 ? '4-6' : '7-10');
        console.log(`[Cohort] Child ${cid} name:${profile.name} age_group:${ag}`);
        return ag === selectedAgeGroup;
      });
      console.log('[Cohort] Same age group childIds:', sameGroupChildIds);

      // Get domain keys dynamically from current child's assessments
      const domainKeys = milestoneAssessments.length > 0
        ? Object.keys(milestoneAssessments[0]?.domainScores ?? {})
        : ['cognitive', 'emotional', 'physical', 'social', 'aesthetic'];

      console.log('[Cohort] domainKeys:', domainKeys);

      // Compute age-group average per domain
      const cohortRows = domainKeys.map(domain => {
        const kidAverages: number[] = [];
        sameGroupChildIds.forEach(cid => {
          const kidAssessments = byChild[cid] ?? [];
          const percentages = kidAssessments
            .map(a => a.domainScores?.[domain]?.percentage)
            .filter((v): v is number => v !== undefined);
          if (percentages.length > 0) {
            const kidAvg = percentages.reduce((sum, v) => sum + v, 0) / percentages.length;
            kidAverages.push(kidAvg);
            console.log(`[Cohort] Child ${cid} domain "${domain}" avg: ${kidAvg}`);
          }
        });
        const ageGroupAvg = kidAverages.length > 0
          ? Math.round(kidAverages.reduce((sum, v) => sum + v, 0) / kidAverages.length)
          : 75;
        console.log(`[Cohort] Domain "${domain}" final avg: ${ageGroupAvg}`);
        return { domain, Child: 0, AgeGroupAverage: ageGroupAvg };
      });

      console.log('[Cohort] Final cohortData:', cohortRows);
      setCohortData(cohortRows);
      setLoading(false);
    });
  }, [childId, milestoneAssessments, selectedChild]);

  const monthlyReports = useMemo(() => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const grouped: Record<string, any> = {};
    assessments.forEach(a => {
      const date = new Date(a.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) grouped[monthKey] = { key: monthKey, name: `${monthNames[date.getMonth()]} ${date.getFullYear()}`, scores: { Literacy: [], Numeracy: [], Cognitive: [], Creativity: [], Emotional: [] }, times: { Literacy: [], Numeracy: [], Cognitive: [], Creativity: [], Emotional: [] }, count: 0 };
      grouped[monthKey].scores[a.domain].push(a.score);
      grouped[monthKey].times[a.domain].push(a.time);
      grouped[monthKey].count++;
    });
    return Object.keys(grouped).sort().reverse().map(key => {
      const g = grouped[key];
      const domain_scores: Record<string, number> = {}, time_spent: Record<string, number> = {};
      Object.entries(g.scores).forEach(([d, list]: any) => { domain_scores[d] = list.length > 0 ? Math.round(list.reduce((acc: number, c: number) => acc + c, 0) / list.length) : 0; });
      Object.entries(g.times).forEach(([d, list]: any) => { time_spent[d] = list.length > 0 ? Math.round(list.reduce((acc: number, c: number) => acc + c, 0) / 60) : 0; });
      const activeDomains = Object.values(domain_scores).filter(s => s > 0).length;
      const sum = Object.values(domain_scores).reduce((acc, s) => acc + s, 0);
      const school_readiness_score = Math.min(100, Math.round((activeDomains > 0 ? Math.round(sum / 5) : 0) + Math.min(20, g.count * 0.8)));
      const ai_flags: string[] = [];
      if (analysis.reading_difficulty && domain_scores['Literacy'] < 60 && domain_scores['Literacy'] > 0) ai_flags.push('Phonics & Reading Fluency difficulty flagged for this month');
      if (analysis.numeracy_gap && domain_scores['Numeracy'] < 60 && domain_scores['Numeracy'] > 0) ai_flags.push('Counting & Geometry concepts require reinforcement');
      const recommendations: string[] = [];
      if (domain_scores['Literacy'] < 65 && domain_scores['Literacy'] > 0) recommendations.push('Phonics Matching Fun: Practice phonetic syllable matching (10 mins/day).');
      if (domain_scores['Numeracy'] < 65 && domain_scores['Numeracy'] > 0) recommendations.push('Geometry Shape Puzzle: Align visual spatial block models.');
      if (recommendations.length === 0) recommendations.push('Demonstrates solid steady learning progression. Focus on cognitive memory matches to build sequencing.');
      return { id: key, report_date: g.name, domain_scores, time_spent, ai_flags, recommendations, school_readiness_score };
    });
  }, [assessments, analysis]);

  useEffect(() => { if (monthlyReports.length > 0 && !selectedMonthKey) setSelectedMonthKey(monthlyReports[0].id); }, [monthlyReports, selectedMonthKey]);
  const activeReport = useMemo(() => monthlyReports.find(r => r.id === selectedMonthKey) || monthlyReports[0] || null, [monthlyReports, selectedMonthKey]);

  const domainAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'].forEach(d => { const list = assessments.filter(a => a.domain === d); avgs[d] = list.length > 0 ? list.reduce((acc, curr) => acc + curr.score, 0) / list.length : 0; });
    return avgs;
  }, [assessments]);

  const historyTimelineData = useMemo(() => {
    const datesMap: Record<string, Record<string, number[]>> = {};
    [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(a => {
      if (!datesMap[a.date]) datesMap[a.date] = {};
      if (!datesMap[a.date][a.domain]) datesMap[a.date][a.domain] = [];
      datesMap[a.date][a.domain].push(a.score);
    });
    let rolling: Record<string, number> = { Literacy: 75, Numeracy: 75, Cognitive: 75, Creativity: 75, Emotional: 75 };
    return Object.keys(datesMap).sort().slice(-12).map(date => {
      ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'].forEach(d => { if (datesMap[date][d]) rolling[d] = Math.round(datesMap[date][d].reduce((acc, c) => acc + c, 0) / datesMap[date][d].length); });
      return { date: date.substring(5), ...rolling };
    });
  }, [assessments]);

  const activeMilestones = useMemo(() => NEP_MILESTONES.filter(m => m.ageRange === milestoneAgeGroup), [milestoneAgeGroup]);

  const aiPatternsSummary = useMemo(() => {
    const list: any[] = [];
    if (readiness >= 85) list.push({ status: 'success', text: 'Outstanding developmental readiness score. Demonstrates advanced capabilities across multiple domains, particularly Cognitive and Creative zones.' });
    if (analysis.reading_difficulty) list.push({ status: 'danger', text: 'Detected persistent reading fluency difficulty. The child struggled with phonetic phoneme segmentation. Immediate multi-sensory reading exercises recommended.' });
    else list.push({ status: 'success', text: 'Phonics foundation and vocabulary acquisition are tracking within expected developmental boundaries.' });
    if (analysis.numeracy_gap) list.push({ status: 'danger', text: 'Early math concept gap identified. Focus on visual geometry alignment and simple counting blocks.' });
    if (analysis.strength_areas.length > 0) list.push({ status: 'info', text: `Strongest developmental pillars are: ${analysis.strength_areas.join(' & ')}. Excellent interactive exploration speed and accuracy.` });
    return list;
  }, [readiness, analysis]);

  const handleDownloadPdf = () => {
    setShowPdfModal(true); setPdfProgress(0); setPdfPhase('Analyzing developmental database...');
    const interval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => { setShowPdfModal(false); window.print(); }, 500); return 100; }
        const current = Math.min(100, prev + Math.floor(Math.random() * 15) + 5);
        if (current < 30) setPdfPhase('Compiling historical scores...');
        else if (current < 60) setPdfPhase('Generating chart trends...');
        else if (current < 85) setPdfPhase('Evaluating NEP 2020 milestones...');
        else setPdfPhase('Finalizing print styles...');
        return current;
      });
    }, 250);
  };

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}> Loading reports...</div>;

  return (
    <div className="fade-in print-report" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Print-only report header ───────────────────────────────────────────
           Hidden on screen via display:none (inline style).
           Revealed by @media print: .print-report .print-only-header { display: flex !important }
           Contains: SpacECE branding, report title, child name, generation date.
           ──────────────────────────────────────────────────────────────────── */}
      <div className="print-only-header" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* SpacECE brand mark */}
          <div>
            <div style={{ fontSize: '22pt', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              <span style={{ color: '#222222' }}>Space</span><span style={{ color: '#F4A300' }}>ECE</span>
            </div>
            <div style={{ fontSize: '7pt', fontWeight: 800, color: '#F4A300', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '2pt' }}>
              India Foundation · Learning Adventures
            </div>
          </div>
          {/* Report meta */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13pt', fontWeight: 800, color: '#1A1A1A' }}>Child Development Assessment Report</div>
            <div style={{ fontSize: '9pt', color: '#5A5A5A', marginTop: '3pt' }}>
              <strong>{selectedChild.name}</strong>
              &nbsp;·&nbsp;
              Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        {/* Gold accent divider */}
        <div style={{ height: '2pt', background: '#F4A300', marginTop: '10pt', borderRadius: '1pt' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div><h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={28} color="var(--primary)" />Developmental Reports & Milestones</h2><p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Complete historical analytics, age group averages, and milestones mapping against NEP 2020 Guidelines.</p></div>
        <div style={{ display: 'flex', gap: '12px' }} className="print-hide"><button className="btn btn-secondary" onClick={() => window.print()}><Printer size={18} />Print Report</button></div>
      </div>

      {/* print-hide: modal is never open during a print() call, but added as defensive guard */}
      {showPdfModal && (
        <div className="print-hide" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '30px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '8px' }}>Generating PDF Report</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>{selectedChild.name}'s developmental diagnostics</p>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '100%', width: `${pdfProgress}%`, background: 'linear-gradient(90deg, var(--primary) 0%, #a855f7 100%)', borderRadius: '4px', transition: 'width 0.2s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}><span>{pdfPhase}</span><span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{pdfProgress}%</span></div>
          </div>
        </div>
      )}

      {/* "?"? Assessment History (real Firestore data) "?"? */}
      <AssessmentHistorySection
        selectedChild={selectedChild}
        milestoneAssessments={milestoneAssessments}
        maLoading={maLoading}
        setMilestoneAssessments={setMilestoneAssessments}
      />

      {/* "?"? Original sections: fully preserved "?"? */}
      <div className="dashboard-grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ marginBottom: '13px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} />Domain-wise Progress History
            </h3>
            <DomainWiseTable milestoneAssessments={milestoneAssessments} />
          </div>

          <div className="glass-card" style={{ marginBottom: '24px' }}>
            {/* Header */}
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} />Child vs Age-Group Comparison
            </h3>

            {/* Legend row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#5A5A5A', fontWeight: '600' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10B981', display: 'inline-block' }} />Above Average</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#5A5A5A', fontWeight: '600' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#F4A300', display: 'inline-block' }} />On Track</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#5A5A5A', fontWeight: '600' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#EF4444', display: 'inline-block' }} />Needs Support</span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9F5EE', fontSize: '0.78rem', fontWeight: '700', color: '#1A1A1A' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #F0E8DA' }}>📚 Domain</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #F0E8DA' }}>👶 Your Child Average</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #F0E8DA' }}>👥 Age-Group Average</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #F0E8DA' }}>📊 Gap</th>
                    <th style={{ width: '150px', padding: '12px 16px', borderBottom: '1px solid #F0E8DA' }}></th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #F0E8DA' }}>🎯 Status</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #F0E8DA' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((row, index) => {
                    const diff = (realChildAverages[row.domain] ?? 0) - row.AgeGroupAverage;
                    const status = diff >= 5 ? 'above' : diff >= -10 ? 'ontrack' : 'needs';
                    const rowBg = index % 2 === 0 ? '#FFFFFF' : '#FFF8EC';
                    
                    const visual = getDomainVisualInfo(row.domain);
                    const noteText = getDomainNote(row.domain, status);
                    const childScoreColor = (realChildAverages[row.domain] ?? 0) >= 80 ? '#059669' : (realChildAverages[row.domain] ?? 0) >= 60 ? '#6366F1' : '#D97706';

                    const diffColor = diff > 0 ? '#059669' : diff < 0 ? '#DC2626' : '#8A8A8A';
                    const diffText = diff > 0 ? `+${diff}%` : `${diff}%`;

                    const statusStyles: Record<'above' | 'ontrack' | 'needs', { bg: string; color: string; label: string }> = {
                      above: { bg: 'rgba(16,185,129,0.12)', color: '#059669', label: 'Above Average' },
                      ontrack: { bg: 'rgba(244,163,0,0.12)', color: '#D97706', label: 'On Track' },
                      needs: { bg: 'rgba(220,38,38,0.1)', color: '#DC2626', label: 'Needs Support' }
                    };
                    const statusConfig = statusStyles[status];

                    return (
                      <tr key={row.domain} style={{ backgroundColor: rowBg, borderBottom: '1px solid #F0E8DA' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: visual.bg,
                              flexShrink: 0,
                            }}>
                              {visual.content}
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1A1A1A' }}>
                              {row.domain}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '900', fontSize: '0.85rem', color: childScoreColor }}>
                          {realChildAverages[row.domain] ?? 0}%
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'center', color: '#5A5A5A', fontWeight: '700', fontSize: '0.85rem' }}>
                          {row.AgeGroupAverage}%
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '800', fontSize: '0.85rem', color: diffColor }}>
                          {diffText}
                        </td>

                        <td style={{ width: '150px', padding: '14px 16px' }}>
                          <div style={{ width: '120px', height: '8px', background: '#E5E7EB', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              borderRadius: '4px',
                              width: `${Math.min(realChildAverages[row.domain] ?? 0, 100)}%`,
                              background: status === 'above' ? '#10B981' : status === 'ontrack' ? '#F4A300' : '#EF4444'
                            }} />
                            <div style={{
                              position: 'absolute',
                              left: `${row.AgeGroupAverage}%`,
                              top: '-2px',
                              width: '2px',
                              height: '12px',
                              background: '#9CA3AF',
                              borderRadius: '1px'
                            }} />
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color
                          }}>
                            {statusConfig.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#8A8A8A', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                          {noteText}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>


          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <DevelopmentalLearningCurves milestoneAssessments={milestoneAssessments} loading={maLoading} />

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Compass size={20} color="var(--primary)" />Developmental Milestones Tracker</h3>
              <span className="role-badge role-child">Active: {selectedChild.name} (Age {selectedChild.age})</span>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', gap: '4px', marginBottom: '16px' }} className="print-hide">
              {(['1-3', '4-6', '7-10'] as const).map(grp => {
                const isActive = milestoneAgeGroup === grp;
                const matchesChild = (grp === '1-3' && (selectedChild.age ?? 0) <= 3) || (grp === '4-6' && (selectedChild.age ?? 0) > 3 && (selectedChild.age ?? 0) <= 6) || (grp === '7-10' && (selectedChild.age ?? 0) > 6);
                return <button key={grp} onClick={() => setMilestoneAgeGroup(grp)} style={{ flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', background: isActive ? 'var(--primary)' : 'transparent', color: isActive ? 'white' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s ease' }}>Ages {grp}{matchesChild && <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px' }}>Child</span>}</button>;
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeMilestones.map((m, idx) => {
                const achieved = (domainAverages[m.domain] || 0) >= 75;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '12px', paddingBottom: '12px', borderBottom: idx < activeMilestones.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ fontSize: '1rem', color: achieved ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: 'bold', marginTop: '2px' }}>{achieved ? 'o"' : '-<'}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: achieved ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{m.milestone}</span>
                        <span className="role-badge" style={{ fontSize: '0.55rem', background: 'rgba(255,255,255,0.04)', borderColor: 'transparent', padding: '1px 5px' }}>{m.domain}</span>
                        {achieved && <span className="role-badge" style={{ fontSize: '0.55rem', background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', padding: '1px 5px', borderColor: 'transparent' }}>NEP Cleared</span>}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>{m.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={20} color="#818cf8" />AI Cognitive Diagnosis Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {aiPatternsSummary.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '10px', background: p.status === 'danger' ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.01)', borderColor: p.status === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '8px', padding: '10px 12px' }}>
                  <Info size={16} color={p.status === 'danger' ? 'var(--color-danger)' : '#818cf8'} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
