import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';
import { getDailyChallenge, getRecommendations, getAchievements, getCurrentChildId } from '../utils/firestoreHelpers';
import ProgressRing from '../components/ProgressRing';
import Confetti from '../components/Confetti';
import './Dashboard.css';

const BADGE_DISPLAY = [
  { id: 'literacy-star', emoji: '📚', nameKey: 'badge.literacy-star' },
  { id: 'math-champ', emoji: '🔢', nameKey: 'badge.math-champ' },
  { id: 'creative-mind', emoji: '🎨', nameKey: 'badge.creative-mind' },
  { id: 'emotion-explorer', emoji: '💝', nameKey: 'badge.emotion-explorer' },
  { id: 'science-whiz', emoji: '🔬', nameKey: 'badge.science-whiz' },
  { id: 'problem-solver', emoji: '🧩', nameKey: 'badge.problem-solver' },
];

const LEARNING_PATH = [
  { id: 'alphabet', name: 'Alphabet Forest', icon: '🌲', status: 'unlocked', progress: 100 },
  { id: 'letters', name: 'Letter Safari', icon: '🦁', status: 'current', progress: 35 },
  { id: 'words', name: 'Word Adventure', icon: '📖', status: 'locked', progress: 0 },
  { id: 'reading', name: 'Reading Kingdom', icon: '👑', status: 'locked', progress: 0 },
];

const DAILY_MISSIONS = [
  { id: 1, task: 'Complete Letter Safari', completed: true, xp: 20 },
  { id: 2, task: 'Learn 5 New Words', completed: true, xp: 15 },
  { id: 3, task: 'Earn 2 Stars', completed: false, xp: 10 },
];

