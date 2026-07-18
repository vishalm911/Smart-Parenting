import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Info, Calendar } from 'lucide-react';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface DomainScore {
  earned: number;
  maxPossible: number;
  percentage: number;
}

interface MilestoneResponse {
  questionId: string;
  selectedAnswer: string;
  score: number;
}

export interface MilestoneAssessment {
  id: string;
  childId: string;
  milestone_level: number;
  totalScore: number;
  maxPossible: number;
  domainScores: Record<string, DomainScore>;
  responses: MilestoneResponse[];
  completedAt: any;
}

interface ChartPoint {
  date: string;
  completedAtRaw: number;
  'Physical Development': number;
  'Cognitive Development': number;
  'Emotional Development': number;
  'Social Development': number;
  'Aesthetic Development': number;
  overallScore: number;
  milestoneLevel: number;
}

interface ProgressSummaryItem {
  domain: string;
  diff: number;
  trend: 'improved' | 'declined' | 'no-change';
}

interface DevelopmentalLearningCurvesProps {
  milestoneAssessments: MilestoneAssessment[];
  loading: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_COLORS = {
  'Physical Development': '#3B82F6',   // Blue
  'Cognitive Development': '#F97316',   // Orange
  'Emotional Development': '#8B5CF6',  // Purple
  'Social Development': '#10B981', // Green
  'Aesthetic Development': '#EF4444',  // Red
};

// ─── Named Helper Functions ───────────────────────────────────────────────────

/**
 * Converts completedAt timestamp to "D MMM YYYY" format (e.g. 15 Feb 2025).
 */
export function formatCompletedAt(ts: any): string {
  if (!ts) return '—';
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '—';
  }
}

/**
 * Parses and returns the timestamp as a unix milliseconds number.
 */
export function getCompletedAtTime(ts: any): number {
  if (!ts) return 0;
  if (ts.toDate) {
    return ts.toDate().getTime();
  }
  if (ts.seconds !== undefined) {
    return ts.seconds * 1000;
  }
  return new Date(ts).getTime();
}

/**
 * Derives overall score with compatibility fallbacks.
 */
function effectiveScore(a: MilestoneAssessment): number {
  if (a.totalScore > 0) return a.totalScore;
  if (a.responses?.length > 0) {
    const earned = a.responses.reduce((s, r) => s + (r.score ?? 0), 0);
    const max = a.responses.length * 2;
    return max > 0 ? Math.round((earned / max) * 100) : 0;
  }
  if (a.domainScores) {
    const vals = Object.values(a.domainScores);
    if (vals.length > 0) {
      const totalEarned = vals.reduce((s, d) => s + d.earned, 0);
      const totalMax = vals.reduce((s, d) => s + d.maxPossible, 0);
      return totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    }
  }
  return 0;
}

/**
 * Shapes raw database documents into Recharts line chart data points.
 */
export function shapeChartData(assessments: MilestoneAssessment[]): ChartPoint[] {
  const sorted = [...assessments].sort((a, b) => {
    const ta = getCompletedAtTime(a.completedAt);
    const tb = getCompletedAtTime(b.completedAt);
    return ta - tb; // chronological ascending
  });

  return sorted.map(a => ({
    date: formatCompletedAt(a.completedAt),
    completedAtRaw: getCompletedAtTime(a.completedAt),
    'Physical Development': a.domainScores?.['Physical Development']?.percentage ?? 0,
    'Cognitive Development': a.domainScores?.['Cognitive Development']?.percentage ?? 0,
    'Emotional Development': a.domainScores?.['Emotional Development']?.percentage ?? 0,
    'Social Development': a.domainScores?.['Social Development']?.percentage ?? 0,
    'Aesthetic Development': a.domainScores?.['Aesthetic Development']?.percentage ?? 0,
    overallScore: effectiveScore(a),
    milestoneLevel: a.milestone_level ?? 0,
  }));
}

/**
 * Computes Latest Assessment % - First Assessment % for each domain.
 */
