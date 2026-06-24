import React, { useState, useMemo, useEffect } from 'react';
import { Users, Send, AlertTriangle, Award, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as ChartTooltip, CartesianGrid, Legend } from 'recharts';
import { getChildren, getAssessments, getAiAnalysis, addRecommendation, calculateSchoolReadinessScore, checkPredictiveInactivity } from '../../services/firebaseSimulator';
import type { Child } from '../../services/firebaseSimulator';

interface TeacherDashboardProps { onRefresh: () => void; }

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onRefresh }) => {
  const [assigneeId, setAssigneeId] = useState<string>('all');
  const [activityDomain, setActivityDomain] = useState<'Literacy' | 'Numeracy' | 'Cognitive' | 'Creativity' | 'Emotional'>('Literacy');
  const [activityName, setActivityName] = useState<string>('Sight Words Collector');
  const [assignmentReason, setAssignmentReason] = useState<string>('Practice sight words to improve letter fluency.');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [children, setChildren] = useState<Child[]>([]);
  const [studentsSummary, setStudentsSummary] = useState<any[]>([]);
  const [classAnalytics, setClassAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const kids = await getChildren();
      setChildren(kids);

      const summaries = await Promise.all(kids.map(async student => {
        const [assessments, analysis, readiness, inactivity] = await Promise.all([
          getAssessments(student.id), getAiAnalysis(student.id),
          calculateSchoolReadinessScore(student.id), checkPredictiveInactivity(student.id)
        ]);
        const flags: string[] = [];
        if (analysis.reading_difficulty) flags.push('Reading Gap');
        if (analysis.numeracy_gap) flags.push('Numeracy Gap');
        if (inactivity.inactive) flags.push('Inactive (5d+)');
        return { ...student, readiness, flags, strengths: analysis.strength_areas, sessionCount: assessments.length };
      }));
      setStudentsSummary(summaries);

      const domains: ('Literacy' | 'Numeracy' | 'Cognitive' | 'Creativity' | 'Emotional')[] = ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'];
      const analytics = await Promise.all(domains.map(async d => {
        let sum = 0, count = 0;
        await Promise.all(kids.map(async student => {
          const list = (await getAssessments(student.id)).filter(a => a.domain === d);
          if (list.length > 0) { sum += list.reduce((acc, curr) => acc + curr.score, 0) / list.length; count++; }
        }));
        return { domain: d, ClassAverage: count > 0 ? Math.round(sum / count) : 0, Benchmark: 75 };
      }));
      setClassAnalytics(analytics);
      setLoading(false);
    };
    load();
  }, []);

  const flaggedStudents = useMemo(() => studentsSummary.filter(s => s.flags.length > 0), [studentsSummary]);

  const activitiesByDomain = useMemo(() => {
    const list: Record<string, string[]> = {
      Literacy: ['Letter Tracing Safari', 'Phonics Matching Fun', 'Sight Words Collector', 'Rhyme Builder'],
      Numeracy: ['Count the Apples', 'Geometry Shape Puzzle', 'Pattern Quest', 'Number Line Runner'],
      Cognitive: ['Memory Matching Cards', 'Hidden Object Finder', 'Logic Sorting Puzzle', 'Path Navigator'],
      Creativity: ['Dynamic Mosaic Art', 'Free Paint Sandbox', 'Block Builder Space', 'Musical Chords Sandbox'],
      Emotional: ['Emotion Recognition Cards', 'Sharing & Caring Story', 'Breathing Bubble Coach', 'Social Scenario Choices']
    };
    return list[activityDomain] || [];
  }, [activityDomain]);

  useEffect(() => { if (activitiesByDomain.length > 0) setActivityName(activitiesByDomain[0]); }, [activitiesByDomain]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName || !assignmentReason) return;
    const targets = assigneeId === 'all' ? children : children.filter(c => c.id === assigneeId);
    await Promise.all(targets.map(student => addRecommendation({
      child_id: student.id, activity_id: `assigned_${Date.now()}`,
      activity_name: activityName, domain: activityDomain,
      reason: `Assigned by Ms. Sarah: ${assignmentReason}`, priority: 'High'
    })));
    setSuccessMsg(assigneeId === 'all' ? `Assigned "${activityName}" to the entire class!` : `Assigned "${activityName}" to ${children.find(c => c.id === assigneeId)?.name}!`);
    setTimeout(() => setSuccessMsg(''), 3500);
    onRefresh();
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Age', 'Grade', 'School Readiness Score', 'Strengths', 'Alert Flags', 'Total Played Sessions'];
    const rows = studentsSummary.map(s => [s.id, s.name, s.age, s.grade, s.readiness, s.strengths.join('; '), s.flags.join('; '), s.sessionCount]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.map((val: any) => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Class_Analytics_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>⏳ Loading class data...</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={28} color="var(--primary)" />Class Analytics Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Teacher administration center for class Kindergarten A (Ms. Sarah). Monitor gaps, assign training modules, and export grades.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}><FileSpreadsheet size={18} />Export CSV Records</button>
      </div>

      <div className="dashboard-grid-3">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><div style={{ background: 'rgba(99,102,241,0.1)', padding: '14px', borderRadius: '12px', color: 'var(--primary)' }}><Users size={28} /></div><div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Active Students</span><h3 style={{ fontSize: '1.8rem', marginTop: '4px' }}>{children.length}</h3></div></div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><div style={{ background: 'rgba(16,185,129,0.1)', padding: '14px', borderRadius: '12px', color: 'var(--color-success)' }}><Award size={28} /></div><div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class Avg Readiness</span><h3 style={{ fontSize: '1.8rem', marginTop: '4px' }}>{children.length > 0 ? Math.round(studentsSummary.reduce((acc, curr) => acc + curr.readiness, 0) / children.length) : 0}%</h3></div></div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><div style={{ background: 'rgba(239,68,68,0.1)', padding: '14px', borderRadius: '12px', color: 'var(--color-danger)' }}><AlertTriangle size={28} /></div><div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students Flagged For Review</span><h3 style={{ fontSize: '1.8rem', marginTop: '4px', color: flaggedStudents.length > 0 ? 'var(--color-warning)' : 'inherit' }}>{flaggedStudents.length}</h3></div></div>
      </div>

      <div className="dashboard-grid-2">
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Class Domain Performance vs Benchmark</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" /><XAxis dataKey="domain" stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} /><YAxis domain={[0, 100]} stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                <ChartTooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                <Legend style={{ fontSize: '0.85rem' }} />
                <Bar name="Class Avg" dataKey="ClassAverage" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar name="NEP Target" dataKey="Benchmark" fill="rgba(255,255,255,0.15)" stroke="var(--text-secondary)" strokeDasharray="4 4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '12px', color: '#fca311', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={22} />Diagnostic Learning Gap Reports</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>AI-flagged students based on consecutive accuracy checks. Urgent remedial intervention recommended.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            {flaggedStudents.length > 0 ? flaggedStudents.map(student => (
              <div key={student.id} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{student.avatar} {student.name}</strong>
                  <div style={{ display: 'flex', gap: '4px' }}>{student.flags.map((f: string, i: number) => <span key={i} className="role-badge" style={{ fontSize: '0.6rem', background: f.includes('Inactive') ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: f.includes('Inactive') ? 'var(--color-warning)' : '#f87171', borderColor: f.includes('Inactive') ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)' }}>{f}</span>)}</div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                  {student.flags.includes('Reading Gap') && 'Reading fluency is below standard average. Flagged after 3 consecutive sessions <60% accuracy on Phonics check.'}
                  {student.flags.includes('Numeracy Gap') && 'Numeracy scores dropped. Flagged after 3 consecutive sessions <60% accuracy on basic shape matching.'}
                  {student.flags.includes('Inactive (5d+)') && 'Child has not logged in for 5 days. Consider alerting parent to resume learning.'}
                </p>
              </div>
            )) : <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No student flags triggered. Class is tracking well!</div>}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Student Performance Roster</h3>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead><tr><th>Student</th><th>Grade</th><th>Age</th><th>Completed Sessions</th><th>Readiness Score</th><th>Strength Areas</th><th>Active Flags</th></tr></thead>
            <tbody>
              {studentsSummary.map(student => (
                <tr key={student.id}>
                  <td style={{ fontWeight: '600' }}><span style={{ marginRight: '6px', fontSize: '1.1rem' }}>{student.avatar}</span>{student.name}</td>
                  <td>{student.grade}</td><td>{student.age} yrs</td><td>{student.sessionCount} plays</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong style={{ color: student.readiness >= 80 ? 'var(--color-success)' : student.readiness >= 65 ? 'var(--color-warning)' : 'var(--color-danger)' }}>{student.readiness}%</strong><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Level {Math.floor(student.readiness / 10) + 1})</span></div></td>
                  <td>{student.strengths.length > 0 ? <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{student.strengths.map((str: string, i: number) => <span key={i} className="role-badge" style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', borderColor: 'rgba(16,185,129,0.2)' }}>{str}</span>)}</div> : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Analyzing...</span>}</td>
                  <td>{student.flags.length > 0 ? <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{student.flags.map((flg: string, i: number) => <span key={i} className="role-badge" style={{ fontSize: '0.6rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>{flg}</span>)}</div> : <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '600' }}>Normal</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Assign Activity Module</h3>
        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assign To:</label><select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="select-field" style={{ padding: '10px' }}><option value="all">Entire Class (All profiles)</option>{children.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>)}</select></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Learning Domain:</label><select value={activityDomain} onChange={e => setActivityDomain(e.target.value as any)} className="select-field" style={{ padding: '10px' }}><option value="Literacy">Literacy</option><option value="Numeracy">Numeracy</option><option value="Cognitive">Cognitive</option><option value="Creativity">Creativity</option><option value="Emotional">Emotional</option></select></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select Game Module:</label><select value={activityName} onChange={e => setActivityName(e.target.value)} className="select-field" style={{ padding: '10px' }}>{activitiesByDomain.map((act, i) => <option key={i} value={act}>{act}</option>)}</select></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Teacher Guidelines / Assignment Notes:</label><input type="text" value={assignmentReason} onChange={e => setAssignmentReason(e.target.value)} className="input-field" placeholder="e.g. Focus on shape symmetry and spatial matchings." required /></div>
          {successMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-success)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} />{successMsg}</div>}
          <div><button type="submit" className="btn"><Send size={16} />Send Assignment Notification</button></div>
        </form>
      </div>
    </div>
  );
};
