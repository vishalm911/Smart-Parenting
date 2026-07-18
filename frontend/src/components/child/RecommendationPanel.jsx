/**
 * RecommendationPanel.jsx
 *
 * Self-contained AI activity recommendation panel for the child Home dashboard.
 *
 * Behaviour:
 *  - Reads the child's latest milestone_assessments document via recommendationService.
 *  - Computes which domains need most support from domainScores.
 *  - Renders 4 curated activity cards ordered weakest-domain-first.
 *  - Shows domain strength chips across the top for parent awareness.
 *  - Renders nothing if no assessment has been completed yet.
 *  - Shows shimmer skeleton while loading.
 *
 * Props: { childId: string }  — the database child profile ID
 *
 * No auth, no routing, no context writes. Pure read + display.
 */
import { useState, useEffect } from 'react';
import { getChildRecommendations } from '../../api/recommendationService';
import { DOMAIN_META, rankDomainsByNeed } from '../../data/activityRecommendations';
import './RecommendationPanel.css';

/* ── Colour helpers ─────────────────────────────────────────── */
const DIFFICULTY_EMOJI = { Easy: '⭐', Medium: '⭐⭐', Hard: '⭐⭐⭐' };

function percentageColor(pct) {
  if (pct >= 75) return '#10B981'; // strong  → green
  if (pct >= 50) return '#F59E0B'; // growing → amber
  return '#EF4444';                // needs support → red
}

/* ── Skeleton loader ────────────────────────────────────────── */
function SkeletonCards() {
  return (
    <div className="rec-panel-skeleton">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rec-skeleton-card" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  );
}

/* ── Single activity card ───────────────────────────────────── */
function ActivityRecommendationCard({ activity, index }) {
  const { domainMeta, domainPercentage } = activity;
  const accentColor  = domainMeta?.color   ?? '#7C3AED';
  const accentBg     = domainMeta?.bgColor ?? 'rgba(124,58,237,0.10)';
  const pctColor     = percentageColor(domainPercentage);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rec-card"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => setExpanded((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      aria-expanded={expanded}
    >
      {/* Coloured top stripe */}
      <div
        className="rec-card-stripe"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }}
      />

      <div className="rec-card-body">
        {/* Header: icon + title + domain tag */}
        <div className="rec-card-header">
          <div
            className="rec-card-icon-wrap"
            style={{ background: accentBg }}
          >
            {activity.emoji}
          </div>
          <div className="rec-card-title-block">
            <h4 className="rec-card-title">{activity.title}</h4>
            <span
              className="rec-card-domain-tag"
              style={{
                background: accentBg,
                color: accentColor,
                borderColor: `${accentColor}30`,
              }}
            >
              {domainMeta?.emoji} {activity.domain}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="rec-card-description">{activity.description}</p>

        {/* Meta: duration / difficulty / coins */}
        <div className="rec-card-meta">
          {activity.duration && (
            <span className="rec-meta-pill">⏱️ {activity.duration}</span>
          )}
          {activity.difficulty && (
            <span className="rec-meta-pill">
              {DIFFICULTY_EMOJI[activity.difficulty] ?? '⭐'} {activity.difficulty}
            </span>
          )}
          {activity.coins > 0 && (
            <span className="rec-meta-pill rec-meta-coins">
              🪙 +{activity.coins}
            </span>
          )}
        </div>

        {/* Tips — shown when card is expanded */}
        {expanded && activity.tips?.length > 0 && (
          <div className="rec-card-tips">
            <span className="rec-card-tips-label">💡 Parent Tips</span>
            {activity.tips.map((tip, i) => (
              <div key={i} className="rec-tip-item">
                <span className="rec-tip-bullet">•</span>
                <span className="rec-tip-text">{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: domain score bar */}
      <div className="rec-card-footer">
        <div className="rec-card-progress-label">
          <span className="rec-card-progress-text">Domain Score</span>
          <span className="rec-card-progress-pct" style={{ color: pctColor }}>
            {domainPercentage}%
          </span>
        </div>
        <div className="rec-card-progress-bar">
          <div
            className="rec-card-progress-fill"
            style={{
              width: `${domainPercentage}%`,
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Domain strength chips ──────────────────────────────────── */
function DomainStrip({ domainScores }) {
  const ranked = rankDomainsByNeed(domainScores);
  return (
    <div className="rec-domain-strip">
      {ranked.map(({ domain, percentage }) => {
        const meta  = DOMAIN_META[domain];
        return (
          <span
            key={domain}
            className="rec-domain-chip"
            style={{
              background: meta?.bgColor ?? 'rgba(248,250,252,0.9)',
              color: meta?.color       ?? '#334155',
              borderColor: `${meta?.color ?? '#94A3B8'}30`,
            }}
            title={`${domain}: ${percentage}%`}
          >
            {meta?.emoji ?? '📊'} {domain.split(' ')[0]}
            <span className="rec-domain-chip-pct">{percentage}%</span>
          </span>
        );
      })}
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────── */
export default function RecommendationPanel({ childId }) {
  const [state, setState] = useState({ loading: true, data: null });

  useEffect(() => {
    if (!childId) {
      const timer = setTimeout(() => {
        setState(prev => (prev.loading || prev.data) ? { loading: false, data: null } : prev);
      }, 0);
      return () => clearTimeout(timer);
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setState({ loading: true, data: null });
    }, 0);

    getChildRecommendations(childId).then((result) => {
      if (!cancelled) setState({ loading: false, data: result });
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [childId]);

  // While loading — show shimmer
  if (state.loading) {
    return (
      <div className="rec-panel">
        <div className="rec-panel-header">
          <div className="rec-panel-title-group">
            <h3 className="rec-panel-title">✨ Recommended Activities</h3>
            <p className="rec-panel-subtitle">Loading personalised activities…</p>
          </div>
        </div>
        <SkeletonCards />
      </div>
    );
  }

  // No assessment yet — render nothing (panel is invisible until assessment is done)
  if (!state.data) return null;

  const { recommendations, domainScores, assessmentData } = state.data;
  const level = assessmentData?.milestone_level;
  const total = assessmentData?.totalScore;

  return (
    <div className="rec-panel">
      {/* Header */}
      <div className="rec-panel-header">
        <div className="rec-panel-title-group">
          <h3 className="rec-panel-title">
            ✨ Recommended Activities
          </h3>
          <p className="rec-panel-subtitle">
            Personalised for Milestone Level {level}
            {total != null && ` · Last score: ${total}%`}
          </p>
        </div>
        <span className="rec-panel-badge">
          🤖 AI Personalised
        </span>
      </div>

      {/* Domain strength chips */}
      <DomainStrip domainScores={domainScores} />

      {/* Activity cards — weakest domain first */}
      <div className="rec-card-grid">
        {recommendations.map((activity, i) => (
          <ActivityRecommendationCard
            key={activity.id}
            activity={activity}
            index={i}
          />
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="rec-panel-empty">
          <span className="rec-panel-empty-icon">🔍</span>
          <p className="rec-panel-empty-text">
            No activities found for this milestone level yet.
          </p>
        </div>
      )}
    </div>
  );
}
