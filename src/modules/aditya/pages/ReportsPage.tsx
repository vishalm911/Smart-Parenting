import React, { useMemo, useState, useEffect } from 'react';
import { FileText, Printer, Download, Compass, Sparkles, AlertTriangle, History, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getAssessments, getAiAnalysis, getChildren, NEP_MILESTONES, calculateSchoolReadinessScore } from '../services/firebaseSimulator';
import type { Assessment, AIAnalysis, Child } from '../services/firebaseSimulator';

interface ReportsPageProps { selectedChild: Child; }

export const ReportsPage: React.FC<ReportsPageProps> = ({ selectedChild }) => {
  const childId = selectedChild.id;
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfPhase, setPdfPhase] = useState('');
  const initialAgeGroup = selectedChild.age <= 3 ? '1-3' : selectedChild.age <= 6 ? '4-6' : '7-10';
  const [milestoneAgeGroup, setMilestoneAgeGroup] = useState<'1-3' | '4-6' | '7-10'>(initialAgeGroup);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis>({ child_id: childId, reading_difficulty: false, numeracy_gap: false, learning_delay_flag: false, strength_areas: [], last_updated: '' });

  const [readiness, setReadiness] = useState(0);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAssessments(childId), getAiAnalysis(childId), getChildren(), calculateSchoolReadinessScore(childId)]).then(async ([a, an, kids, r]) => {
      setAssessments(a); setAnalysis(an); setReadiness(r);
      // Cohort comparison
      const domains = ['Literacy', 'Numeracy', 'Cognitive', 'Creativity', 'Emotional'];
      const childAvgs: Record<string, number> = {};
      domains.forEach(d => { const list = a.filter(x => x.domain === d); childAvgs[d] = list.length > 0 ? list.reduce((acc, curr) => acc + curr.score, 0) / list.length : 0; });
      const otherKids = kids.filter(c => c.id !== childId);
      const cohortAvgs = await Promise.all(domains.map(async d => {
        let sum = 0, count = 0;
        await Promise.all(otherKids.map(async kid => { const list = (await getAssessments(kid.id)).filter(x => x.domain === d); if (list.length > 0) { sum += list.reduce((acc, curr) => acc + curr.score, 0) / list.length; count++; } }));
        return count > 0 ? Math.round(sum / count) : 75;
      }));
      setCohortData(domains.map((domain, i) => ({ domain, Child: Math.round(childAvgs[domain] || 0), AgeGroupAverage: cohortAvgs[i] })));
      setLoading(false);
    });
  }, [childId]);

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

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>⏳ Loading reports...</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div><h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={28} color="var(--primary)" />Developmental Reports & Milestones</h2><p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Complete historical analytics, age group averages, and milestones mapping against NEP 2020 Guidelines.</p></div>
        <div style={{ display: 'flex', gap: '12px' }} className="print-hide"><button className="btn btn-secondary" onClick={handleDownloadPdf}><Download size={18} />Download PDF</button><button className="btn" onClick={() => window.print()}><Printer size={18} />Print Report</button></div>
      </div>

      {showPdfModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
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

      <div className="dashboard-grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card print-hide">
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={18} />Month-by-Month Diagnostic Reports</h3>
            {monthlyReports.length > 0 ? (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                {monthlyReports.map(r => <button key={r.id} onClick={() => setSelectedMonthKey(r.id)} className={`btn ${selectedMonthKey === r.id ? '' : 'btn-secondary'}`} style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.report_date} Report</button>)}
              </div>
            ) : <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No monthly diagnostic data populated yet.</p>}
          </div>

          {activeReport ? (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div><span className="role-badge role-parent" style={{ marginBottom: '6px' }}>Monthly Progress Diagnostic</span><h3 style={{ fontSize: '1.4rem' }}>{activeReport.report_date} Analytics Summary</h3></div>
                <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Monthly Readiness Index</span><h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{activeReport.school_readiness_score}%</h3></div>
              </div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Domain Performance Grid</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {Object.entries(activeReport.domain_scores).map(([domain, score]) => (
                  <div key={domain} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{domain}</span>
                    <h4 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{score as number}%</h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{activeReport.time_spent[domain] || 0} mins played</span>
                  </div>
                ))}
              </div>
              {activeReport.ai_flags.length > 0 ? (
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px 0' }}><AlertTriangle size={14} />Flags Detected During This Period</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{activeReport.ai_flags.map((f: string, i: number) => <li key={i} style={{ marginTop: '2px' }}>{f}</li>)}</ul>
                </div>
              ) : <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--color-success)' }}>✓ No severe developmental flags reported for this period.</div>}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}><Sparkles size={14} />AI Suggested Recommendations</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>{activeReport.recommendations.map((r: string, i: number) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>{r}</div>)}</div>
              </div>
            </div>
          ) : <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}><FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} /><h4>No Report Profile Selected</h4></div>}

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Child vs Age-Group Average Cohorts</h3>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" /><XAxis dataKey="domain" stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} /><YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                  <ChartTooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', borderRadius: '8px' }} /><Legend style={{ fontSize: '0.8rem' }} />
                  <Bar name={selectedChild.name} dataKey="Child" fill="var(--primary)" radius={[3, 3, 0, 0]} />
                  <Bar name="Age-Group Average" dataKey="AgeGroupAverage" fill="var(--color-secondary-light)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Developmental Learning Curves</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" /><XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} /><YAxis domain={[40, 100]} stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                  <ChartTooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  <Line name="Literacy" type="monotone" dataKey="Literacy" stroke="var(--color-literacy)" strokeWidth={2.5} dot={false} />
                  <Line name="Numeracy" type="monotone" dataKey="Numeracy" stroke="var(--color-numeracy)" strokeWidth={2.5} dot={false} />
                  <Line name="Cognitive" type="monotone" dataKey="Cognitive" stroke="var(--color-cognitive)" strokeWidth={2.5} dot={false} />
                  <Line name="Creativity" type="monotone" dataKey="Creativity" stroke="var(--color-creativity)" strokeWidth={2.5} dot={false} />
                  <Line name="Emotional" type="monotone" dataKey="Emotional" stroke="var(--color-emotional)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '12px', fontSize: '0.7rem' }}>
              <span style={{ color: 'var(--color-literacy)' }}>● Literacy</span><span style={{ color: 'var(--color-numeracy)' }}>● Numeracy</span><span style={{ color: 'var(--color-cognitive)' }}>● Cognitive</span><span style={{ color: 'var(--color-creativity)' }}>● Creativity</span><span style={{ color: 'var(--color-emotional)' }}>● Emotional</span>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Compass size={20} color="var(--primary)" />Developmental Milestones Tracker</h3>
              <span className="role-badge role-child">Active: {selectedChild.name} (Age {selectedChild.age})</span>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', gap: '4px', marginBottom: '16px' }} className="print-hide">
              {(['1-3', '4-6', '7-10'] as const).map(grp => {
                const isActive = milestoneAgeGroup === grp;
                const matchesChild = (grp === '1-3' && selectedChild.age <= 3) || (grp === '4-6' && selectedChild.age > 3 && selectedChild.age <= 6) || (grp === '7-10' && selectedChild.age > 6);
                return <button key={grp} onClick={() => setMilestoneAgeGroup(grp)} style={{ flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', background: isActive ? 'var(--primary)' : 'transparent', color: isActive ? 'white' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s ease' }}>Ages {grp}{matchesChild && <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px' }}>Child</span>}</button>;
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeMilestones.map((m, idx) => {
                const achieved = (domainAverages[m.domain] || 0) >= 75;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '12px', paddingBottom: '12px', borderBottom: idx < activeMilestones.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ fontSize: '1rem', color: achieved ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: 'bold', marginTop: '2px' }}>{achieved ? '✓' : '○'}</div>
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
