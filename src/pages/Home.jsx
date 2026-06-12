import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Home.css';

const LEARNING_PATH = [
  { id: 'counting', name: 'Counting Garden', icon: '🌻', status: 'unlocked', progress: 100 },
  { id: 'addition', name: 'Addition Valley', icon: '➕', status: 'current', progress: 35 },
  { id: 'shapes', name: 'Shape Kingdom', icon: '🔷', status: 'locked', progress: 0 },
  { id: 'patterns', name: 'Pattern Palace', icon: '🎨', status: 'locked', progress: 0 },
];

const DAILY_MISSIONS = [
  { id: 1, task: 'Solve 5 Math Puzzles', completed: true, xp: 20 },
  { id: 2, task: 'Complete a Logic Game', completed: true, xp: 15 },
  { id: 3, task: 'Earn 3 Stars', completed: false, xp: 10 },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [animateStars, setAnimateStars] = useState(0);
  const [animateXP, setAnimateXP] = useState(0);

  const name = profile?.name ?? 'Ayush';
  const greeting = getGreeting();
  const dayStreak = profile?.dayStreak ?? 0;
  const badgeCount = profile?.badges ?? 0;

  useEffect(() => {
    if (!profile) return;

    const target = profile.stars ?? 0;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setAnimateStars(current);
    }, 30);

    const xpTarget = profile.xp ?? 0;
    let xpCurrent = 0;
    const xpStep = Math.max(1, Math.floor(xpTarget / 35));
    const xpTimer = setInterval(() => {
      xpCurrent += xpStep;
      if (xpCurrent >= xpTarget) {
        xpCurrent = xpTarget;
        clearInterval(xpTimer);
      }
      setAnimateXP(xpCurrent);
    }, 30);

    return () => {
      clearInterval(timer);
      clearInterval(xpTimer);
    };
  }, [profile]);

  const MODULES = useMemo(() => {
    return [
      { id: 'math-world', title: 'Math World', path: '/math-world', emoji: '🔢', progress: Math.min(100, Math.floor((profile?.progress?.mathWorld ?? 0) / 3)), total: 8, done: Math.min(8, Math.floor((profile?.progress?.mathWorld ?? 0) / 40)) },
      { id: 'puzzle-world', title: 'Puzzle World', path: '/puzzle-world', emoji: '🧩', progress: Math.min(100, Math.floor((profile?.progress?.puzzleWorld ?? 0) / 3)), total: 8, done: Math.min(8, Math.floor((profile?.progress?.puzzleWorld ?? 0) / 40)) },
      { id: 'number-adventure', title: 'Number Adventure', path: '/number-adventure', emoji: '🗺️', progress: Math.min(100, Math.floor((profile?.progress?.numberAdventure ?? 0) / 3)), total: 6, done: Math.min(6, Math.floor((profile?.progress?.numberAdventure ?? 0) / 50)) },
      { id: 'logic-island', title: 'Logic Island', path: '/logic-island', emoji: '🧠', progress: Math.min(100, Math.floor((profile?.progress?.logicIsland ?? 0) / 3)), total: 6, done: Math.min(6, Math.floor((profile?.progress?.logicIsland ?? 0) / 50)) },
    ];
  }, [profile?.progress]);

  const recommendation = useMemo(() => {
    if (!profile) return { title: 'Numeracy World', subtitle: 'Start your math journey!', path: '/adventure', emoji: '🔢' };
    const prog = profile.progress || {};
    const mw = prog.mathWorld ?? 0;
    const pw = prog.puzzleWorld ?? 0;
    const na = prog.numberAdventure ?? 0;
    const li = prog.logicIsland ?? 0;

    const minVal = Math.min(mw, pw, na, li);
    if (minVal === mw) {
      return { title: 'Math World', subtitle: 'Learn numbers & simple counting!', path: '/math-world', emoji: '🔢' };
    } else if (minVal === pw) {
      return { title: 'Puzzle World', subtitle: 'Train your brain with 3D shapes!', path: '/puzzle-world', emoji: '🧩' };
    } else if (minVal === na) {
      return { title: 'Number Adventure', subtitle: 'Explore the map of numbers!', path: '/number-adventure', emoji: '🗺️' };
    } else {
      return { title: 'Logic Island', subtitle: 'Solve patterns and multiplication quests!', path: '/logic-island', emoji: '🧠' };
    }
  }, [profile]);

  return (
    <div className="dashboard-page">
      {/* Top Navigation Bar */}
      <div className="dashboard-topnav">
        <div className="topnav-left">
          <div className="topnav-greeting">
            <h2>{greeting}, {name} 👋</h2>
          </div>
        </div>
        <div className="topnav-right">
          <div className="topnav-stat" title="Daily Streak">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{dayStreak}</span>
            <span className="stat-label">Streak</span>
          </div>
          <div className="topnav-stat" title="Total Stars">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{animateStars}</span>
            <span className="stat-label">Stars</span>
          </div>
          <div className="topnav-stat" title="Total Badges">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{badgeCount}</span>
            <span className="stat-label">Badges</span>
          </div>
          <div className="topnav-stat" title="XP Progress">
            <span className="stat-icon">⚡</span>
            <span className="stat-value">{animateXP}</span>
            <span className="stat-label">XP</span>
          </div>
          <div className="topnav-avatar" onClick={() => navigate('/avatar')}>
            👤
          </div>
        </div>
      </div>

      <div className="dashboard-inner">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-card" onClick={() => navigate(recommendation.path)}>
            <div className="hero-content">
              <div className="hero-badge">Continue Learning</div>
              <h3 className="hero-title">{recommendation.title}</h3>
              <p className="hero-subtitle">{recommendation.subtitle}</p>
              <div className="hero-progress">
                <div className="hero-progress-bar">
                  <div className="hero-progress-fill" style={{ width: '35%' }}>
                    <span className="progress-glow"></span>
                  </div>
                </div>
                <span className="hero-progress-text">35% Complete</span>
              </div>
              <p className="hero-time">⏱️ Estimated Time: 10 minutes remaining</p>
              <button className="hero-btn">Continue Journey →</button>
            </div>
            <div className="hero-illustration">
              <div className="hero-icon">{recommendation.emoji}</div>
              <div className="hero-sparkles">
                <span className="sparkle" style={{ '--delay': '0s' }}>✨</span>
                <span className="sparkle" style={{ '--delay': '0.5s' }}>⭐</span>
                <span className="sparkle" style={{ '--delay': '1s' }}>💫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Learning Journey Map */}
          <div className="dash-card journey-map">
            <h3 className="card-title">🗺️ Learning Journey</h3>
            <div className="journey-path">
              {LEARNING_PATH.map((step, index) => (
                <div key={step.id} className="journey-step">
                  <div className={`step-node ${step.status}`}>
                    <span className="step-icon">{step.icon}</span>
                    {step.status === 'unlocked' && <span className="step-check">✓</span>}
                    {step.status === 'current' && <div className="step-pulse"></div>}
                  </div>
                  <div className="step-info">
                    <span className="step-name">{step.name}</span>
                    {step.status !== 'locked' && <span className="step-progress">{step.progress}%</span>}
                  </div>
                  {index < LEARNING_PATH.length - 1 && (
                    <div className={`step-connector ${step.status === 'unlocked' ? 'completed' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Missions */}
          <div className="dash-card daily-missions">
            <h3 className="card-title">✅ Daily Missions</h3>
            <div className="missions-list">
              {DAILY_MISSIONS.map(mission => (
                <div key={mission.id} className={`mission-item ${mission.completed ? 'completed' : ''}`}>
                  <div className="mission-checkbox">{mission.completed ? '✅' : '⬜'}</div>
                  <div className="mission-text">{mission.task}</div>
                  <div className="mission-reward">+{mission.xp} XP</div>
                </div>
              ))}
            </div>
            <div className="missions-reward">
              <span className="reward-text">Complete all for bonus:</span>
              <span className="reward-value">+20 XP 🎁</span>
            </div>
          </div>

          {/* Explore Worlds */}
          <div className="dash-card explore-worlds">
            <h3 className="card-title">🌍 Explore Worlds</h3>
            <div className="module-grid">
              {MODULES.map(mod => (
                <div key={mod.id} className="module-card" onClick={() => navigate(mod.path)}>
                  <span className="module-emoji">{mod.emoji}</span>
                  <div className="module-info">
                    <h4 className="module-name">{mod.title}</h4>
                    <span className="module-lessons">{mod.done}/{mod.total} lessons</span>
                  </div>
                  <div className="module-progress-bar">
                    <div className="module-progress-fill" style={{ width: `${mod.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="dash-card statistics-section">
            <h3 className="card-title">📊 Your Progress</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon-large">⏱️</div>
                <div className="stat-label">Learning Time</div>
                <div className="stat-value">2h 45m</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">📚</div>
                <div className="stat-label">Lessons Done</div>
                <div className="stat-value">{23 + (profile?.badges ?? 0) * 2}</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">🎯</div>
                <div className="stat-label">Current Level</div>
                <div className="stat-value">Level {profile?.level ?? 1}</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">🧩</div>
                <div className="stat-label">Puzzles Solved</div>
                <div className="stat-value">{42 + (profile?.stars ?? 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
