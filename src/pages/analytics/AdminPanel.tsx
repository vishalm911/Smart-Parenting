import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Database, Play, Plus, RotateCcw, Search } from 'lucide-react';
import { getChildren, getThresholds, saveThresholds, getAssessments, addAssessment, getAiAnalysis, getRecommendations, getReports, generateWeeklyReport, initializeDatabase } from '../../services/firebaseSimulator';
import type { Child } from '../../services/firebaseSimulator';

interface AdminPanelProps { onRefresh: () => void; }

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRefresh }) => {
  const [activeCollection, setActiveCollection] = useState<'assessments' | 'ai_analysis' | 'recommendations' | 'reports'>('assessments');
  const [inspectChildId, setInspectChildId] = useState<string>('all');
  const [dbSearch, setDbSearch] = useState<string>('');
  const [accuracyCutoff, setAccuracyCutoff] = useState(60);
  const [consecutiveSessions, setConsecutiveSessions] = useState(3);
  const [inactivityDays, setInactivityDays] = useState(5);
  const [thresholdSuccessMsg, setThresholdSuccessMsg] = useState('');
  const [childId, setChildId] = useState('child_2');
  const [domain, setDomain] = useState<'Literacy' | 'Numeracy' | 'Cognitive' | 'Creativity' | 'Emotional'>('Literacy');
  const [activityName, setActivityName] = useState('Phonics Matching Fun');
  const [score, setScore] = useState(50);
  const [accuracy, setAccuracy] = useState(50);
  const [time, setTime] = useState(200);
  const [attempts, setAttempts] = useState(2);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [assessmentSuccessMsg, setAssessmentSuccessMsg] = useState('');
  const [reportChildId, setReportChildId] = useState('child_2');
  const [reportSuccessMsg, setReportSuccessMsg] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [collectionRows, setCollectionRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);

  // Load thresholds and children on mount
  useEffect(() => {
    const init = async () => {
      const [kids, thresholds] = await Promise.all([getChildren(), getThresholds()]);
      setChildren(kids);
      setAccuracyCutoff(thresholds.accuracyCutoff);
      setConsecutiveSessions(thresholds.consecutiveSessions);
      setInactivityDays(thresholds.inactivityDays);
      setLoading(false);
    };
    init();
  }, []);

  // Load collection rows when filters change
  useEffect(() => {
    if (loading) return;
    const fetchRows = async () => {
      setLoadingRows(true);
      let rawData: any[] = [];
      if (activeCollection === 'assessments') {
        rawData = await getAssessments(inspectChildId === 'all' ? undefined : inspectChildId);
        rawData.sort((a, b) => b.date.localeCompare(a.date));
      } else if (activeCollection === 'ai_analysis') {
        const targets = inspectChildId === 'all' ? children : children.filter(c => c.id === inspectChildId);
        rawData = await Promise.all(targets.map(c => getAiAnalysis(c.id)));
      } else if (activeCollection === 'recommendations') {
        const targets = inspectChildId === 'all' ? children : children.filter(c => c.id === inspectChildId);
        rawData = (await Promise.all(targets.map(c => getRecommendations(c.id)))).flat();
      } else if (activeCollection === 'reports') {
        const targets = inspectChildId === 'all' ? children : children.filter(c => c.id === inspectChildId);
        rawData = (await Promise.all(targets.map(c => getReports(c.id)))).flat();
      }
      if (dbSearch.trim()) {
        const q = dbSearch.toLowerCase();
        rawData = rawData.filter(row => JSON.stringify(row).toLowerCase().includes(q));
      }
      setCollectionRows(rawData);
      setLoadingRows(false);
    };
    fetchRows();
  }, [activeCollection, inspectChildId, dbSearch, loading, children]);

  const activitiesByDomain = useMemo(() => {
    const list: Record<string, string[]> = {
      Literacy: ['Letter Tracing Safari', 'Phonics Matching Fun', 'Sight Words Collector', 'Rhyme Builder'],
      Numeracy: ['Count the Apples', 'Geometry Shape Puzzle', 'Pattern Quest', 'Number Line Runner'],
      Cognitive: ['Memory Matching Cards', 'Hidden Object Finder', 'Logic Sorting Puzzle', 'Path Navigator'],
      Creativity: ['Dynamic Mosaic Art', 'Free Paint Sandbox', 'Block Builder Space', 'Musical Chords Sandbox'],
      Emotional: ['Emotion Recognition Cards', 'Sharing & Caring Story', 'Breathing Bubble Coach', 'Social Scenario Choices']
    };
    return list[domain] || [];
  }, [domain]);

  useEffect(() => { if (activitiesByDomain.length > 0) setActivityName(activitiesByDomain[0]); }, [activitiesByDomain]);

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveThresholds({ accuracyCutoff, consecutiveSessions, inactivityDays });
    setThresholdSuccessMsg('AI Cutoffs saved! Flags re-computed for all students.');
    setTimeout(() => setThresholdSuccessMsg(''), 3000);
    onRefresh();
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAssessment({ child_id: childId, domain, activity_id: `${domain.toLowerCase()}_act_${Date.now()}`, activity_name: activityName, score, accuracy, time, attempts, date });
    const childName = children.find(c => c.id === childId)?.name || 'Child';
    setAssessmentSuccessMsg(`Added assessment log for ${childName}! AI engine re-audited.`);
    setTimeout(() => setAssessmentSuccessMsg(''), 3000);
    onRefresh();
  };

  const handleTriggerReport = async () => {
    await generateWeeklyReport(reportChildId);
    const childName = children.find(c => c.id === reportChildId)?.name || 'Child';
    setReportSuccessMsg(`Weekly Report generated for ${childName}! Written to Firestore.`);
    setTimeout(() => setReportSuccessMsg(''), 3000);
    onRefresh();
  };

  const handleResetDb = async () => {
    if (window.confirm('Are you sure you want to reset the database to default pre-populated data? All custom entries will be cleared.')) {
      await initializeDatabase(true);
      onRefresh();
      alert('Firestore database reset successfully!');
      window.location.reload();
    }
  };

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>⏳ Loading admin console...</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={28} color="#f59e0b" />Platform Admin Console</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Adjust rule thresholds, simulate Cloud Functions, trigger assessments, and inspect Firestore collections.</p>
        </div>
        <button className="btn btn-danger" onClick={handleResetDb}><RotateCcw size={16} />Reset Database</button>
      </div>

      <div className="dashboard-grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3>Configure AI Detection Thresholds</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>Modifying these sliders updates the rules evaluated by the AI engine immediately.</p>
            <form onSubmit={handleSaveThresholds} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span>Accuracy cutoff threshold:</span><strong style={{ color: '#fbbf24' }}>{accuracyCutoff}%</strong></div>
                <input type="range" min="40" max="80" value={accuracyCutoff} onChange={e => setAccuracyCutoff(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>If accuracy falls below this percentage, session is flagged as a fail. (Default: 60%)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span>Consecutive failed sessions count:</span><strong style={{ color: '#fbbf24' }}>{consecutiveSessions} games</strong></div>
                <input type="range" min="2" max="5" value={consecutiveSessions} onChange={e => setConsecutiveSessions(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Number of back-to-back failed games in Literacy/Numeracy to trigger diagnostic flag. (Default: 3)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span>Inactivity Alert threshold:</span><strong style={{ color: '#fbbf24' }}>{inactivityDays} days</strong></div>
                <input type="range" min="2" max="10" value={inactivityDays} onChange={e => setInactivityDays(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Days without activity before flagging a login gap alert to parents. (Default: 5 days)</span>
              </div>
              {thresholdSuccessMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-success)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>{thresholdSuccessMsg}</div>}
              <div><button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>Save Cutoffs & Run Checks</button></div>
            </form>
          </div>

          <div className="glass-card">
            <h3>Trigger Weekly Report Cloud Function</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>Simulate the Firebase Scheduled Trigger cloud function, compiling reports and posting recommendations.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select value={reportChildId} onChange={e => setReportChildId(e.target.value)} className="select-field" style={{ flex: 1 }}>
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={handleTriggerReport} className="btn" style={{ whiteSpace: 'nowrap' }}><Play size={16} />Run Function</button>
            </div>
            {reportSuccessMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-success)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', marginTop: '12px' }}>{reportSuccessMsg}</div>}
          </div>
        </div>

        <div className="glass-card">
          <h3>Log Mock Assessment Activity</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>Simulate a child playing a game module. To trigger a "Literacy Gap", write 3 consecutive Literacy games with accuracy &lt; 60%.</p>
          <form onSubmit={handleAddAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Child:</label><select value={childId} onChange={e => setChildId(e.target.value)} className="select-field">{children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Domain:</label><select value={domain} onChange={e => setDomain(e.target.value as any)} className="select-field"><option value="Literacy">Literacy</option><option value="Numeracy">Numeracy</option><option value="Cognitive">Cognitive</option><option value="Creativity">Creativity</option><option value="Emotional">Emotional</option></select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Activity Module:</label><select value={activityName} onChange={e => setActivityName(e.target.value)} className="select-field">{activitiesByDomain.map((act, i) => <option key={i} value={act}>{act}</option>)}</select></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Session Date:</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" style={{ padding: '7px 10px' }} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score (pts):</label><input type="number" min="0" max="100" value={score} onChange={e => setScore(parseInt(e.target.value))} className="input-field" style={{ padding: '6px' }} required /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accuracy (%):</label><input type="number" min="0" max="100" value={accuracy} onChange={e => setAccuracy(parseInt(e.target.value))} className="input-field" style={{ padding: '6px' }} required /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Duration (s):</label><input type="number" min="10" max="1000" value={time} onChange={e => setTime(parseInt(e.target.value))} className="input-field" style={{ padding: '6px' }} required /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attempts:</label><input type="number" min="1" max="5" value={attempts} onChange={e => setAttempts(parseInt(e.target.value))} className="input-field" style={{ padding: '6px' }} required /></div>
            </div>
            {assessmentSuccessMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-success)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>{assessmentSuccessMsg}</div>}
            <div style={{ marginTop: '6px' }}><button type="submit" className="btn" style={{ width: '100%' }}><Plus size={16} />Write to Firestore & Audit Gaps</button></div>
          </form>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Database size={22} color="var(--primary)" /><h3>Firestore Collection Inspector</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search collection JSON..." value={dbSearch} onChange={e => setDbSearch(e.target.value)} className="input-field" style={{ padding: '6px 12px 6px 32px', fontSize: '0.8rem', width: '180px' }} />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <select value={inspectChildId} onChange={e => setInspectChildId(e.target.value)} className="select-field" style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
              <option value="all">All Children</option>
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '16px', overflowX: 'auto' }}>
          {(['assessments', 'ai_analysis', 'recommendations', 'reports'] as const).map(colName => (
            <button key={colName} onClick={() => setActiveCollection(colName)} className={`btn ${activeCollection === colName ? '' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.75rem', textTransform: 'capitalize' }}>
              Collection: {colName}
            </button>
          ))}
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', background: '#070a13' }}>
          {loadingRows ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading collection...</div>
          ) : collectionRows.length > 0 ? (
            <table className="custom-table" style={{ fontSize: '0.8rem' }}>
              <thead><tr><th style={{ width: '80px' }}>Index</th><th>Document ID</th><th>Payload Data (JSON Schema)</th></tr></thead>
              <tbody>
                {collectionRows.map((row, index) => (
                  <tr key={index}>
                    <td style={{ color: 'var(--text-muted)' }}>#{index + 1}</td>
                    <td style={{ fontWeight: '600', fontFamily: 'monospace', color: '#818cf8' }}>{row.id || row.child_id || `doc_${index}`}</td>
                    <td><pre style={{ margin: 0, padding: '8px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a5b4fc', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(row, null, 2)}</pre></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No records found matching filters.</div>
          )}
        </div>
      </div>
    </div>
  );
};
