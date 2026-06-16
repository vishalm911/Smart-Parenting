import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, Sparkles, History } from 'lucide-react';
import { getAssessments, getAiAnalysis, getRecommendations } from '../../services/firebaseSimulator';
import type { Child, Assessment, AIAnalysis, Recommendation } from '../../services/firebaseSimulator';

interface LearningMapProps { selectedChild: Child; }
interface MapZone { id: string; name: string; domain: 'Literacy' | 'Numeracy' | 'Cognitive' | 'Creativity' | 'Emotional'; emoji: string; color: string; x: number; y: number; description: string; }

const MAP_ZONES: MapZone[] = [
  { id: 'zone_lit', name: 'Literacy Land', domain: 'Literacy', emoji: '📚', color: 'var(--color-literacy)', x: 15, y: 70, description: 'Phonics, reading fluency, and vocabulary builders.' },
  { id: 'zone_num', name: 'Numeracy Numbers', domain: 'Numeracy', emoji: '🔢', color: 'var(--color-numeracy)', x: 35, y: 35, description: 'Basic counting, simple math operations, and shape puzzles.' },
  { id: 'zone_cog', name: 'Cognitive Castle', domain: 'Cognitive', emoji: '🏰', color: 'var(--color-cognitive)', x: 55, y: 65, description: 'Logic games, spatial orientation, and memory matchers.' },
  { id: 'zone_cre', name: 'Creative Cove', domain: 'Creativity', emoji: '🎨', color: 'var(--color-creativity)', x: 70, y: 25, description: 'Freeform art painting, music sandboxes, and shape compositions.' },
  { id: 'zone_emo', name: 'Emotional Oasis', domain: 'Emotional', emoji: '🌴', color: 'var(--color-emotional)', x: 88, y: 60, description: 'Identifying feelings, cooperative social logic, and sharing stories.' }
];

