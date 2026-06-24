import React, { useMemo, useState, useEffect } from 'react';
import { Flame, Star, Sparkles, BookOpen, Calculator, Brain, Palette, Smile } from 'lucide-react';
import { getAssessments, calculateSchoolReadinessScore, getAiAnalysis } from '../../services/firebaseSimulator';
import type { Child, Assessment, AIAnalysis } from '../../services/firebaseSimulator';

interface ChildProgressProps { selectedChild: Child; }

export const ChildProgress: React.FC<ChildProgressProps> = ({ selectedChild }) => {
  const childId = selectedChild.id;
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis>({ child_id: childId, reading_difficulty: false, numeracy_gap: false, learning_delay_flag: false, strength_areas: [], last_updated: '' });
  const [readinessScore, setReadinessScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAssessments(childId),
      getAiAnalysis(childId),
      calculateSchoolReadinessScore(childId)
    ]).then(([a, an, r]) => {
      setAssessments(a);
      setAnalysis(an);
      setReadinessScore(r);
      setLoading(false);
    });
  }, [childId]);

  const domainAverages = useMemo(() => {
    const domains = [
      { name: 'Literacy', key: 'Literacy', color: 'var(--color-literacy)', icon: <BookOpen size={20} /> },
      { name: 'Numeracy', key: 'Numeracy', color: 'var(--color-numeracy)', icon: <Calculator size={20} /> },
      { name: 'Cognitive', key: 'Cognitive', color: 'var(--color-cognitive)', icon: <Brain size={20} /> },
      { name: 'Creativity', key: 'Creativity', color: 'var(--color-creativity)', icon: <Palette size={20} /> },
      { name: 'Emotional', key: 'Emotional', color: 'var(--color-emotional)', icon: <Smile size={20} /> }
    ];
    return domains.map(d => {
      const list = assessments.filter(a => a.domain === d.key);
      const score = list.length > 0 ? Math.round(list.reduce((acc, curr) => acc + curr.score, 0) / list.length) : 0;
      return { ...d, score, count: list.length };
    });
  }, [assessments]);

  const streakInfo = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      return { dateStr: date.toISOString().split('T')[0], dayName: days[date.getDay()], label: date.getDate() };
    }).reverse();
    const activeDates = new Set(assessments.map(a => a.date));
    const streakDays = last7Days.map(d => ({ ...d, active: activeDates.has(d.dateStr) }));
    let streakCount = 0;
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
    if (activeDates.has(todayStr) || activeDates.has(yesterdayStr)) {
      let checkDate = activeDates.has(todayStr) ? now : new Date(now.getTime() - 86400000);
      while (activeDates.has(checkDate.toISOString().split('T')[0])) {
        streakCount++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      }
    }
    return { days: streakDays, count: streakCount };
  }, [assessments]);

  const starChartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const daily = assessments.filter(a => a.date === dateStr);
      let stars = 0;
      if (daily.length > 0) {
        const avg = daily.reduce((acc, curr) => acc + curr.score, 0) / daily.length;
        stars = avg >= 80 ? 3 : avg >= 60 ? 2 : 1;
      }
      return { date: dateStr, dayNum: date.getDate(), month: date.toLocaleString('default', { month: 'short' }), stars, played: daily.length > 0 };
    });
  }, [assessments]);

  const totalStars = useMemo(() => starChartData.reduce((acc, curr) => acc + curr.stars, 0), [starChartData]);

  const badges = useMemo(() => {
    const allBadges = [
      { id: 'lit_wizard', name: 'Word Wizard', emoji: '🧙‍♂️', desc: 'Average Literacy Score >= 80%', unlocked: false },
      { id: 'num_ninja', name: 'Number Ninja', emoji: '🥷', desc: 'Average Numeracy Score >= 80%', unlocked: false },
      { id: 'cog_puzzle', name: 'Puzzle Explorer', emoji: '🧩', desc: 'Average Cognitive Score >= 80%', unlocked: false },
      { id: 'cre_artist', name: 'Artistic Champion', emoji: '🎨', desc: 'Average Creativity Score >= 80%', unlocked: false },
      { id: 'emo_caring', name: 'Kindness Cadet', emoji: '❤️', desc: 'Average Emotional Score >= 80%', unlocked: false },
      { id: 'streak_3', name: 'Streak Superstar', emoji: '🔥', desc: 'Current Streak >= 3 Days', unlocked: false },
      { id: 'school_ready', name: 'Super Scholar', emoji: '🎓', desc: 'School Readiness Score >= 85%', unlocked: false }
    ];
    allBadges.forEach(b => {
      if (b.id === 'lit_wizard') b.unlocked = (domainAverages.find(d => d.key === 'Literacy')?.score || 0) >= 80;
      if (b.id === 'num_ninja') b.unlocked = (domainAverages.find(d => d.key === 'Numeracy')?.score || 0) >= 80;
      if (b.id === 'cog_puzzle') b.unlocked = (domainAverages.find(d => d.key === 'Cognitive')?.score || 0) >= 80;
      if (b.id === 'cre_artist') b.unlocked = (domainAverages.find(d => d.key === 'Creativity')?.score || 0) >= 80;
      if (b.id === 'emo_caring') b.unlocked = (domainAverages.find(d => d.key === 'Emotional')?.score || 0) >= 80;
      if (b.id === 'streak_3') b.unlocked = streakInfo.count >= 3;
      if (b.id === 'school_ready') b.unlocked = readinessScore >= 85;
    });
    return allBadges;
  }, [domainAverages, streakInfo, readinessScore]);

  const motivationalMessage = useMemo(() => {
    const name = selectedChild.name.split(' ')[0];
    if (analysis.reading_difficulty) return { title: `Phonics Safari Adventure! 🦁`, text: `Hey ${name}! Emojis and sounds are waiting! Let's trace some letters and build spelling words together today! You can do it!`, emoji: '📚' };
    if (streakInfo.count >= 3) return { title: `You are UNSTOPPABLE! 🔥`, text: `Wow, ${name}! You are on a massive ${streakInfo.count}-day streak. Keep the spark alive and play your daily brain builder!`, emoji: '⭐' };
    if (readinessScore >= 80) return { title: `Super Scholar status! 🌟`, text: `Awesome work, ${name}! Your school readiness score is amazing. Try a creative sandbox challenge today to celebrate!`, emoji: '✨' };
    return { title: `Ready for Fun? 🚀`, text: `Hello ${name}! Welcome back. Let's play some memory cards and math puzzle games to level up your scores!`, emoji: '🎈' };
  }, [selectedChild, analysis, streakInfo, readinessScore]);

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>⏳ Loading progress...</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card hero-welcome-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))', animation: 'floatIcon 3s infinite ease-in-out' }}>{selectedChild.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>🚀 Welcome to SpaceECE</h2>
              <span className="role-badge role-child" style={{ background: 'white', color: 'var(--color-pink)', border: 'none', fontWeight: 'bold' }}>Level {Math.floor(readinessScore / 10) + 1} Explorer</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '6px', fontSize: '1.15rem', fontWeight: '500' }}>Explore, Learn & Grow Through Fun Adventures</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '12px 24px', borderRadius: '18px', border: '2px solid rgba(255,255,255,0.25)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Readiness Score</span>
            <h3 style={{ fontSize: '2.2rem', color: 'white', margin: '4px 0 0 0', fontFamily: 'var(--font-accent)' }}>{readinessScore} <span style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.75)' }}>/100</span></h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>My Learning Zones</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average score per topic</span>
          </div>
          <div className="progress-rings-grid">
            {domainAverages.map(d => {
              const radius = 38, circumference = 2 * Math.PI * radius, offset = circumference - (d.score / 100) * circumference;
              return (
                <div key={d.name} className="progress-ring-item">
                  <div className="ring-svg-container" style={{ width: '110px', height: '110px' }}>
                    <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="55" cy="55" r={radius} fill="transparent" stroke="rgba(0,0,0,0.05)" strokeWidth="10" />
                      <circle cx="55" cy="55" r={radius} fill="transparent" stroke={d.color} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
                    </svg>
                    <div className="ring-percent" style={{ color: d.color, fontFamily: 'var(--font-accent)', fontSize: '1.4rem' }}>{d.score}%</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: d.color }}>{d.icon}<span style={{ fontSize: '0.95rem', fontWeight: '700' }}>{d.name}</span></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{d.count} sessions played</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card motivational-card">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', background: 'var(--color-bg-card)', padding: '14px', borderRadius: '16px', border: '1px solid #FFF1E6', animation: 'floatIcon 3s infinite ease-in-out' }}>{motivationalMessage.emoji}</div>
            <div>
              <h3 style={{ fontSize: '1.35rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={20} color="var(--color-orange)" />{motivationalMessage.title}</h3>
              <p style={{ marginTop: '6px', lineHeight: '1.4', color: '#78350F', fontSize: '1rem', fontWeight: '500' }}>{motivationalMessage.text}</p>
            </div>
          </div>
          <div style={{ borderTop: '2px solid rgba(245,158,11,0.1)', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Flame size={22} color="var(--color-pink)" /><span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-pink)' }}>{streakInfo.count} Day Streak!</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={20} color="var(--color-orange)" fill="var(--color-orange)" /><span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-orange)', fontFamily: 'var(--font-accent)' }}>{totalStars} Stars Earned</span></div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2-equal">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div><h3>Weekly Streak Calendar</h3><p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Play games daily to build your active learning flame!</p></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(236,72,153,0.1)', padding: '4px 10px', borderRadius: '12px' }}><Flame size={16} color="#ec4899" /><span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f472b6' }}>{streakInfo.count} days</span></div>
          </div>
          <div className="streak-calendar">
            {streakInfo.days.map((d, i) => (
              <div key={i} className={`streak-day ${d.active ? 'active' : ''}`}>
                <span style={{ fontSize: '0.75rem', color: d.active ? 'var(--color-pink)' : 'var(--text-secondary)' }}>{d.dayName}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', margin: '4px 0', color: d.active ? 'var(--color-pink)' : 'var(--text-primary)' }}>{d.label}</span>
                <div className="streak-dot" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div><h3>Star Chart (Last 30 Days)</h3><p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Hover to see stars earned per day</p></div>
            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={16} fill="#fbbf24" /> {totalStars} Stars</span>
          </div>
          <div className="star-chart-grid">
            {starChartData.map((day, i) => (
              <div key={i} className={`star-cell ${day.played ? 'earned' : ''}`}>
                {day.stars > 0 ? <span style={{ fontSize: '0.9rem' }}>⭐</span> : <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day.dayNum}</span>}
                <div className="star-tooltip"><strong>{day.month} {day.dayNum}</strong>{day.played ? <div style={{ color: '#fbbf24', marginTop: '2px' }}>Earned {day.stars} star{day.stars > 1 ? 's' : ''}</div> : <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>No session logged</div>}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '20px' }}>Achievement Badges Unlocked</h3>
        <div className="badge-grid">
          {badges.map(b => (
            <div key={b.id} className={`badge-item ${b.unlocked ? '' : 'locked'}`} title={b.desc}>
              <div className="badge-icon">{b.emoji}</div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', margin: '4px 0' }}>{b.name}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>{b.unlocked ? 'Unlocked' : 'Locked'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