const LEADERBOARD = [
  { rank: 1, name: 'Aarav', stars: 245, avatar: '🦸' },
  { rank: 2, name: 'Priya', stars: 230, avatar: '👸' },
  { rank: 3, name: 'Emma', stars: 215, avatar: '🧑‍🚀' },
  { rank: 4, name: 'You', stars: 0, avatar: '👤', isUser: true },
  { rank: 5, name: 'Rohan', stars: 180, avatar: '🧙' },
];

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [animateStars, setAnimateStars] = useState(0);
  const [animateXP, setAnimateXP] = useState(0);
  const [dayStreak, setDayStreak] = useState(15);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? 'Good Morning' : currentTime < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    setDailyChallenge(getDailyChallenge());
    setRecommendations(getRecommendations());
    
    // Animate star counter
    let target = state.stars || 120;
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

    // Animate XP
    let xpTarget = 850;
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
  }, [state.stars]);

  const weeklyProgress = Math.min(100, Math.round(((state.stars || 120) / 200) * 100));
  const childName = state.childProfile?.name || 'Emma';
  const totalXP = 1000;
  const currentLevel = 7;
  const badgeCount = state.badges.length || 5;
  const learningTime = '2h 45m';
  const completedLessons = 23;

  const handleMissionComplete = (missionId) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="dashboard-page">
      {showConfetti && <Confetti />}
      
      {/* Enhanced Top Navigation Bar */}
      <div className="dashboard-topnav">
        <div className="topnav-left">
          <div className="topnav-greeting">
            <h2>{greeting}, {childName} 👋</h2>
          </div>
        </div>
        <div className="topnav-right">
          <div className="topnav-stat" title="Daily Streak">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{dayStreak}</span>
            <span className="stat-label">Day Streak</span>
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
            {state.avatar?.avatarId ? '🧑‍🚀' : '👤'}
          </div>
        </div>
      </div>

      <div className="dashboard-inner">
        {/* Hero Section - Continue Learning Journey */}
        <div className="hero-section">
          <div className="hero-card" onClick={() => navigate('/adventure')}>
            <div className="hero-content">
              <div className="hero-badge">Continue Learning</div>
              <h3 className="hero-title">Literacy Land</h3>
              <p className="hero-subtitle">Current Course: Letter Sounds & Recognition</p>
              <div className="hero-progress">
                <div className="hero-progress-bar">
                  <div className="hero-progress-fill" style={{ width: '35%' }}>
                    <span className="progress-glow"></span>
                  </div>
                </div>
                <span className="hero-progress-text">35% Complete</span>
              </div>
              <p className="hero-time">⏱️ Estimated Time: 10 minutes remaining</p>
              <button className="hero-btn">
                Continue Journey →
              </button>
            </div>
            <div className="hero-illustration">
              <div className="hero-icon">📖</div>
              <div className="hero-sparkles">
                <span className="sparkle" style={{ '--delay': '0s' }}>✨</span>
                <span className="sparkle" style={{ '--delay': '0.5s' }}>⭐</span>
                <span className="sparkle" style={{ '--delay': '1s' }}>💫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
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
                    {step.status === 'current' && (
                      <div className="step-pulse"></div>
                    )}
                  </div>
                  <div className="step-info">
                    <span className="step-name">{step.name}</span>
                    {step.status !== 'locked' && (
                      <span className="step-progress">{step.progress}%</span>
                    )}
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
              {DAILY_MISSIONS.map((mission) => (
                <div key={mission.id} className={`mission-item ${mission.completed ? 'completed' : ''}`}>
                  <div className="mission-checkbox">
                    {mission.completed ? '✅' : '⬜'}
                  </div>
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

          {/* Achievement Showcase */}
          <div className="dash-card achievement-showcase">
            <div className="card-header">
              <h3 className="card-title">🏆 Achievement Showcase</h3>
              <button className="view-all-btn" onClick={() => navigate('/achievements')}>
                View All →
              </button>
            </div>
            <div className="achievement-grid">
              {BADGE_DISPLAY.slice(0, 4).map(badge => {
                const unlocked = state.badges.includes(badge.id);
                return (
                  <div key={badge.id} className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'}`}>
                    <div className="badge-icon">{badge.emoji}</div>
                    <div className="badge-name">{t(badge.nameKey)}</div>
                    {unlocked && <div className="badge-glow"></div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="dash-card statistics-section">
            <h3 className="card-title">📊 Your Progress</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-ring">
                  <ProgressRing percent={weeklyProgress} size={80} stroke={8} />
                </div>
                <div className="stat-label">Weekly Goal</div>
                <div className="stat-value">{animateStars}/200</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">⏱️</div>
                <div className="stat-label">Learning Time</div>
                <div className="stat-value">{learningTime}</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">📚</div>
                <div className="stat-label">Lessons Done</div>
                <div className="stat-value">{completedLessons}</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">🎯</div>
                <div className="stat-label">Current Level</div>
                <div className="stat-value">Level {currentLevel}</div>
              </div>
            </div>
          </div>

          {/* Parent Insights */}
          <div className="dash-card parent-insights">
            <h3 className="card-title">👨‍👩‍👧 Parent Insights</h3>
            <div className="insights-list">
              <div className="insight-item">
                <span className="insight-icon">📈</span>
                <div className="insight-content">
                  <span className="insight-label">Weekly Learning Time</span>
                  <span className="insight-value">8h 30m <span className="insight-change">+15%</span></span>
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon">✨</span>
                <div className="insight-content">
                  <span className="insight-label">Skills Improved</span>
                  <span className="insight-value">Letter Recognition, Phonics</span>
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon">🎯</span>
                <div className="insight-content">
                  <span className="insight-label">Lessons Completed</span>
                  <span className="insight-value">23 this week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="dash-card leaderboard">
            <h3 className="card-title">🥇 Weekly Leaderboard</h3>
            <div className="leaderboard-list">
              {LEADERBOARD.map((player) => {
                const userStars = player.isUser ? animateStars : player.stars;
                return (
                  <div key={player.rank} className={`leaderboard-item ${player.isUser ? 'user' : ''}`}>
                    <span className="leader-rank">#{player.rank}</span>
                    <span className="leader-avatar">{player.avatar}</span>
                    <span className="leader-name">{player.name}</span>
                    <span className="leader-stars">⭐ {userStars}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reward Store Preview */}
          <div className="dash-card reward-store">
            <h3 className="card-title">🎁 Reward Store</h3>
            <p className="card-subtitle">Spend your stars on cool items!</p>
            <div className="reward-items">
              <div className="reward-item">
                <div className="reward-icon">👑</div>
                <div className="reward-name">Golden Crown</div>
                <div className="reward-cost">⭐ 50</div>
              </div>
              <div className="reward-item">
                <div className="reward-icon">🎨</div>
                <div className="reward-name">Rainbow Theme</div>
                <div className="reward-cost">⭐ 30</div>
              </div>
              <div className="reward-item">
                <div className="reward-icon">🏅</div>
                <div className="reward-name">Certificate</div>
                <div className="reward-cost">⭐ 100</div>
              </div>
            </div>
            <button className="store-btn" onClick={() => navigate('/avatar')}>
              Visit Store →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