export const LearningMap: React.FC<LearningMapProps> = ({ selectedChild }) => {
  const childId = selectedChild.id;
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis>({ child_id: childId, reading_difficulty: false, numeracy_gap: false, learning_delay_flag: false, strength_areas: [], last_updated: '' });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAssessments(childId), getAiAnalysis(childId), getRecommendations(childId)]).then(([a, an, r]) => {
      setAssessments(a); setAnalysis(an); setRecommendations(r); setLoading(false);
    });
  }, [childId]);

  const zoneStats = useMemo(() => {
    const stats: Record<string, { completion: number; isStrength: boolean; isGap: boolean; count: number }> = {};
    MAP_ZONES.forEach(z => {
      const list = assessments.filter(a => a.domain === z.domain);
      const completion = list.length > 0 ? Math.round(list.reduce((acc, curr) => acc + curr.score, 0) / list.length) : 0;
      stats[z.domain] = { completion, isStrength: analysis.strength_areas.includes(z.domain), isGap: (z.domain === 'Literacy' && analysis.reading_difficulty) || (z.domain === 'Numeracy' && analysis.numeracy_gap), count: list.length };
    });
    return stats;
  }, [assessments, analysis]);

  const nextRecommended = useMemo(() => {
    const active = recommendations.filter(r => !r.completed);
    if (active.length > 0) { const high = active.filter(r => r.priority === 'High'); return high.length > 0 ? high[0] : active[0]; }
    return null;
  }, [recommendations]);

  const zoneHistory = useMemo(() => {
    if (!selectedZone) return [];
    return assessments.filter(a => a.domain === selectedZone.domain).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [assessments, selectedZone]);

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>⏳ Loading map...</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>🚀 Journey Learning Map</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Trace your learning path, {selectedChild.name}! Complete activities to light up the zones. Glowing green indicates strength zones, and amber flags show topics that need a bit more practice.</p>
      </div>

      {nextRecommended && (
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.15) 100%)', borderColor: 'rgba(99,102,241,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--primary)', borderRadius: '12px', padding: '10px', boxShadow: '0 0 15px rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles color="white" size={24} /></div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', fontWeight: '700' }}>Next Recommended Activity</span>
              <h4 style={{ fontSize: '1.15rem', color: 'white', marginTop: '2px' }}>{nextRecommended.activity_name} ({nextRecommended.domain})</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{nextRecommended.reason}</p>
            </div>
          </div>
          <button className="btn" onClick={() => { const z = MAP_ZONES.find(z => z.domain === nextRecommended.domain); if (z) setSelectedZone(z); }}>Play Now <ArrowRight size={16} /></button>
        </div>
      )}

      <div className="dashboard-grid-2">
        <div className="learning-map-container" style={{ minHeight: '520px' }}>
          <svg className="map-svg-background" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 15 70 Q 25 50 35 35 T 55 65 T 70 25 T 88 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="6,6" />
            <path d="M 15 70 Q 25 50 35 35 T 55 65 T 70 25 T 88 60" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.4" />
          </svg>
          {MAP_ZONES.map(z => {
            const s = zoneStats[z.domain];
            const borderClass = s.isStrength ? 'node-strength' : s.isGap ? 'node-gap' : '';
            const isNext = nextRecommended && nextRecommended.domain === z.domain;
            return (
              <div key={z.id} className="map-node" style={{ left: `${z.x}%`, top: `${z.y}%` }} onClick={() => setSelectedZone(z)}>
                {isNext && <div style={{ position: 'absolute', width: '84px', height: '84px', borderRadius: '50%', border: '2px solid var(--primary)', animation: 'pulseStar 1.5s infinite ease-in-out', opacity: 0.6 }} />}
                <div className={`node-circle ${borderClass}`} style={{ borderColor: borderClass ? undefined : z.color, color: borderClass ? undefined : z.color, background: selectedZone?.id === z.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)' }}>{z.emoji}</div>
                <div className="node-label">{z.name}<div className="node-percent" style={{ color: z.color }}>{s.completion}% Complete</div></div>
              </div>
            );
          })}
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedZone ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2.2rem' }}>{selectedZone.emoji}</span>
                  <div><h3 style={{ fontSize: '1.3rem' }}>{selectedZone.name}</h3><span style={{ fontSize: '0.8rem', color: selectedZone.color, fontWeight: '600' }}>{selectedZone.domain} Domain</span></div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{selectedZone.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span className="role-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>{zoneStats[selectedZone.domain].count} played</span>
                {zoneStats[selectedZone.domain].isStrength && <span className="role-badge role-child" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', borderColor: 'rgba(16,185,129,0.3)' }}>✓ Strength Zone</span>}
                {zoneStats[selectedZone.domain].isGap && <span className="role-badge" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)', borderColor: 'rgba(245,158,11,0.3)' }}>⚠ Review Recommended</span>}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}><History size={16} />Activity Log</h4>
                {zoneHistory.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {zoneHistory.map((h, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{h.activity_name}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{h.date}</div></div>
                        <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.85rem', fontWeight: '700', color: h.score >= 80 ? 'var(--color-success)' : h.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)' }}>{h.score} pts</span><div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{h.accuracy}% acc</div></div>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>No sessions logged in this zone yet.</div>}
              </div>
              {recommendations.filter(r => r.domain === selectedZone.domain && !r.completed).length > 0 && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', padding: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px 0' }}><Sparkles size={14} />Recommended for this Zone</h4>
                  {recommendations.filter(r => r.domain === selectedZone.domain && !r.completed).map((r, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '4px' }}>• <strong>{r.activity_name}</strong>: {r.reason}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗺️</div>
              <h3>Explore a Zone</h3>
              <p style={{ maxWidth: '280px', marginTop: '6px', fontSize: '0.85rem' }}>Tap on any learning zone on the map to see activity scores, diagnostic logs, and custom training goals!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
