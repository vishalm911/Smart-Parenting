import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Users, Send, AlertTriangle, Award, CheckCircle, FileSpreadsheet, Trophy, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as ChartTooltip, CartesianGrid, Legend } from 'recharts';
import { getChildren, getAssessments, getAiAnalysis, addRecommendation, calculateSchoolReadinessScore, checkPredictiveInactivity } from '../../services/analyticsService';
import type { Child } from '../../services/analyticsService';

interface TeacherDashboardProps { onRefresh: () => void; }

const ProgressRing: React.FC<{ value: number; size?: number; strokeWidth?: number; color?: string }> = ({
  value,
  size = 130,
  strokeWidth = 10,
  color = '#4299E1'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: `${size * 0.2}px`, fontWeight: 900, color: 'var(--text-primary)' }}>{value}%</span>
        <span style={{ fontSize: `${size * 0.08}px`, color: 'var(--text-secondary)', fontWeight: 700 }}>Avg Score</span>
      </div>
    </div>
  );
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onRefresh }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const [assigneeId, setAssigneeId] = useState<string>('all');
  const [activityDomain, setActivityDomain] = useState<'Literacy' | 'Numeracy' | 'Cognitive' | 'Creativity' | 'Emotional'>('Literacy');
  const [activityName, setActivityName] = useState<string>('Sight Words Collector');
  const [assignmentReason, setAssignmentReason] = useState<string>('Practice sight words to improve letter fluency.');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [children, setChildren] = useState<Child[]>([]);
  const [studentsSummary, setStudentsSummary] = useState<any[]>([]);
  const [classAnalytics, setClassAnalytics] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const kids = await getChildren();
      setChildren(kids);

      const allAssessments: any[] = [];
      const summaries = await Promise.all(kids.map(async student => {
        const [assessments, analysis, readiness, inactivity] = await Promise.all([
          getAssessments(student.id), getAiAnalysis(student.id),
          calculateSchoolReadinessScore(student.id), checkPredictiveInactivity(student.id)
        ]);

        assessments.forEach((a: any) => {
          allAssessments.push({
            studentName: student.name,
            studentAvatar: student.avatar || '🧒',
            action: `Completed ${a.activity_name || a.domain} with ${a.accuracy}% accuracy`,
            timeRaw: new Date(a.date).getTime(),
            dateString: a.date,
            domain: a.domain
          });
        });

        const flags: string[] = [];
        if (analysis.reading_difficulty) flags.push('Reading Gap');
        if (analysis.numeracy_gap) flags.push('Numeracy Gap');
        if (inactivity.inactive) flags.push('Inactive (5d+)');
        return { ...student, readiness, flags, strengths: analysis.strength_areas, sessionCount: assessments.length };
      }));
      setStudentsSummary(summaries);

      const sortedActivities = allAssessments
        .sort((a, b) => b.timeRaw - a.timeRaw)
        .slice(0, 5)
        .map(a => {
          const seconds = Math.floor((Date.now() - a.timeRaw) / 1000);
          let timeAgoStr = 'Just now';
          if (seconds >= 60 && seconds < 3600) timeAgoStr = `${Math.floor(seconds / 60)}m ago`;
          else if (seconds >= 3600 && seconds < 86400) timeAgoStr = `${Math.floor(seconds / 3600)}h ago`;
          else if (seconds >= 86400) timeAgoStr = `${Math.floor(seconds / 86400)}d ago`;

          let color = '#3B82F6', emoji = '📖';
          if (a.domain === 'Numeracy') { color = '#D97706'; emoji = '🔢'; }
          else if (a.domain === 'Cognitive') { color = '#22C55E'; emoji = '🧩'; }
          else if (a.domain === 'Creativity') { color = '#9F7AEA'; emoji = '🎨'; }
          else if (a.domain === 'Emotional') { color = '#EF4444'; emoji = '❤️'; }

          return {
            student: a.studentName,
            action: a.action,
            time: timeAgoStr,
            emoji,
            color
          };
        });

      const defaultMockActivities = [
        { student: 'Arjun S.',  action: 'Completed Alphabet Forest', time: '5m ago',  emoji: '📖', color: '#3B82F6' },
        { student: 'Priya D.',  action: 'Started Number Safari',     time: '12m ago', emoji: '🔢', color: '#D97706' },
        { student: 'Karan P.',  action: 'Earned 50 coins',           time: '30m ago', emoji: '🪙', color: '#D97706' },
        { student: 'Riya S.',   action: 'Unlocked Explorer badge',   time: '1h ago',  emoji: '🏆', color: '#9F7AEA' },
        { student: 'Meena G.',  action: 'Completed Color Splash',    time: '2h ago',  emoji: '🎨', color: '#22C55E' },
      ];

      setRecentActivities(sortedActivities.length > 0 ? sortedActivities : defaultMockActivities);

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

  const classAvgReadiness = useMemo(() => {
    if (studentsSummary.length === 0) return 72;
    return Math.round(studentsSummary.reduce((acc, curr) => acc + curr.readiness, 0) / studentsSummary.length);
  }, [studentsSummary]);

  const topPerformers = useMemo(() => {
    const sorted = [...studentsSummary].sort((a, b) => b.readiness - a.readiness).slice(0, 5);
    const fallbackTopPerformers = [
      { name: 'Arjun Sharma',  readiness: 98, initials: 'AS' },
      { name: 'Priya Devi',    readiness: 95, initials: 'PD' },
      { name: 'Riya Singh',    readiness: 92, initials: 'RS' },
      { name: 'Karan Patel',   readiness: 89, initials: 'KP' },
      { name: 'Meena Gupta',   readiness: 86, initials: 'MG' },
    ];
    if (sorted.length === 0) return fallbackTopPerformers;
    return sorted.map(s => ({
      name: s.name,
      readiness: s.readiness,
      initials: s.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    }));
  }, [studentsSummary]);

  const activityBreakdown = useMemo(() => {
    const emojiMap: Record<string, string> = {
      Literacy: '📖', Numeracy: '🔢', Cognitive: '🧩', Creativity: '🎨', Emotional: '❤️'
    };
    const colorMap: Record<string, string> = {
      Literacy: '#3B82F6', Numeracy: '#D97706', Cognitive: '#22C55E', Creativity: '#9F7AEA', Emotional: '#EF4444'
    };
    const bgMap: Record<string, string> = {
      Literacy: '#EFF6FF', Numeracy: '#FFF8E1', Cognitive: '#F0FFF4', Creativity: '#F5F3FF', Emotional: '#FFF5F5'
    };

    if (classAnalytics.length === 0 || classAnalytics.every(c => c.ClassAverage === 0)) {
      return [
        { subject: 'Literacy', completion: 85, color: '#3B82F6', bg: '#EFF6FF', emoji: '📖' },
        { subject: 'Math',     completion: 70, color: '#D97706', bg: '#FFF8E1', emoji: '🔢' },
        { subject: 'Science',  completion: 65, color: '#22C55E', bg: '#F0FFF4', emoji: '🔬' },
        { subject: 'Art',      completion: 80, color: '#9F7AEA', bg: '#F5F3FF', emoji: '🎨' },
      ];
    }

    return classAnalytics.map(c => ({
      subject: c.domain,
      completion: c.ClassAverage || 0,
      color: colorMap[c.domain] || '#3B82F6',
      bg: bgMap[c.domain] || '#EFF6FF',
      emoji: emojiMap[c.domain] || '📖'
    }));
  }, [classAnalytics]);

  const activitiesCount = useMemo(() => {
    if (studentsSummary.length === 0) return 15;
    return studentsSummary.reduce((acc, curr) => acc + (curr.sessionCount || 0), 0);
  }, [studentsSummary]);

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
      reason: `Assigned by Teacher: ${assignmentReason}`, priority: 'High'
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

  const MEDAL_STYLES = [
    { bg: 'linear-gradient(135deg, #FFD700, #FFA000)', shadow: 'rgba(255,193,7,0.5)',  label: '🥇' },
    { bg: 'linear-gradient(135deg, #C0C0C0, #9E9E9E)', shadow: 'rgba(192,192,192,0.5)', label: '🥈' },
    { bg: 'linear-gradient(135deg, #CD7F32, #8D5524)', shadow: 'rgba(205,127,50,0.5)',  label: '🥉' },
    { bg: 'linear-gradient(135deg, #4299E1, #1F3A68)', shadow: 'rgba(66,153,225,0.35)', label: '4' },
    { bg: 'linear-gradient(135deg, #4299E1, #1F3A68)', shadow: 'rgba(66,153,225,0.35)', label: '5' },
  ];

  const pageTitle = useMemo(() => {
    switch (currentPath) {
      case '/teacher/roster':
        return 'Student Performance Roster 🏫';
      case '/teacher/gaps':
        return 'Learning Gap Reports ⚠️';
      case '/teacher/assign':
        return 'Assign Activity Module 📋';
      case '/teacher/activities':
        return 'Recent Student Activity ⚡';
      case '/teacher/dashboard':
      default:
        return 'Class Analytics Dashboard 📊';
    }
  }, [currentPath]);

  const pageDescription = useMemo(() => {
    switch (currentPath) {
      case '/teacher/roster':
        return 'Full list of active class profiles under your supervision. Review grades and session progress.';
      case '/teacher/gaps':
        return 'AI-flagged learning gaps and inactive status reports requiring teacher attention.';
      case '/teacher/assign':
        return 'Assign educational games and custom notes to individual students or the entire class.';
      case '/teacher/activities':
        return 'Live activity feed listing game completions, star rewards, and scores.';
      case '/teacher/dashboard':
      default:
        return 'Teacher administration center for Kindergarten A. Monitor overall class metrics and averages.';
    }
  }, [currentPath]);

  const renderMainSection = () => {
    switch (currentPath) {
      case '/teacher/roster':
        return (
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', fontWeight: 900 }}>🏫 Student Performance Roster</h3>
            <div className="custom-table-container" style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Grade</th>
                    <th style={{ padding: '10px' }}>Age</th>
                    <th style={{ padding: '10px' }}>Plays</th>
                    <th style={{ padding: '10px' }}>Readiness</th>
                    <th style={{ padding: '10px' }}>Alert Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsSummary.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '700' }}>
                        <span style={{ marginRight: '6px', fontSize: '1.1rem' }}>{student.avatar || '🧒'}</span>{student.name}
                      </td>
                      <td style={{ padding: '12px 10px' }}>{student.grade || '—'}</td>
                      <td style={{ padding: '12px 10px' }}>{student.age || '—'} yrs</td>
                      <td style={{ padding: '12px 10px' }}>{student.sessionCount} plays</td>
                      <td style={{ padding: '12px 10px' }}>
                        <strong style={{ color: student.readiness >= 80 ? '#22C55E' : student.readiness >= 65 ? '#D97706' : '#EF4444' }}>
                          {student.readiness}%
                        </strong>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {student.flags.length > 0 ? (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {student.flags.map((flg: string, i: number) => (
                              <span key={i} style={{ fontSize: '0.58rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                {flg}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#22C55E', fontWeight: '800' }}>Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case '/teacher/gaps':
        return (
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ marginBottom: '12px', color: '#D97706', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900 }}>
              <AlertTriangle size={20} />Learning Gap Reports
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              AI-flagged students based on consecutive accuracy checks. Remedial action is highly recommended.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {flaggedStudents.length > 0 ? flaggedStudents.map(student => (
                <div key={student.id} style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{student.avatar || '🧒'} {student.name}</strong>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {student.flags.map((f: string, i: number) => (
                        <span key={i} style={{ fontSize: '0.58rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                    {student.flags.includes('Reading Gap') && 'Fluency is below standards. Flagged after 3 consecutive sessions <60% accuracy on Phonics check.'}
                    {student.flags.includes('Numeracy Gap') && 'Scores dropped. Flagged after 3 consecutive sessions <60% accuracy on shape matching.'}
                    {student.flags.includes('Inactive (5d+)') && 'Child has not logged in for 5 days. Consider alerting parent to resume.'}
                  </p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No student flags triggered. Class is tracking well!
                </div>
              )}
            </div>
          </div>
        );

      case '/teacher/assign':
        return (
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 900 }}>📋 Assign Activity Module</h3>
            <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Assign To:</label>
                  <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="select-field" style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)' }}>
                    <option value="all">Entire Class (All profiles)</option>
                    {children.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade || 'No Grade'})</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Learning Domain:</label>
                  <select value={activityDomain} onChange={e => setActivityDomain(e.target.value as any)} className="select-field" style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)' }}>
                    <option value="Literacy">Literacy</option>
                    <option value="Numeracy">Numeracy</option>
                    <option value="Cognitive">Cognitive</option>
                    <option value="Creativity">Creativity</option>
                    <option value="Emotional">Emotional</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Select Game Module:</label>
                  <select value={activityName} onChange={e => setActivityName(e.target.value)} className="select-field" style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)' }}>
                    {activitiesByDomain.map((act, i) => <option key={i} value={act}>{act}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Teacher Guidelines / Assignment Notes:</label>
                <input type="text" value={assignmentReason} onChange={e => setAssignmentReason(e.target.value)} className="input-field" placeholder="e.g. Focus on phonics sounds and vocabulary checks." style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)' }} required />
              </div>
              {successMsg && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-success)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} />{successMsg}
                </div>
              )}
              <div>
                <button type="submit" className="btn" style={{ padding: '10px 20px', borderRadius: '50px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800 }}>
                  <Send size={16} style={{ marginRight: '8px', display: 'inline' }} />Send Assignment Notification
                </button>
              </div>
            </form>
          </div>
        );

      case '/teacher/activities':
        return (
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 900 }}>⚡ Recent Student Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recentActivities.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                    background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.15rem', border: `1px solid ${item.color}25`
                  }}>
                    {item.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block' }}>{item.student}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>{item.action}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case '/teacher/dashboard':
      default:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Chart */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px', fontWeight: 900 }}>📊 Domain Performance vs NEP Benchmark</h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="domain" stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                      <YAxis domain={[0, 100]} stroke="var(--text-secondary)" style={{ fontSize: '0.8rem' }} />
                      <ChartTooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                      <Legend style={{ fontSize: '0.85rem' }} />
                      <Bar name="Class Avg" dataKey="ClassAverage" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar name="NEP Target" dataKey="Benchmark" fill="rgba(0,0,0,0.08)" stroke="rgba(0,0,0,0.3)" strokeDasharray="4 4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Progress Bars */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px', fontWeight: 900 }}>📈 Activity Completion by Subject</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activityBreakdown.map((subj) => (
                    <div key={subj.subject}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>{subj.emoji}</span>
                          <strong style={{ fontSize: '0.9rem' }}>{subj.subject}</strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px', background: subj.bg, color: subj.color }}>
                          {subj.completion}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ width: `${subj.completion}%`, height: '100%', background: subj.color, borderRadius: '100px', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Circular Ring */}
              <div className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
                <h3 style={{ marginBottom: '8px', fontWeight: 900 }}>🏫 Class Progress</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 600 }}>
                  Average completion rate this week
                </p>
                <ProgressRing value={classAvgReadiness} color="#3B82F6" size={130} />
                <h4 style={{ marginTop: '16px', color: '#3B82F6', fontWeight: 900 }}>{classAvgReadiness}% Complete</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 700 }}>
                  📈 Up from last week!
                </p>
              </div>
              {/* Leaderboard */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px', fontWeight: 900 }}>🏆 Top Performers</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {topPerformers.map((student, i) => {
                    const medal = MEDAL_STYLES[i] || MEDAL_STYLES[3];
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: i < 3 ? '10px' : '4px',
                        borderRadius: i < 3 ? '12px' : '0px',
                        background: i < 3 ? `${medal.bg.split(',')[1]?.replace(')', '')}15)` : 'transparent',
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                          background: medal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 2px 8px ${medal.shadow}`, fontSize: i < 3 ? '0.95rem' : '0.68rem',
                          color: 'white', fontWeight: 900
                        }}>
                          {medal.label}
                        </div>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: medal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 900, color: 'white',
                          border: '2px solid white', boxShadow: `0 2px 6px ${medal.shadow}`
                        }}>
                          {student.initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: i < 3 ? 900 : 700, display: 'block' }}>
                            {student.name.split(' ')[0]}
                          </span>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '100px', marginTop: '4px' }}>
                            <div style={{ width: `${student.readiness}%`, height: '100%', background: medal.bg, borderRadius: '100px' }} />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: '8px' }}>
                          {student.readiness}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>⏳ Loading class data...</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Welcome & Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} color="var(--primary)" />{pageTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {pageDescription}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <FileSpreadsheet size={18} />Export CSV Records
        </button>
      </div>

      {/* ── KPI Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Active Students */}
        <div className="glass-card" style={{
          display: 'flex', alignItems: 'center', gap: '16px', borderTop: '4px solid #3B82F6',
          boxShadow: '0 4px 20px rgba(59,130,246,0.1)', transition: 'all 0.25s',
        }}>
          <div style={{ background: 'rgba(99,102,241,0.1)', padding: '14px', borderRadius: '12px', color: '#3B82F6' }}>
            <Users size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Students</span>
            <h3 style={{ fontSize: '1.8rem', marginTop: '4px', fontWeight: 900 }}>{children.length}</h3>
          </div>
        </div>

        {/* Card 2: Activities Set */}
        <div className="glass-card" style={{
          display: 'flex', alignItems: 'center', gap: '16px', borderTop: '4px solid #22C55E',
          boxShadow: '0 4px 20px rgba(34,197,94,0.1)', transition: 'all 0.25s',
        }}>
          <div style={{ background: 'rgba(34,197,94,0.1)', padding: '14px', borderRadius: '12px', color: '#22C55E' }}>
            <Sparkles size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Activities Play</span>
            <h3 style={{ fontSize: '1.8rem', marginTop: '4px', fontWeight: 900 }}>{activitiesCount}</h3>
          </div>
        </div>

        {/* Card 3: Class Avg Readiness */}
        <div className="glass-card" style={{
          display: 'flex', alignItems: 'center', gap: '16px', borderTop: '4px solid #D97706',
          boxShadow: '0 4px 20px rgba(217,119,6,0.1)', transition: 'all 0.25s',
        }}>
          <div style={{ background: 'rgba(217,119,6,0.1)', padding: '14px', borderRadius: '12px', color: '#D97706' }}>
            <Award size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Avg Readiness</span>
            <h3 style={{ fontSize: '1.8rem', marginTop: '4px', fontWeight: 900 }}>{classAvgReadiness}%</h3>
          </div>
        </div>

        {/* Card 4: Flagged For Review */}
        <div className="glass-card" style={{
          display: 'flex', alignItems: 'center', gap: '16px', borderTop: '4px solid #EF4444',
          boxShadow: '0 4px 20px rgba(239,68,68,0.1)', transition: 'all 0.25s',
        }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', padding: '14px', borderRadius: '12px', color: '#EF4444' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Flagged Review</span>
            <h3 style={{ fontSize: '1.8rem', marginTop: '4px', color: flaggedStudents.length > 0 ? '#EF4444' : 'inherit', fontWeight: 900 }}>{flaggedStudents.length}</h3>
          </div>
        </div>
      </div>

      {/* ── Main content grid ── */}
      {renderMainSection()}

    </div>
  );
};
