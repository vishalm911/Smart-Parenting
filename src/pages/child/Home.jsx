/**
 * Home.jsx - Child Dashboard Homepage
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getUserSessions } from '../../firebase/firestoreService';
import { checkAssessmentSchedule } from '../../utils/assessmentScheduler';
import RecommendationPanel from '../../components/child/RecommendationPanel';
import MilestoneCatalogActivities from '../../components/child/MilestoneCatalogActivities';
import { getTranslation } from '../../utils/translations';
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

const ACCESSORIES = {
  hat: '🎩', crown: '👑', glasses: '👓', bow: '🎀', star: '⭐', rocket: '🚀'
};

function getAvatarEmoji(avatarId) {
  const characters = {
    'Alex': '👦', 'Priya': '👧', 'Kofi': '👦🏾', 'Luna': '👧', 'Ravi': '👦🏽', 'Mia': '👱‍♀️',
    'Ari': '🧒🏾', 'Benny': '👶', 'Amara': '👧🏾', 'Leo': '👦🏼', 'Zara': '👧🏽', 'Niko': '🧒🏽'
  };
  const muiAvatars = {
    avatar1: '🧑‍🚀', avatar2: '🚀', avatar3: '⭐', avatar4: '🪐', avatar5: '🌙',
    avatar6: '☀️', avatar7: '🌈', avatar8: '🦋', avatar9: '🧸', avatar10: '🤖',
    avatar11: '🦄', avatar12: '🐉'
  };
  return characters[avatarId] || muiAvatars[avatarId] || '👤';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useUser();
  const [animateStars, setAnimateStars] = useState(0);
  const [animateXP, setAnimateXP] = useState(0);
  // 'first-time' | 'weekly' | null
  const [assessmentModalType, setAssessmentModalType] = useState(null);
  const [learningTime, setLearningTime] = useState('0m');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ── Assessment scheduling: show first-time or weekly popup via Firestore ──
  useEffect(() => {
    if (!user?.uid) return;
    checkAssessmentSchedule(user.uid).then(({ status }) => {
      if (status === 'none') {
        setAssessmentModalType('first-time');
      } else if (status === 'due') {
        setAssessmentModalType('weekly');
      } else {
        setAssessmentModalType(null);
      }
    });
  }, [user?.uid]);

  // ── Fetch real learning time from sessions collection ──
  useEffect(() => {
    if (!user?.uid) return;
    getUserSessions(user.uid).then(({ data: sessions }) => {
      if (!sessions || sessions.length === 0) return;
      let totalMs = 0;
      const now = Date.now();
      for (const s of sessions) {
        const login = s.login_time?.toDate?.() ?? null;
        const logout = s.logout_time?.toDate?.() ?? null;
        if (login && logout) {
          totalMs += logout - login;           // completed session
        } else if (login && !logout) {
          totalMs += now - login.getTime();    // current open session
        }
      }
      const totalMin = Math.floor(totalMs / 60000);
      if (totalMin < 60) {
        setLearningTime(`${totalMin}m`);
      } else {
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        setLearningTime(m > 0 ? `${h}h ${m}m` : `${h}h`);
      }
    }).catch(() => { });
  }, [user?.uid]);

  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';
  const name = profile?.name ?? 'Explorer';
  const translatedName = name === 'Explorer' ? getTranslation('Explorer', currentLang) : name;
  const greeting = getGreeting();
  const translatedGreeting = getTranslation(greeting, currentLang);
  const dayStreak = profile?.dayStreak ?? 0;
  const badgeCount = profile?.badges ?? 0;

  useEffect(() => {
    if (!profile) return;

    const target = profile.stars ?? 0;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      setAnimateStars(current);
    }, 30);

    const xpTarget = profile.xp ?? 0;
    let xpCurrent = 0;
    const xpStep = Math.max(1, Math.floor(xpTarget / 35));
    const xpTimer = setInterval(() => {
      xpCurrent += xpStep;
      if (xpCurrent >= xpTarget) { xpCurrent = xpTarget; clearInterval(xpTimer); }
      setAnimateXP(xpCurrent);
    }, 30);

    return () => { clearInterval(timer); clearInterval(xpTimer); };
  }, [profile]);

  const MODULES = useMemo(() => {
    return [
      { id: 'assessment-module', title: getTranslation('Skill Assessment', currentLang), path: '/child/assessment?start=true', emoji: '🎯', progress: profile?.assessmentCompleted ? 100 : 0, total: 3, done: profile?.assessmentCompleted ? 3 : 0 },
      { id: 'math-world', title: getTranslation('Math World', currentLang), path: '/math-world', emoji: '🔢', progress: Math.min(100, Math.floor((profile?.progress?.mathWorld ?? 0) / 3)), total: 8, done: Math.min(8, Math.floor((profile?.progress?.mathWorld ?? 0) / 40)) },
      { id: 'puzzle-world', title: getTranslation('Puzzle World', currentLang), path: '/puzzle-world', emoji: '🧩', progress: Math.min(100, Math.floor((profile?.progress?.puzzleWorld ?? 0) / 3)), total: 8, done: Math.min(8, Math.floor((profile?.progress?.puzzleWorld ?? 0) / 40)) },
      { id: 'number-adventure', title: getTranslation('Number Adventure', currentLang), path: '/number-adventure', emoji: '🗺️', progress: Math.min(100, Math.floor((profile?.progress?.numberAdventure ?? 0) / 3)), total: 6, done: Math.min(6, Math.floor((profile?.progress?.numberAdventure ?? 0) / 50)) },
      { id: 'logic-island', title: getTranslation('Logic Island', currentLang), path: '/logic-island', emoji: '🧠', progress: Math.min(100, Math.floor((profile?.progress?.logicIsland ?? 0) / 3)), total: 6, done: Math.min(6, Math.floor((profile?.progress?.logicIsland ?? 0) / 50)) },
      { id: 'reading-world', title: getTranslation('Reading World', currentLang), path: '/child/reading-world', emoji: '📖', progress: Math.min(100, Math.floor((profile?.progress?.readingWorld ?? 0) / 3)), total: 8, done: Math.min(8, Math.floor((profile?.progress?.readingWorld ?? 0) / 40)) },
      { id: 'story-world', title: getTranslation('Story World', currentLang), path: '/child/story-world', emoji: '🌟', progress: Math.min(100, Math.floor((profile?.progress?.storyWorld ?? 0) / 3)), total: 6, done: Math.min(6, Math.floor((profile?.progress?.storyWorld ?? 0) / 50)) },
      { id: 'vocabulary-zone', title: getTranslation('Vocabulary Zone', currentLang), path: '/child/vocabulary-zone', emoji: '🔤', progress: Math.min(100, Math.floor((profile?.progress?.vocabularyZone ?? 0) / 3)), total: 8, done: Math.min(8, Math.floor((profile?.progress?.vocabularyZone ?? 0) / 40)) },
      { id: 'language-challenges', title: getTranslation('Language Challenges', currentLang), path: '/child/language-challenges', emoji: '🎯', progress: Math.min(100, Math.floor((profile?.progress?.languageChallenges ?? 0) / 3)), total: 6, done: Math.min(6, Math.floor((profile?.progress?.languageChallenges ?? 0) / 50)) },
      { id: 'brain-world', title: getTranslation('Brain World', currentLang), path: '/child/brain-world', emoji: '🧠', progress: 25, total: 4, done: 1 },
      { id: 'emotion-world', title: getTranslation('Emotion World', currentLang), path: '/child/emotion-world', emoji: '❤️', progress: 20, total: 5, done: 1 },
      { id: 'creativity-world', title: getTranslation('Creativity World', currentLang), path: '/child/creativity-world', emoji: '🎨', progress: 0, total: 4, done: 0 },
      { id: 'story-choice-world', title: getTranslation('Story Choice', currentLang), path: '/child/story-choice-world', emoji: '🎭', progress: 50, total: 2, done: 1 },
    ];
  }, [profile?.progress, profile?.assessmentCompleted, currentLang]);

  const recommendation = useMemo(() => {
    if (!profile) return { title: getTranslation('Logic Island', currentLang), subtitle: getTranslation('Sharpen your brain with logic challenges!', currentLang), path: '/logic-island', emoji: '🧠' };
    const prog = profile.progress || {};
    const mw = prog.mathWorld ?? 0;
    const pw = prog.puzzleWorld ?? 0;
    const na = prog.numberAdventure ?? 0;
    const li = prog.logicIsland ?? 0;

    const minVal = Math.min(mw, pw, na, li);
    if (minVal === mw) {
      return { title: getTranslation('Math World', currentLang), subtitle: getTranslation('Learn numbers & simple counting!', currentLang), path: '/math-world', emoji: '🔢' };
    } else if (minVal === pw) {
      return { title: getTranslation('Puzzle World', currentLang), subtitle: getTranslation('Train your brain with 3D shapes!', currentLang), path: '/puzzle-world', emoji: '🧩' };
    } else if (minVal === na) {
      return { title: getTranslation('Number Adventure', currentLang), subtitle: getTranslation('Explore the map of numbers!', currentLang), path: '/number-adventure', emoji: '🗺️' };
    } else {
      return { title: getTranslation('Logic Island', currentLang), subtitle: getTranslation('Solve patterns and multiplication quests!', currentLang), path: '/logic-island', emoji: '🧠' };
    }
  }, [profile, currentLang]);

  return (
    <div className="dashboard-page">
      {/* Top Navigation Bar */}
      <div className="dashboard-topnav">
        <div className="topnav-left">
          <div className="topnav-greeting">
            <h2>{translatedGreeting}, {translatedName} 👋</h2>
          </div>
          <button className="dashboard-assessment-btn" onClick={() => navigate('/child/assessment?start=true')}>
            🎯 {getTranslation('Assessment', currentLang)}
          </button>
        </div>
        <div className="topnav-right">
          <div className="topnav-stat" title={getTranslation('Streak', currentLang)}>
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{dayStreak}</span>
            <span className="stat-label">{getTranslation('Streak', currentLang)}</span>
          </div>
          <div className="topnav-stat" title={getTranslation('Stars', currentLang)}>
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{animateStars}</span>
            <span className="stat-label">{getTranslation('Stars', currentLang)}</span>
          </div>
          <div className="topnav-stat" title={getTranslation('Badges', currentLang)}>
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{badgeCount}</span>
            <span className="stat-label">{getTranslation('Badges', currentLang)}</span>
          </div>
          <div className="topnav-stat" title={getTranslation('XP Progress', currentLang)}>
            <span className="stat-icon">⚡</span>
            <span className="stat-value">{animateXP}</span>
            <span className="stat-label">{getTranslation('XP', currentLang)}</span>
          </div>
          <button
            className="topnav-profile-btn"
            onClick={() => setShowProfileModal(true)}
            title={getTranslation('My Profile', currentLang)}
          >
            <div className="profile-btn-avatar">
              {getAvatarEmoji(profile?.avatar)}
              {profile?.accessory && (
                <span className="profile-btn-accessory">
                  {ACCESSORIES[profile.accessory]}
                </span>
              )}
            </div>
            <span className="profile-btn-text">{getTranslation('My Profile', currentLang)}</span>
          </button>
        </div>
      </div>

      <div className="dashboard-inner">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-card" onClick={() => navigate(recommendation.path)}>
            <div className="hero-content">
              <div className="hero-badge">{getTranslation('Continue Learning', currentLang)}</div>
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
              <p className="hero-time">⏱️ {getTranslation('Estimated Time', currentLang)}: 10 {getTranslation('minutes remaining', currentLang)}</p>
              <button className="hero-btn">{getTranslation('Continue Journey →', currentLang)}</button>
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

        {/* AI Activity Recommendations — shown after milestone assessment */}
        <RecommendationPanel childId={user?.uid} />

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Learning Journey Map */}
          <div className="dash-card journey-map">
            <h3 className="card-title">🗺️ {getTranslation('Learning Journey', currentLang)}</h3>
            <div className="journey-path">
              {LEARNING_PATH.map((step, index) => (
                <div key={step.id} className="journey-step">
                  <div className={`step-node ${step.status}`}>
                    <span className="step-icon">{step.icon}</span>
                    {step.status === 'unlocked' && <span className="step-check">✓</span>}
                    {step.status === 'current' && <div className="step-pulse"></div>}
                  </div>
                  <div className="step-info">
                    <span className="step-name">{getTranslation(step.name, currentLang)}</span>
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
            <h3 className="card-title">✅ {getTranslation('Daily Missions', currentLang)}</h3>
            <div className="missions-list">
              {DAILY_MISSIONS.map(mission => (
                <div key={mission.id} className={`mission-item ${mission.completed ? 'completed' : ''}`}>
                  <div className="mission-checkbox">{mission.completed ? '✅' : '⬜'}</div>
                  <div className="mission-text">{getTranslation(mission.task, currentLang)}</div>
                  <div className="mission-reward">+{mission.xp} XP</div>
                </div>
              ))}
            </div>
            <div className="missions-reward">
              <span className="reward-text">{getTranslation('Complete all for bonus:', currentLang)}</span>
              <span className="reward-value">+20 XP 🎁</span>
            </div>
          </div>

          {/* Explore Worlds */}
          <div className="dash-card explore-worlds">
            <h3 className="card-title">🌍 {getTranslation('Explore Worlds', currentLang)}</h3>
            <div className="module-grid">
              {MODULES.map(mod => (
                <div key={mod.id} className="module-card" onClick={() => navigate(mod.path)}>
                  <span className="module-emoji">{mod.emoji}</span>
                  <div className="module-info">
                    <h4 className="module-name">{mod.title}</h4>
                    <span className="module-lessons">{mod.done}/{mod.total} {getTranslation('lessons', currentLang)}</span>
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
            <h3 className="card-title">📊 {getTranslation('Your Progress', currentLang)}</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon-large">⏱️</div>
                <div className="stat-label">{getTranslation('Learning Time', currentLang)}</div>
                <div className="stat-value">{learningTime}</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">📚</div>
                <div className="stat-label">{getTranslation('Lessons Done', currentLang)}</div>
                <div className="stat-value">{MODULES.reduce((sum, m) => sum + m.done, 0)}</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">🎯</div>
                <div className="stat-label">{getTranslation('Current Level', currentLang)}</div>
                <div className="stat-value">{getTranslation('Level', currentLang)} {profile?.milestone_level ?? profile?.level ?? 1}</div>
              </div>
              <div className="stat-box">
                <div className="stat-icon-large">🧩</div>
                <div className="stat-label">{getTranslation('Puzzles Solved', currentLang)}</div>
                <div className="stat-value">{Math.floor((profile?.progress?.puzzleWorld ?? 0) / 10)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Catalog Activities - For ages 0-36 months */}
        <MilestoneCatalogActivities />
      </div>

      {/* Assessment Modal Popup — first-time or weekly */}
      {assessmentModalType && (
        <div className="assessment-modal-overlay">
          <div className="assessment-modal-card">
            {assessmentModalType === 'first-time' ? (
              <>
                <span className="assessment-modal-decor">🧑‍🚀</span>
                <h2 className="assessment-modal-title">{getTranslation('Welcome, Explorer!', currentLang)}</h2>
                <p className="assessment-modal-text">
                  {getTranslation("Before we begin our learning journey, let's complete a quick and fun skill assessment!", currentLang)}
                </p>
              </>
            ) : (
              <>
                <span className="assessment-modal-decor">📋</span>
                <h2 className="assessment-modal-title">{getTranslation("Time for Your Weekly Check-in!", currentLang)}</h2>
                <p className="assessment-modal-text">
                  {getTranslation("It's been a week! Take a short assessment to track your progress and unlock new activities.", currentLang)}
                </p>
              </>
            )}
            <button
              className="assessment-modal-btn"
              onClick={() => {
                setAssessmentModalType(null);
                navigate('/child/assessment?start=true');
              }}
            >
              {assessmentModalType === 'first-time' ? getTranslation('🚀 Start Assessment', currentLang) : getTranslation('🎯 Take Weekly Assessment', currentLang)}
            </button>
            {assessmentModalType === 'weekly' && (
              <button
                className="assessment-modal-skip"
                onClick={() => setAssessmentModalType(null)}
              >
                {getTranslation('Maybe Later', currentLang)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setShowProfileModal(false)}>
              ✕
            </button>

            <div className="profile-modal-content">
              <h2 className="profile-modal-title">👤 {getTranslation('My Profile', currentLang)}</h2>

              <div className="profile-content">
                {/* Avatar Section */}
                <div className="profile-avatar-section">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-large">
                      {getAvatarEmoji(profile?.avatar)}
                      {profile?.accessory && (
                        <span className="profile-accessory">
                          {ACCESSORIES[profile.accessory]}
                        </span>
                      )}
                    </div>
                    <button
                      className="profile-edit-avatar-btn"
                      onClick={() => {
                        setShowProfileModal(false);
                        navigate('/child/avatar');
                      }}
                    >
                      ✏️ {getTranslation('Customize Avatar', currentLang)}
                    </button>
                  </div>

                  {/* Quick Stats - Moved below Customize Avatar */}
                  <div className="profile-quick-stats">
                    <div className="profile-stat-item">
                      <span className="profile-stat-icon">⭐</span>
                      <span className="profile-stat-value">{animateStars}</span>
                      <span className="profile-stat-label">{getTranslation('Stars', currentLang)}</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="profile-stat-icon">⚡</span>
                      <span className="profile-stat-value">{animateXP}</span>
                      <span className="profile-stat-label">{getTranslation('XP', currentLang)}</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="profile-stat-icon">🔥</span>
                      <span className="profile-stat-value">{dayStreak}</span>
                      <span className="profile-stat-label">{getTranslation('Streak', currentLang)}</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="profile-stat-icon">⏱️</span>
                      <span className="profile-stat-value">{learningTime}</span>
                      <span className="profile-stat-label">{getTranslation('Time', currentLang)}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="profile-details-section">
                  <div className="profile-detail-row">
                    <span className="profile-detail-icon">📛</span>
                    <div className="profile-detail-info">
                      <span className="profile-detail-label">{getTranslation('Name', currentLang)}</span>
                      <span className="profile-detail-value">{profile?.name || getTranslation('Explorer', currentLang)}</span>
                    </div>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-detail-icon">🎂</span>
                    <div className="profile-detail-info">
                      <span className="profile-detail-label">{getTranslation('Age Group', currentLang)}</span>
                      <span className="profile-detail-value">
                        {profile?.age_group ? `${getTranslation('Age', currentLang)} ${profile.age_group}` : getTranslation('Not set', currentLang)}
                        {profile?.age_months && ` (${profile.age_months} ${getTranslation('months', currentLang)})`}
                      </span>
                    </div>
                  </div>

                  {profile?.date_of_birth && (
                    <div className="profile-detail-row">
                      <span className="profile-detail-icon">📅</span>
                      <div className="profile-detail-info">
                        <span className="profile-detail-label">{getTranslation('Date of Birth', currentLang)}</span>
                        <span className="profile-detail-value">
                          {new Date(profile.date_of_birth).toLocaleDateString(currentLang === 'हिंदी' ? 'hi-IN' : currentLang === 'मराठी' ? 'mr-IN' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="profile-detail-row">
                    <span className="profile-detail-icon">🎓</span>
                    <div className="profile-detail-info">
                      <span className="profile-detail-label">{getTranslation('Current Level', currentLang)}</span>
                      <span className="profile-detail-value">
                        {getTranslation('Level', currentLang)} {profile?.milestone_level ?? profile?.level ?? 1}
                      </span>
                    </div>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-detail-icon">🏅</span>
                    <div className="profile-detail-info">
                      <span className="profile-detail-label">{getTranslation('Achievements', currentLang)}</span>
                      <span className="profile-detail-value">
                        {profile?.badges?.length ?? 0} {getTranslation('Badges', currentLang)}
                      </span>
                    </div>
                  </div>

                  <div className="profile-detail-row">
                    <span className="profile-detail-icon">🪙</span>
                    <div className="profile-detail-info">
                      <span className="profile-detail-label">{getTranslation('Coins', currentLang)}</span>
                      <span className="profile-detail-value">
                        {profile?.coin_count ?? 0} {getTranslation('coins', currentLang)}
                      </span>
                    </div>
                  </div>

                  {profile?.parent_uid && (
                    <div className="profile-detail-row">
                      <span className="profile-detail-icon">👪</span>
                      <div className="profile-detail-info">
                        <span className="profile-detail-label">{getTranslation('Parent Account', currentLang)}</span>
                        <span className="profile-detail-value">
                          {getTranslation('Connected', currentLang)}
                        </span>
                      </div>
                    </div>
                  )}

                  {profile?.created_at && (
                    <div className="profile-detail-row">
                      <span className="profile-detail-icon">🌟</span>
                      <div className="profile-detail-info">
                        <span className="profile-detail-label">{getTranslation('Member Since', currentLang)}</span>
                        <span className="profile-detail-value">
                          {new Date(profile.created_at.toDate ? profile.created_at.toDate() : profile.created_at).toLocaleDateString(currentLang === 'हिंदी' ? 'hi-IN' : currentLang === 'मराठी' ? 'mr-IN' : 'en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}