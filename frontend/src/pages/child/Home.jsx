import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getUserSessions } from '../../api/userService';
import { checkAssessmentSchedule } from '../../utils/assessmentScheduler';
import { awardProgress } from '../../api/services';
import RecommendationPanel from '../../components/child/RecommendationPanel';
import MilestoneCatalogActivities from '../../components/child/MilestoneCatalogActivities';
import { getTranslation } from '../../utils/translations';
import { useApp } from '../../context/AppContext';
import './Home.css';

const LEARNING_JOURNEY_ROADMAP = [
  { id: 'assessment-module', name: 'Skill Assessment', icon: '🎯', path: '/child/assessment?start=true', progressKey: 'assessmentCompleted' },
  { id: 'math-world', name: 'Math World', icon: '🔢', path: '/math-world', progressKey: 'mathWorld' },
  { id: 'puzzle-world', name: 'Puzzle World', icon: '🧩', path: '/puzzle-world', progressKey: 'puzzleWorld' },
  { id: 'number-adventure', name: 'Number Adventure', icon: '🗺️', path: '/number-adventure', progressKey: 'numberAdventure' },
  { id: 'logic-island', name: 'Logic Island', icon: '🧠', path: '/logic-island', progressKey: 'logicIsland' },
  { id: 'reading-world', name: 'Reading World', icon: '📖', path: '/child/reading-world', progressKey: 'readingWorld' },
  { id: 'story-world', name: 'Story World', icon: '🌟', path: '/child/story-world', progressKey: 'storyWorld' },
  { id: 'vocabulary-zone', name: 'Vocabulary Zone', icon: '🔤', path: '/child/vocabulary-zone', progressKey: 'vocabularyZone' },
  { id: 'language-challenges', name: 'Language Challenges', icon: '🎯', path: '/child/language-challenges', progressKey: 'languageChallenges' },
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
    avatar1: '🧒', avatar2: '👦', avatar3: '👧', avatar4: '🧑', avatar5: '👶',
    avatar6: '🦸', avatar7: '🧙', avatar8: '🦊', avatar9: '🐼', avatar10: '🦁',
    avatar11: '🐸', avatar12: '🚀'
  };
  return characters[avatarId] || muiAvatars[avatarId] || '👤';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function getJourneyProgress(profile, step) {
  if (step.progressKey === 'assessmentCompleted') {
    return profile?.assessmentCompleted ? 100 : 0;
  }

  const rawProgress = profile?.progress?.[step.progressKey];
  if (typeof rawProgress !== 'number' || Number.isNaN(rawProgress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.floor(rawProgress)));
}