export function calculateProgressSummary(assessments: MilestoneAssessment[]): ProgressSummaryItem[] {
  if (assessments.length < 2) return [];

  const sorted = [...assessments].sort((a, b) => {
    const ta = getCompletedAtTime(a.completedAt);
    const tb = getCompletedAtTime(b.completedAt);
    return ta - tb;
  });

  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  const domains = [
    'Physical Development',
    'Cognitive Development',
    'Emotional Development',
    'Social Development',
    'Aesthetic Development'
  ];

  return domains.map(domain => {
    const firstVal = first.domainScores?.[domain]?.percentage ?? 0;
    const latestVal = latest.domainScores?.[domain]?.percentage ?? 0;
    const diff = latestVal - firstVal;
    let trend: ProgressSummaryItem['trend'] = 'no-change';
    if (diff > 0) trend = 'improved';
    else if (diff < 0) trend = 'declined';

    return { domain, diff, trend };
  });
}

// ─── Customized Components ───────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        border: '1.5px solid var(--color-border)',
        borderRadius: '12px',
        padding: '12px 14px',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--color-text)',
        fontSize: '0.8rem',
      }}>
        <div style={{ fontWeight: 800, marginBottom: '6px', color: 'var(--color-text)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color="var(--color-primary)" />
          {data.date}
        </div>
        <div style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: '6px', marginBottom: '6px' }}>
          <span style={{ fontWeight: 700 }}>Overall Score: </span>
          <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{data.overallScore}%</span>
          {data.milestoneLevel > 0 && (
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px', fontWeight: 600 }}>
              Milestone Level: {data.milestoneLevel}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: DOMAIN_COLORS['Physical Development'], fontWeight: 700 }}>💪 Physical Development:</span>
            <span style={{ fontWeight: 800 }}>{data['Physical Development']}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: DOMAIN_COLORS['Cognitive Development'], fontWeight: 700 }}>🧠 Cognitive Development:</span>
            <span style={{ fontWeight: 800 }}>{data['Cognitive Development']}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: DOMAIN_COLORS['Emotional Development'], fontWeight: 700 }}>😊 Emotional Development:</span>
            <span style={{ fontWeight: 800 }}>{data['Emotional Development']}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: DOMAIN_COLORS['Social Development'], fontWeight: 700 }}>🤝 Social Development:</span>
            <span style={{ fontWeight: 800 }}>{data['Social Development']}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: DOMAIN_COLORS['Aesthetic Development'], fontWeight: 700 }}>🎨 Aesthetic Development:</span>
            <span style={{ fontWeight: 800 }}>{data['Aesthetic Development']}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = (props: any): React.ReactElement => {
  const { x, y, value } = props;
  if (value === undefined || value === null) return <text />;
  return (
    <text
      x={x}
      y={y - 8}
      fill="var(--color-text-secondary)"
      fontSize={9}
      fontWeight={800}
      textAnchor="middle"
    >
      {value}%
    </text>
  );
};

// ─── Component Export ────────────────────────────────────────────────────────

