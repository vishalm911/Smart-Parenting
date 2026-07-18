import React, { useMemo, useState, useEffect } from 'react';
import { LineChart as ChartIcon, Clock, Sparkles, AlertTriangle, Award, Download, CheckCircle, Smile, Compass } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import { getAssessments, getAiAnalysis, getRecommendations, updateRecommendationStatus, calculateSchoolReadinessScore, checkPredictiveInactivity, getMilestonesByAge } from '../../services/analyticsService';
import type { Child, Assessment, AIAnalysis, Recommendation } from '../../services/analyticsService';

interface ParentDashboardProps { selectedChild: Child; onRefresh: () => void; }

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ selectedChild, onRefresh }) => {
  const childId = selectedChild._id || selectedChild.id;
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis>({ child_id: childId, reading_difficulty: false, numeracy_gap: false, learning_delay_flag: false, strength_areas: [], last_updated: '' });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [readinessScore, setReadinessScore] = useState(0);
  const [inactivityStatus, setInactivityStatus] = useState({ inactive: false, daysInactive: 0 });
  const [loading, setLoading] = useState(true);
  const milestones = useMemo(() => getMilestonesByAge(selectedChild.age), [selectedChild.age]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAssessments(childId),
      getAiAnalysis(childId),
      getRecommendations(childId),
      calculateSchoolReadinessScore(childId),
      checkPredictiveInactivity(childId)
    ]).then(([a, an, r, rs, inact]) => {
      setAssessments(a); setAnalysis(an); setRecommendations(r);
      setReadinessScore(rs); setInactivityStatus(inact); setLoading(false);
    });
  }, [childId]);

  const chartData = useMemo(() => {
    return ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'].map(d => {
      const list = assessments.filter(a => a.domain === d);
      return { subject: d, Score: list.length > 0 ? Math.round(list.reduce((acc, curr) => acc + curr.score, 0) / list.length) : 0, Minutes: list.length > 0 ? Math.round(list.reduce((acc, curr) => acc + curr.time, 0) / 60) : 0, fullMark: 100 };
    });
  }, [assessments]);

  const totalMinutesSpent = useMemo(() => chartData.reduce((acc, curr) => acc + curr.Minutes, 0), [chartData]);

  const handleToggleRec = async (recId: string, currentStatus: boolean) => {
    await updateRecommendationStatus(recId, !currentStatus);
    onRefresh();
  };

  const activeAlerts = useMemo(() => {
    const alerts = [];
    if (analysis.reading_difficulty) alerts.push({ type: 'danger', title: 'Literacy/Phonics Fluency Alert', desc: 'Accuracy dropped below 60% in 3 consecutive Literacy exercises. Focused phonemic awareness instruction recommended.' });
    if (analysis.numeracy_gap) alerts.push({ type: 'danger', title: 'Numeracy Counting Alert', desc: 'Accuracy dropped below 60% in 3 consecutive Numeracy shape/count exercises. Visual block manipulation recommended.' });
    if (inactivityStatus.inactive) alerts.push({ type: 'warning', title: 'Engagement Gap Alert (Predictive)', desc: `No active learning sessions detected in the past ${inactivityStatus.daysInactive} days. We recommend playing at least 5 minutes today.` });
    return alerts;
  }, [analysis, inactivityStatus]);

  const pendingRecs = useMemo(() => recommendations.filter(r => !r.completed), [recommendations]);
  const completedRecs = useMemo(() => recommendations.filter(r => r.completed), [recommendations]);

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>⏳ Loading dashboard...</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ChartIcon size={28} color="var(--primary)" />Parent Analytics Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Diagnostic tracking, milestone mapping, and developmental actions for <strong>{selectedChild.name}</strong>.</p>
        </div>
        <button className="btn print-hide" onClick={() => window.print()}><Download size={18} />Print / PDF Weekly Report</button>
      </div>

      {activeAlerts.map((alert, i) => (
        <div key={i} className={`alert-banner ${alert.type === 'warning' ? 'warning' : ''}`} style={{ borderColor: alert.type === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
          <AlertTriangle size={20} color={alert.type === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div><h4 style={{ color: 'white', fontSize: '0.95rem' }}>{alert.title}</h4><p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', lineHeight: '1.4' }}>{alert.desc}</p></div>
        </div>
      ))}

      <div className="dashboard-grid-3">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99,102,241,0.1)', padding: '14px', borderRadius: '12px', color: 'var(--primary)' }}><Award size={28} /></div>
          <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>School Readiness Score</span><h3 style={{ fontSize: '1.8rem', marginTop: '4px' }}>{readinessScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/100</span></h3></div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(6,182,212,0.1)', padding: '14px', borderRadius: '12px', color: 'var(--color-numeracy)' }}><Clock size={28} /></div>
          <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Spent This Month</span><h3 style={{ fontSize: '1.8rem', marginTop: '4px' }}>{totalMinutesSpent} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>minutes</span></h3></div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '14px', borderRadius: '12px', color: 'var(--color-success)' }}><Smile size={28} /></div>
          <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Strengths</span><h3 style={{ fontSize: '1.1rem', marginTop: '6px', fontWeight: '600' }}>{analysis.strength_areas.length > 0 ? analysis.strength_areas.join(', ') : 'Evaluating...'}</h3></div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Domain Competency Radar</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" /><PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} /><PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" style={{ fontSize: '0.7rem' }} />
                <Radar name={selectedChild.name} dataKey="Score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Time Allocation per Domain</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="subject" stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} /><YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                <ChartTooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                <Bar dataKey="Minutes" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={20} color="#fbbf24" />Suggested Focus Activities</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Generated Recommendations</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {pendingRecs.length > 0 ? pendingRecs.map(rec => (
              <div key={rec.id} style={{ border: '1px solid', borderColor: rec.priority === 'High' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px', background: rec.priority === 'High' ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{rec.activity_name}</strong>
                    <span className="role-badge" style={{ fontSize: '0.65rem', background: rec.priority === 'High' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', color: rec.priority === 'High' ? '#fca5a5' : '#93c5fd', borderColor: rec.priority === 'High' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)' }}>{rec.priority} Priority</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{rec.reason}</p>
                </div>
                <button onClick={() => handleToggleRec(rec.id, rec.completed)} className="btn btn-secondary print-hide" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}>Mark Done</button>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 12px', color: 'var(--color-success)' }} /><h4>All Action Items Cleared!</h4><p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Child is tracking perfectly. Keep maintaining active daily play sessions.</p>
              </div>
            )}
            {completedRecs.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Completed Action Items ({completedRecs.length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {completedRecs.slice(0, 3).map(rec => <span key={rec.id} style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '4px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>✓ {rec.activity_name}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Compass size={20} color="var(--primary)" />NEP 2020 Milestones Mapping</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Developmental milestones mapping against NEP 2020 benchmarks for age group {selectedChild.age <= 3 ? 'Ages 1-3' : selectedChild.age <= 6 ? 'Ages 4-6' : 'Ages 7-10'}.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {milestones.map((m, idx) => {
              const domainScore = assessments.filter(a => a.domain === m.domain);
              const avg = domainScore.length > 0 ? domainScore.reduce((acc, curr) => acc + curr.score, 0) / domainScore.length : 0;
              const achieved = avg >= 75;
              return (
                <div key={idx} style={{ border: '1px solid', borderColor: achieved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', background: achieved ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.01)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{ fontSize: '1.25rem', color: achieved ? 'var(--color-success)' : 'var(--text-muted)', marginTop: '2px' }}>{achieved ? '✓' : '○'}</div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: achieved ? 'white' : 'var(--text-secondary)' }}>{m.milestone}</span>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>{m.domain}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>{m.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