function buildLearningJourney(profile) {
  const steps = LEARNING_JOURNEY_ROADMAP.map((step) => ({
    ...step,
    progress: getJourneyProgress(profile, step),
  }));

  const currentIndex = steps.findIndex((step) => step.progress < 100);
  const activeIndex = currentIndex === -1 ? steps.length - 1 : currentIndex;

  return steps.map((step, index) => ({
    ...step,
    status: index < activeIndex ? 'unlocked' : index === activeIndex ? 'current' : 'locked',
  }));
}

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useUser();
  const { featureFlags } = useApp();
  const [animateStars, setAnimateStars] = useState(0);
  const [animateXP, setAnimateXP] = useState(0);
  // 'first-time' | 'weekly' | null
  const [assessmentModalType, setAssessmentModalType] = useState(null);
  const [learningTime, setLearningTime] = useState('0m');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [missions, setMissions] = useState([]);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  const childId = profile?._id || profile?.id || user?._id || user?.id;

  // ── Seeding Daily Markers ──
  useEffect(() => {
    if (!childId || !profile) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const markerKey = `spaceece_markers_date_${childId}`;
    const storedDate = localStorage.getItem(markerKey);
    if (storedDate !== todayStr) {
      localStorage.setItem(markerKey, todayStr);
      localStorage.setItem(`spaceece_start_stars_${childId}`, String(profile.stars || 0));
      localStorage.setItem(`spaceece_start_math_${childId}`, String(profile.progress?.mathWorld || 0));
      localStorage.setItem(`spaceece_start_story_${childId}`, String(profile.progress?.storyWorld || 0));
      localStorage.setItem(`spaceece_start_words_${childId}`, String(profile.progress?.vocabularyZone || 0));
      localStorage.setItem(`spaceece_start_brain_${childId}`, String(profile.progress?.logicIsland || 0));
      localStorage.setItem(`spaceece_start_draw_${childId}`, String(profile.progress?.creativityWorld || 0));
    }
  }, [childId, profile]);

  // ── Generate/Load Daily Missions ──
  useEffect(() => {
    if (!childId) return;
    const missionKey = `spaceece_missions_${childId}`;
    const stored = localStorage.getItem(missionKey);
    const todayStr = new Date().toISOString().split('T')[0];

    let needGen = true;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === todayStr && Array.isArray(parsed.items)) {
          setMissions(parsed.items);
          setBonusClaimed(parsed.bonusClaimed || false);
          needGen = false;
        }
      } catch {}
    }

    if (needGen) {
      const pool = [
        { id: 'math', task: 'Solve a Math Puzzle', target: 1, current: 0, xp: 20, link: '/math-world', icon: '🔢', rewardClaimed: false },
        { id: 'story', task: 'Read an Adventure Story', target: 1, current: 0, xp: 15, link: '/child/story-world', icon: '🌟', rewardClaimed: false },
        { id: 'stars', task: 'Earn 3 Stars', target: 3, current: 0, xp: 15, link: '/child/explore', icon: '⭐', rewardClaimed: false },
        { id: 'words', task: 'Learn 5 Vocabulary Words', target: 5, current: 0, xp: 20, link: '/child/vocabulary-zone', icon: '🔤', rewardClaimed: false },
        { id: 'brain', task: 'Train on Logic Island', target: 1, current: 0, xp: 15, link: '/logic-island', icon: '🧠', rewardClaimed: false },
        { id: 'draw', task: 'Create a Drawing', target: 1, current: 0, xp: 15, link: '/child/creativity-world', icon: '🎨', rewardClaimed: false },
      ];
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      const data = { date: todayStr, items: selected, bonusClaimed: false };
      localStorage.setItem(missionKey, JSON.stringify(data));
      setMissions(selected);
      setBonusClaimed(false);
    }
  }, [childId]);

  // ── Auto Check Progress ──
  useEffect(() => {
    if (!profile || !childId || missions.length === 0) return;
    const missionKey = `spaceece_missions_${childId}`;
    const stored = localStorage.getItem(missionKey);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      let updated = false;

      const newMissions = missions.map(m => {
        if (m.current >= m.target) return m;
        let newCurrent = m.current;

        if (m.id === 'stars') {
          const startStars = Number(localStorage.getItem(`spaceece_start_stars_${childId}`)) || profile.stars || 0;
          const earned = Math.max(0, (profile.stars || 0) - startStars);
          newCurrent = Math.min(m.target, earned);
        } else if (m.id === 'math') {
          const startMath = Number(localStorage.getItem(`spaceece_start_math_${childId}`)) || 0;
          const currentMath = profile.progress?.mathWorld || 0;
          if (currentMath > startMath) newCurrent = m.target;
        } else if (m.id === 'story') {
          const startStory = Number(localStorage.getItem(`spaceece_start_story_${childId}`)) || 0;
          const currentStory = profile.progress?.storyWorld || 0;
          if (currentStory > startStory) newCurrent = m.target;
        } else if (m.id === 'words') {
          const startWords = Number(localStorage.getItem(`spaceece_start_words_${childId}`)) || 0;
          const currentWords = profile.progress?.vocabularyZone || 0;
          const diff = Math.max(0, currentWords - startWords);
          if (diff > 0) newCurrent = Math.min(m.target, diff * 5);
        } else if (m.id === 'brain') {
          const startBrain = Number(localStorage.getItem(`spaceece_start_brain_${childId}`)) || 0;
          const currentBrain = profile.progress?.logicIsland || 0;
          if (currentBrain > startBrain) newCurrent = m.target;
        } else if (m.id === 'draw') {
          const startDraw = Number(localStorage.getItem(`spaceece_start_draw_${childId}`)) || 0;
          const currentDraw = profile.progress?.creativityWorld || 0;
          if (currentDraw > startDraw) newCurrent = m.target;
        }

        if (newCurrent !== m.current) {
          updated = true;
          return { ...m, current: newCurrent };
        }
        return m;
      });

      if (updated) {
        const updatedData = { ...data, items: newMissions };
        localStorage.setItem(missionKey, JSON.stringify(updatedData));
        setMissions(newMissions);
      }
    } catch {}
  }, [profile, childId, missions]);

  const handleClaimReward = async (missionId) => {
    if (!childId) return;
    const missionKey = `spaceece_missions_${childId}`;
    const stored = localStorage.getItem(missionKey);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      const missionToAward = missions.find(m => m.id === missionId && m.current >= m.target && !m.rewardClaimed);
      if (missionToAward) {
        await awardProgress(childId, { xp: missionToAward.xp });
      }

      const updatedMissions = missions.map(m => {
        if (m.id === missionId && m.current >= m.target && !m.rewardClaimed) {
          return { ...m, rewardClaimed: true };
        }
        return m;
      });
      const updatedData = { ...data, items: updatedMissions };
      localStorage.setItem(missionKey, JSON.stringify(updatedData));
      setMissions(updatedMissions);
      if (refreshProfile) await refreshProfile();
    } catch {}
  };

  const handleSimulateMission = async (missionId) => {
    if (!childId) return;
    const missionKey = `spaceece_missions_${childId}`;
    const stored = localStorage.getItem(missionKey);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      const updatedMissions = missions.map(m => {
        if (m.id === missionId) {
          return { ...m, current: m.target };
        }
        return m;
      });
      const updatedData = { ...data, items: updatedMissions };
      localStorage.setItem(missionKey, JSON.stringify(updatedData));
      setMissions(updatedMissions);
    } catch {}
  };

  const handleClaimBonus = async () => {
    if (!childId || bonusClaimed) return;
    const missionKey = `spaceece_missions_${childId}`;
    const stored = localStorage.getItem(missionKey);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      await awardProgress(childId, { xp: 20 });
      const updatedData = { ...data, bonusClaimed: true };
      localStorage.setItem(missionKey, JSON.stringify(updatedData));
      setBonusClaimed(true);
      if (refreshProfile) refreshProfile();
    } catch {}
  };

  // ── Assessment scheduling: show first-time or weekly popup via database ──
  useEffect(() => {
    if (!childId) return;
    checkAssessmentSchedule(childId).then(({ status }) => {
      if (status === 'none') {
        setAssessmentModalType('first-time');
      } else if (status === 'due') {
        setAssessmentModalType('weekly');
      } else {
        setAssessmentModalType(null);
      }
    });
  }, [childId]);

  // ── Fetch real learning time from sessions collection ──
  useEffect(() => {
    if (!childId) return;
    getUserSessions(childId).then(({ data: sessions }) => {
      if (!sessions || sessions.length === 0) return;
      let totalMs = 0;
      const now = Date.now();
      for (const s of sessions) {
        const login = s.started_at ? new Date(s.started_at) : null;
        const logout = s.ended_at ? new Date(s.ended_at) : null;
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
  }, [childId]);

  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';
  const name = profile?.name ?? 'Explorer';
  const translatedName = name === 'Explorer' ? getTranslation('Explorer', currentLang) : name;
  const greeting = getGreeting();
  const translatedGreeting = getTranslation(greeting, currentLang);
  const dayStreak = profile?.dayStreak ?? 0;
  const badgeCount = profile?.badges ? (Array.isArray(profile.badges) ? profile.badges.length : Number(profile.badges) || 0) : 0;
  const learningJourney = useMemo(() => buildLearningJourney(profile), [profile]);

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
    const prog = profile?.progress || {};
    return [
      { id: 'assessment-module', title: getTranslation('Skill Assessment', currentLang), path: '/child/assessment?start=true', emoji: '🎯', progress: profile?.assessmentCompleted ? 100 : 0, total: 3, done: profile?.assessmentCompleted ? 3 : 0 },
      { id: 'math-world', title: getTranslation('Math World', currentLang), path: '/math-world', emoji: '🔢', progress: Math.min(100, Math.floor(((prog.mathWorld ?? 0) / 320) * 100)), total: 8, done: Math.min(8, Math.floor((prog.mathWorld ?? 0) / 40)) },
      { id: 'puzzle-world', title: getTranslation('Puzzle World', currentLang), path: '/puzzle-world', emoji: '🧩', progress: Math.min(100, Math.floor(((prog.puzzleWorld ?? 0) / 320) * 100)), total: 8, done: Math.min(8, Math.floor((prog.puzzleWorld ?? 0) / 40)) },
      { id: 'number-adventure', title: getTranslation('Number Adventure', currentLang), path: '/number-adventure', emoji: '🗺️', progress: Math.min(100, Math.floor(((prog.numberAdventure ?? 0) / 300) * 100)), total: 6, done: Math.min(6, Math.floor((prog.numberAdventure ?? 0) / 50)) },
      { id: 'logic-island', title: getTranslation('Logic Island', currentLang), path: '/logic-island', emoji: '🧠', progress: Math.min(100, Math.floor(((prog.logicIsland ?? 0) / 300) * 100)), total: 6, done: Math.min(6, Math.floor((prog.logicIsland ?? 0) / 50)) },
      { id: 'reading-world', title: getTranslation('Reading World', currentLang), path: '/child/reading-world', emoji: '📖', progress: Math.min(100, Math.floor(((prog.readingWorld ?? 0) / 320) * 100)), total: 8, done: Math.min(8, Math.floor((prog.readingWorld ?? 0) / 40)) },
      { id: 'story-world', title: getTranslation('Story World', currentLang), path: '/child/story-world', emoji: '🌟', progress: Math.min(100, Math.floor(((prog.storyWorld ?? 0) / 300) * 100)), total: 6, done: Math.min(6, Math.floor((prog.storyWorld ?? 0) / 50)) },
      { id: 'vocabulary-zone', title: getTranslation('Vocabulary Zone', currentLang), path: '/child/vocabulary-zone', emoji: '🔤', progress: Math.min(100, Math.floor(((prog.vocabularyZone ?? 0) / 320) * 100)), total: 8, done: Math.min(8, Math.floor((prog.vocabularyZone ?? 0) / 40)) },
      { id: 'language-challenges', title: getTranslation('Language Challenges', currentLang), path: '/child/language-challenges', emoji: '🎯', progress: Math.min(100, Math.floor(((prog.languageChallenges ?? 0) / 300) * 100)), total: 6, done: Math.min(6, Math.floor((prog.languageChallenges ?? 0) / 50)) },
      { id: 'brain-world', title: getTranslation('Brain World', currentLang), path: '/child/brain-world', emoji: '🧠', progress: 0, total: 4, done: 0 },
      { id: 'emotion-world', title: getTranslation('Emotion World', currentLang), path: '/child/emotion-world', emoji: '❤️', progress: 0, total: 5, done: 0 },
      { id: 'creativity-world', title: getTranslation('Creativity World', currentLang), path: '/child/creativity-world', emoji: '🎨', progress: 0, total: 4, done: 0 },
      { id: 'story-choice-world', title: getTranslation('Story Choice', currentLang), path: '/child/story-choice-world', emoji: '🎭', progress: 0, total: 2, done: 0 },
    ];
  }, [profile?.progress, profile?.assessmentCompleted, currentLang]);

  const recommendation = useMemo(() => {
    if (!profile) return { id: 'logic-island', title: getTranslation('Logic Island', currentLang), subtitle: getTranslation('Sharpen your brain with logic challenges!', currentLang), path: '/logic-island', emoji: '🧠' };
    const prog = profile.progress || {};
    const mw = prog.mathWorld ?? 0;
    const pw = prog.puzzleWorld ?? 0;
    const na = prog.numberAdventure ?? 0;
    const li = prog.logicIsland ?? 0;

    const minVal = Math.min(mw, pw, na, li);
    if (minVal === mw) {
      return { id: 'math-world', title: getTranslation('Math World', currentLang), subtitle: getTranslation('Learn numbers & simple counting!', currentLang), path: '/math-world', emoji: '🔢' };
    } else if (minVal === pw) {
      return { id: 'puzzle-world', title: getTranslation('Puzzle World', currentLang), subtitle: getTranslation('Train your brain with 3D shapes!', currentLang), path: '/puzzle-world', emoji: '🧩' };
    } else if (minVal === na) {
      return { id: 'number-adventure', title: getTranslation('Number Adventure', currentLang), subtitle: getTranslation('Explore the map of numbers!', currentLang), path: '/number-adventure', emoji: '🗺️' };
    } else {
      return { id: 'logic-island', title: getTranslation('Logic Island', currentLang), subtitle: getTranslation('Solve patterns and multiplication quests!', currentLang), path: '/logic-island', emoji: '🧠' };
    }
  }, [profile, currentLang]);

  const recommendedModule = useMemo(() => {
    return MODULES.find(m => m.id === recommendation.id);
  }, [MODULES, recommendation]);

  const recProgress = recommendedModule ? recommendedModule.progress : 35;
  const recDone = recommendedModule ? recommendedModule.done : 0;
  const recTotal = recommendedModule ? recommendedModule.total : 8;
  const recTimeRemaining = Math.max(0, (recTotal - recDone) * 5);

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
                  <div className="hero-progress-fill" style={{ width: `${recProgress}%` }}>
                    <span className="progress-glow"></span>
                  </div>
                </div>
                <span className="hero-progress-text">{recProgress}% Complete</span>
              </div>
              <p className="hero-time">⏱️ {getTranslation('Estimated Time', currentLang)}: {recTimeRemaining} {getTranslation('minutes remaining', currentLang)}</p>
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
        <RecommendationPanel childId={childId} />

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Learning Journey Map */}
          <div className="dash-card journey-map">
            <h3 className="card-title">🗺️ {getTranslation('Learning Journey', currentLang)}</h3>
            {!profile && (
              <div className="journey-empty-state">
                {getTranslation('Loading your journey...', currentLang)}
              </div>
            )}
            <div className="journey-path">
              {learningJourney.map((step, index) => (
                <div key={step.id} className="journey-step">
                  <div
                    className={`step-node ${step.status}`}
                    onClick={() => step.path && navigate(step.path)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && step.path && navigate(step.path)}
                  >
                    <span className="step-icon">{step.icon}</span>
                    {step.status === 'unlocked' && <span className="step-check">✓</span>}
                    {step.status === 'current' && <div className="step-pulse"></div>}
                  </div>
                  <div className="step-info">
                    <span className="step-name">{getTranslation(step.name, currentLang)}</span>
                    {step.status !== 'locked' && <span className="step-progress">{step.progress}%</span>}
                  </div>
                  {index < learningJourney.length - 1 && (
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
              {missions.map(mission => {
                const isDone = mission.current >= mission.target;
                const isClaimed = mission.rewardClaimed;
                return (
                  <div key={mission.id || mission.task} className={`mission-item ${isDone ? 'completed' : ''}`}>
                    <span className="mission-checkbox" style={{ fontSize: '1.4rem' }}>
                      {mission.icon}
                    </span>
                    <div className="mission-text" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                        {getTranslation(mission.task, currentLang)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                        Progress: {mission.current}/{mission.target}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Go Play button */}
                      {!isDone && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <button
                            className="btn-orange"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '999px' }}
                            onClick={() => navigate(mission.link)}
                          >
                            Play 🚀
                          </button>
                        </div>
                      )}

                      {/* Claim reward button */}
                      {isDone && !isClaimed && (
                        <button
                          className="btn-orange"
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            borderRadius: '999px',
                            background: 'linear-gradient(135deg, #FF9800, #E91E8C)',
                            boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)'
                          }}
                          onClick={() => handleClaimReward(mission.id)}
                        >
                          Claim 🎁
                        </button>
                      )}

                      {/* Claimed state */}
                      {isClaimed && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2E7D32' }}>
                          Claimed ✅
                        </span>
                      )}

                      <div className="mission-reward">+{mission.xp} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bonus Box */}
            {missions.length > 0 && (
              <div 
                className="missions-reward"
                style={{
                  background: bonusClaimed ? '#E8F5E9' : (missions.every(m => m.rewardClaimed) ? 'linear-gradient(135deg, #FFFDF0, #FFE699)' : '#FFF9F2'),
                  borderColor: bonusClaimed ? '#A5D6A7' : (missions.every(m => m.rewardClaimed) ? '#F5A623' : '#FFD9B3')
                }}
              >
                {bonusClaimed ? (
                  <>
                    <span className="reward-text" style={{ color: '#2E7D32' }}>🎁 All daily missions completed!</span>
                    <span className="reward-value" style={{ color: '#2E7D32' }}>Done 🎉</span>
                  </>
                ) : missions.every(m => m.rewardClaimed) ? (
                  <button
                    className="btn-orange"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 900,
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, #F5A623, #FF5E36)'
                    }}
                    onClick={handleClaimBonus}
                  >
                    Claim Bonus Chest 🎁 (+20 XP!)
                  </button>
                ) : (
                  <>
                    <span className="reward-text">{getTranslation('Complete all for bonus:', currentLang)}</span>
                    <span className="reward-value">+20 XP 🎁</span>
                  </>
                )}
              </div>
            )}
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
                    {featureFlags?.enableAvatarCustomization !== false && (
                      <button
                        className="profile-edit-avatar-btn"
                        onClick={() => {
                          setShowProfileModal(false);
                          navigate('/child/avatar');
                        }}
                      >
                        ✏️ {getTranslation('Customize Avatar', currentLang)}
                      </button>
                    )}
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