export const DevelopmentalLearningCurves: React.FC<DevelopmentalLearningCurvesProps> = ({
  milestoneAssessments,
  loading,
}) => {
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Transformed Chart Data
  const chartData = useMemo(() => shapeChartData(milestoneAssessments), [milestoneAssessments]);

  // Filtered Chart Data based on Date Range
  const filteredData = useMemo(() => {
    if (dateFilter === 'all') return chartData;
    const now = Date.now();
    let cutoff = 0;
    if (dateFilter === '30days') cutoff = now - 30 * 24 * 60 * 60 * 1000;
    else if (dateFilter === '3months') cutoff = now - 90 * 24 * 60 * 60 * 1000;
    else if (dateFilter === '6months') cutoff = now - 180 * 24 * 60 * 60 * 1000;
    return chartData.filter(d => d.completedAtRaw >= cutoff);
  }, [chartData, dateFilter]);

  // Progress Summary comparison (Latest vs First)
  const progressSummary = useMemo(() => calculateProgressSummary(milestoneAssessments), [milestoneAssessments]);

  // Loading state handling
  if (loading) {
    return (
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px', padding: '32px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--color-primary)' }}>...</div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Loading learning curves...</p>
        </div>
      </div>
    );
  }

  // Edge case: Zero assessments
  if (milestoneAssessments.length === 0) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', padding: '40px', textAlign: 'center' }}>
        <Info size={40} color="var(--color-text-muted)" style={{ marginBottom: '12px' }} />
        <h3 style={{ marginBottom: '8px', fontSize: '1.2rem', color: 'var(--color-text)' }}>Developmental Learning Curves</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>No assessment history available.</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header and Filter Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>Developmental Learning Curves</h3>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="select-field"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-bg-card)',
            color: 'var(--color-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All Time</option>
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
        </select>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: 260, position: 'relative', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.04)" />
            <XAxis
              dataKey="date"
              stroke="var(--color-text-secondary)"
              style={{ fontSize: '0.75rem', fontWeight: 600 }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="var(--color-text-secondary)"
              style={{ fontSize: '0.75rem', fontWeight: 600 }}
              tickLine={false}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0, 0, 0, 0.05)', strokeWidth: 1 }} />
            
            <Line
              name="Physical Development"
              type="monotone"
              dataKey="Physical Development"
              stroke={DOMAIN_COLORS['Physical Development']}
              strokeWidth={3}
              activeDot={{ r: 6 }}
              dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
              label={renderCustomizedLabel}
            />
            <Line
              name="Cognitive Development"
              type="monotone"
              dataKey="Cognitive Development"
              stroke={DOMAIN_COLORS['Cognitive Development']}
              strokeWidth={3}
              activeDot={{ r: 6 }}
              dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
              label={renderCustomizedLabel}
            />
            <Line
              name="Emotional Development"
              type="monotone"
              dataKey="Emotional Development"
              stroke={DOMAIN_COLORS['Emotional Development']}
              strokeWidth={3}
              activeDot={{ r: 6 }}
              dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
              label={renderCustomizedLabel}
            />
            <Line
              name="Social Development"
              type="monotone"
              dataKey="Social Development"
              stroke={DOMAIN_COLORS['Social Development']}
              strokeWidth={3}
              activeDot={{ r: 6 }}
              dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
              label={renderCustomizedLabel}
            />
            <Line
              name="Aesthetic Development"
              type="monotone"
              dataKey="Aesthetic Development"
              stroke={DOMAIN_COLORS['Aesthetic Development']}
              strokeWidth={3}
              activeDot={{ r: 6 }}
              dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
              label={renderCustomizedLabel}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two-Tier Custom Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
        {/* Top Tier: Series Identification */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)' }} />
            Child's Assessment Scores
          </div>
        </div>
        {/* Bottom Tier: Domain Identifiers */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
          {Object.entries(DOMAIN_COLORS).map(([domain, color]) => (
            <div key={domain} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: color }} />
              {domain}
            </div>
          ))}
        </div>
      </div>

      {/* Edge Case: Exactly one assessment */}
      {milestoneAssessments.length === 1 && (
        <div style={{
          marginTop: '12px',
          fontSize: '0.8rem',
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
          background: 'rgba(244, 163, 0, 0.05)',
          border: '1.5px solid rgba(244, 163, 0, 0.15)',
          borderRadius: '10px',
          padding: '10px 14px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <Info size={16} color="var(--color-primary)" />
          Complete more assessments to visualize developmental progress.
        </div>
      )}

      {/* Progress Summary Bar */}
      {progressSummary.length > 0 && (
        <>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 16px',
            background: 'var(--color-bg-elevated)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '12px',
            marginTop: '12px',
          }}>
            {/* Domains progress list */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
              {progressSummary.map(item => {
                const isPositive = item.diff > 0;
                const isNegative = item.diff < 0;
                const color = isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-error)' : 'var(--color-text-muted)';
                const symbol = isPositive ? '↑' : isNegative ? '↓' : '—';
                const formattedDiff = isPositive ? `+${item.diff}` : `${item.diff}`;
                return (
                  <div key={item.domain} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--color-text)' }}>{item.domain}</span>
                    <span style={{ color, display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 800 }}>
                      {formattedDiff}% {symbol}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress Summary Legend */}
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              <span style={{ color: 'var(--color-success)' }}>↑</span> Improved · <span style={{ color: 'var(--color-error)' }}>↓</span> Declined · <span style={{ color: 'var(--color-text-muted)' }}>—</span> No Change
            </div>
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '0.78rem',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            marginTop: '1px',
            marginBottom: '0',
          }}>
            <strong style={{ color: '#1A1A1A' }}>📘 Parent Guide:</strong> Progress reflects the Latest Assessment vs. the First Assessment for each domain, showing how far your child has come since they started.
          </div>
        </>
      )}

    </div>
  );
};
