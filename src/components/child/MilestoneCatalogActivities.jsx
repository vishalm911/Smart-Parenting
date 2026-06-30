/**
 * MilestoneCatalogActivities.jsx
 * Displays the comprehensive Milestone-Wise E-Activity & Educational Game Catalog
 * for children aged 0-36 months (ages 0-3 years)
 * Only renders if child's age_months is between 0-36
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { getActivitiesForAge, MILESTONE_ACTIVITIES_CATALOG } from '../../data/milestoneActivitiesCatalog';
import { awardProgress } from '../../firebase/services';
import './MilestoneCatalogActivities.css';

// Domain information with icons, titles, and theme colors
const DOMAIN_INFO = {
  physical: { name: 'Physical Development', icon: '🏃', color: '#10B981', desc: 'Motor skills, coordination, and physical health' },
  social: { name: 'Social Development', icon: '👥', color: '#3B82F6', desc: 'Interaction, sharing, and peer relationship' },
  emotional: { name: 'Emotional Development', icon: '❤️', color: '#EF4444', desc: 'Self-awareness, regulation, and empathy' },
  cognitive: { name: 'Cognitive Development', icon: '🧠', color: '#8B5CF6', desc: 'Problem solving, memory, and logical thinking' },
  aesthetic: { name: 'Aesthetic Development', icon: '🎨', color: '#F59E0B', desc: 'Sensory play, music, and art exploration' }
};

export default function MilestoneCatalogActivities() {
  const { profile, refreshProfile } = useUser();

  // State hooks
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('spaceece_bookmarked_milestones');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState('');
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationSuccess, setSimulationSuccess] = useState(false);
  const [activeParticles, setActiveParticles] = useState([]);

  // Game states
  const [gameScore, setGameScore] = useState(0);
  const [gameItems, setGameItems] = useState([]);
  const [gameStatus, setGameStatus] = useState('');
  const [gameActive, setGameActive] = useState('');

  // Auto-timer for Sit & Explore
  useEffect(() => {
    let interval;
    if (activeSimulation) {
      const key = (activeSimulation.name || activeSimulation.eActivity || '').toLowerCase();
      const isSitExplore = key.includes('sit') && key.includes('explore');
      if (isSitExplore && !simulationSuccess) {
        interval = setInterval(() => {
          setGameScore(prev => {
            const nextScore = prev + 1;
            const nextProgress = Math.min(100, nextScore * 10);
            setSimulationProgress(nextProgress);
            
            if (nextScore === 10) {
              handleSimulationComplete();
              clearInterval(interval);
            }
            return nextScore;
          });
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [activeSimulation, simulationSuccess]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleBookmark = (activityName) => {
    let newBookmarks;
    if (bookmarks.includes(activityName)) {
      newBookmarks = bookmarks.filter(b => b !== activityName);
      showToast(`Removed "${activityName}" from bookmarks`);
    } else {
      newBookmarks = [...bookmarks, activityName];
      showToast(`Saved "${activityName}" to bookmarks!`);
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('spaceece_bookmarked_milestones', JSON.stringify(newBookmarks));
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        const startTime = audioCtx.currentTime + index * 0.15;
        osc.start(startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulationComplete = async () => {
    setSimulationSuccess(true);
    playSuccessSound();
    
    if (profile?.id) {
      const success = await awardProgress(profile.id, {
        xp: 20,
        stars: 5,
        coins: 10,
        module: 'milestone-activities'
      });
      if (success) {
        refreshProfile();
      }
    }
  };

  const getActivityKey = (activity) => {
    if (!activity) return 'generic';
    const title = (activity.name || activity.eActivity || '').toLowerCase();
    if (title.includes('tummy') || title.includes('head-up')) return 'tummy-time';
    if (title.includes('compass') || title.includes('sound')) return 'sound-compass';
    if (title.includes('bloom') || title.includes('petal') || title.includes('hand discovery')) return 'hand-bloom';
    if (title.includes('kick')) return 'kick-count';
    if (title.includes('grip') || title.includes('hold')) return 'grip-log';
    if (title.includes('eye connect') || title.includes('gaze')) return 'eye-connect';
    if (title.includes('sit')) return 'sit-explore';
    return 'generic';
  };

  const renderMiniGame = (activity) => {
    const key = getActivityKey(activity);
    const gameIdea = activity.gameIdea || '';
    
    switch (key) {
      case 'sit-explore':
        return (
          <div className="game-box sit-explore-game">
            <div className="game-visuals">
              <div className="baby-seated-animation">
                {simulationSuccess ? '👑👶👑' : '🧘👶'}
              </div>
              <div className="posture-lines"></div>
              {simulationSuccess && <div className="throne-badge-visual">🛋️ Throne Badge Earned!</div>}
            </div>
            <div className="game-dashboard">
              <div className="timer-count">Time Seated: {gameScore}s / 10s</div>
              <p className="game-prompt">
                {simulationSuccess ? 'Excellent posture! Throne Badge awarded.' : 'Calm music is playing. Keep baby seated stably...'}
              </p>
              {!simulationSuccess && (
                <div className="game-stabilizer-indicator">
                  <span className="indicator-pulse"></span> Stable Seating Active
                </div>
              )}
            </div>
          </div>
        );

      case 'tummy-time':
        return (
          <div className="game-box tummy-time-game">
            <div className="high-contrast-bg">
              <div className="spinning-spiral">🌀</div>
            </div>
            <div className="galaxy-board">
              {gameItems.map((item, idx) => (
                <span 
                  key={idx} 
                  className="galaxy-star" 
                  style={{ 
                    left: `${item.x}%`, 
                    top: `${item.y}%`, 
                    fontSize: `${1.5 + idx * 0.3}rem` 
                  }}
                >
                  ⭐
                </span>
              ))}
            </div>
            <div className="game-dashboard">
              <div className="star-count">Stars collected: {gameItems.length} / 5</div>
              <p className="game-prompt">Tap "Record Head Lift" when baby looks up to shoot stars into the galaxy!</p>
              {!simulationSuccess && (
                <button 
                  className="btn-game-action"
                  onClick={() => {
                    const count = gameItems.length;
                    if (count >= 5) return;
                    const nextItems = [...gameItems, { x: Math.random() * 80 + 10, y: Math.random() * 60 + 10 }];
                    setGameItems(nextItems);
                    const nextProgress = Math.min(100, (nextItems.length * 20));
                    setSimulationProgress(nextProgress);
                    
                    try {
                      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                      const osc = audioCtx.createOscillator();
                      osc.connect(audioCtx.destination);
                      osc.frequency.setValueAtTime(300 + count * 100, audioCtx.currentTime);
                      osc.start();
                      osc.stop(audioCtx.currentTime + 0.15);
                    } catch {}

                    if (nextItems.length === 5) {
                      handleSimulationComplete();
                    }
                  }}
                >
                  👶 Record Head Lift
                </button>
              )}
            </div>
          </div>
        );

      case 'sound-compass':
        return (
          <div className="game-box sound-compass-game">
            <div className="compass-visual-area">
              <div className={`sliding-bell ${gameActive}`}>
                🔔
              </div>
              <div className="sound-pulses">
                <span className="wave-pulse"></span>
                <span className="wave-pulse-2"></span>
              </div>
            </div>
            <div className="game-dashboard">
              <div className="compass-score">Progress: {simulationProgress}%</div>
              <p className="game-prompt">Look at the bell! Click matching direction when baby turns head.</p>
              {!simulationSuccess && (
                <div className="compass-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    className="btn-game-action direction"
                    onClick={() => {
                      if (gameActive === 'left') {
                        const nextProgress = Math.min(100, simulationProgress + 20);
                        setSimulationProgress(nextProgress);
                        showToast("Correct! Turned Left.");
                        setGameActive(Math.random() > 0.5 ? 'left' : 'right');
                        if (nextProgress === 100) handleSimulationComplete();
                      } else {
                        showToast("Oops, the bell was on the right!");
                      }
                    }}
                  >
                    👈 Tracked Left
                  </button>
                  <button 
                    className="btn-game-action direction"
                    onClick={() => {
                      if (gameActive === 'right') {
                        const nextProgress = Math.min(100, simulationProgress + 20);
                        setSimulationProgress(nextProgress);
                        showToast("Correct! Turned Right.");
                        setGameActive(Math.random() > 0.5 ? 'left' : 'right');
                        if (nextProgress === 100) handleSimulationComplete();
                      } else {
                        showToast("Oops, the bell was on the left!");
                      }
                    }}
                  >
                    Tracked Right 👉
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'hand-bloom':
        return (
          <div className="game-box hand-bloom-game">
            <div className="flower-visuals">
              <div className="bouquet-box">
                {gameItems.map((item, idx) => (
                  <span key={idx} className="flower-item">🌸</span>
                ))}
              </div>
              <div className="falling-petal-simulation">
                🍃
              </div>
            </div>
            <div className="game-dashboard">
              <div className="petal-count">Petals Caught: {gameItems.length} / 5</div>
              <p className="game-prompt">When baby stretches out and opens their hand, click "Opens Hand" to catch the falling petal!</p>
              {!simulationSuccess && (
                <button 
                  className="btn-game-action"
                  onClick={() => {
                    const count = gameItems.length;
                    if (count >= 5) return;
                    const nextItems = [...gameItems, '🌸'];
                    setGameItems(nextItems);
                    const nextProgress = Math.min(100, nextItems.length * 20);
                    setSimulationProgress(nextProgress);

                    if (nextItems.length === 5) {
                      handleSimulationComplete();
                    }
                  }}
                >
                  🖐️ Baby Opens Hand
                </button>
              )}
            </div>
          </div>
        );

      case 'kick-count':
        return (
          <div className="game-box kick-count-game">
            <div className="treble-staff">
              <div className="staff-line"></div>
              <div className="staff-line"></div>
              <div className="staff-line"></div>
              <div className="staff-line"></div>
              <div className="staff-line"></div>
              <div className="staff-notes">
                {gameItems.map((note, idx) => (
                  <span 
                    key={idx} 
                    className="staff-note-item" 
                    style={{ left: `${20 + idx * 30}px`, bottom: `${10 + (idx % 3) * 12}px`, position: 'absolute' }}
                  >
                    🎵
                  </span>
                ))}
              </div>
            </div>
            <div className="game-dashboard">
              <div className="note-count">Notes Played: {gameItems.length} / 8</div>
              <p className="game-prompt">Baby kicks mobile toy and record the kick to compose a song!</p>
              {!simulationSuccess && (
                <button 
                  className="btn-game-action"
                  onClick={() => {
                    const count = gameItems.length;
                    if (count >= 8) return;
                    const nextItems = [...gameItems, '🎵'];
                    setGameItems(nextItems);
                    const nextProgress = Math.min(100, Math.floor(nextItems.length * 12.5));
                    setSimulationProgress(nextProgress);

                    try {
                      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                      const osc = audioCtx.createOscillator();
                      osc.connect(audioCtx.destination);
                      osc.frequency.setValueAtTime(261.63 * Math.pow(1.12, count), audioCtx.currentTime);
                      osc.start();
                      osc.stop(audioCtx.currentTime + 0.2);
                    } catch {}

                    if (nextItems.length === 8) {
                      handleSimulationComplete();
                    }
                  }}
                >
                  🦶 Baby Kicks Mobile
                </button>
              )}
            </div>
          </div>
        );

      case 'grip-log':
        return (
          <div className="game-box grip-log-game">
            <div className="grip-visuals">
              <div className="grip-thermometer">
                <div className="grip-fill" style={{ height: `${simulationProgress}%`, width: '100%', background: '#EF4444', transition: 'height 0.2s ease' }}></div>
              </div>
              <div className="creature-morph">
                {simulationSuccess ? '🦋 Butterfly Flying!' : '🐛 Caterpillar Climbing'}
              </div>
            </div>
            <div className="game-dashboard">
              <div className="grip-val">Grip Hold: {simulationProgress}%</div>
              <p className="game-prompt">Log hold duration. Caterpillar turns into butterfly at 100%!</p>
              {!simulationSuccess && (
                <button 
                  className="btn-game-action"
                  onClick={() => {
                    const next = Math.min(100, simulationProgress + 10);
                    setSimulationProgress(next);
                    if (next === 100) handleSimulationComplete();
                  }}
                >
                  ✊ Record Grip Pulse
                </button>
              )}
            </div>
          </div>
        );

      case 'eye-connect':
        return (
          <div className="game-box eye-connect-game">
            <div className="gaze-face-box">
              <div className="gaze-face">
                😊
              </div>
            </div>
            <div className="gaze-garden" style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '12px 0' }}>
              {gameItems.map((flower, idx) => (
                <span key={idx} className="garden-flower" style={{ fontSize: '2rem' }}>🌷</span>
              ))}
            </div>
            <div className="game-dashboard">
              <div className="flower-count">Flowers Grown: {gameItems.length} / 5</div>
              <p className="game-prompt">Look into the baby's eyes and log connection to grow flowers!</p>
              {!simulationSuccess && (
                <button 
                  className="btn-game-action"
                  onClick={() => {
                    const count = gameItems.length;
                    if (count >= 5) return;
                    const nextItems = [...gameItems, '🌷'];
                    setGameItems(nextItems);
                    const nextProgress = Math.min(100, nextItems.length * 20);
                    setSimulationProgress(nextProgress);

                    if (nextItems.length === 5) {
                      handleSimulationComplete();
                    }
                  }}
                >
                  👁️ Record Gaze Connection
                </button>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="game-box generic-game">
            <div className="generic-progress-circle">
              <svg className="progress-ring" width="120" height="120">
                <circle className="progress-ring-bg" stroke="#e2e8f0" strokeWidth="8" fill="transparent" r="50" cx="60" cy="60" />
                <circle className="progress-ring-fill" stroke="var(--accent-color, #f5a623)" strokeWidth="8" fill="transparent" r="50" cx="60" cy="60" strokeDasharray={314.16} strokeDashoffset={314.16 - (314.16 * simulationProgress) / 100} />
              </svg>
              <div className="progress-value">{simulationProgress}%</div>
            </div>
            <div className="game-dashboard">
              <p className="game-prompt"><strong>Caregiver Guide:</strong> {gameIdea || 'Perform this activity with your child and tap below to log progress.'}</p>
              {!simulationSuccess && (
                <button 
                  className="btn-game-action"
                  onClick={() => {
                    const next = Math.min(100, simulationProgress + 20);
                    setSimulationProgress(next);
                    if (next === 100) handleSimulationComplete();
                  }}
                >
                  👉 Tap to Log Progress Step
                </button>
              )}
            </div>
          </div>
        );
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Get child's age in months
  const ageMonths = profile?.age_months;

  // ENHANCED CHECK: Show for children aged 0-36 months OR age_group "1-3"
  const shouldShow = (ageMonths >= 0 && ageMonths <= 36) || profile?.age_group === '1-3';

  if (!shouldShow) {
    console.log('MilestoneCatalogActivities: Not showing. age_months:', ageMonths, 'age_group:', profile?.age_group);
    return null;
  }

  // Determine child's current level based on age
  const effectiveAge = (ageMonths !== undefined && ageMonths !== null) ? ageMonths : 12;
  const currentLevelData = getActivitiesForAge(effectiveAge);
  const currentLevel = currentLevelData?.level;

  // Use selected level or default to current level
  const levelData = selectedLevel ? MILESTONE_ACTIVITIES_CATALOG[selectedLevel] : currentLevelData;

  if (!levelData) {
    return null;
  }

  const { level, ageRange, description, domains } = levelData;

  // Count total activities
  const totalActivities = Object.values(domains).reduce((sum, activities) => sum + activities.length, 0);

  // All available levels
  const allLevels = [
    { key: "0-6", label: "Level 1: 0-6 Months", isCurrent: level === 1 },
    { key: "6-12", label: "Level 2: 6-12 Months", isCurrent: level === 2 },
    { key: "12-18", label: "Level 3: 12-18 Months", isCurrent: level === 3 },
    { key: "18-24", label: "Level 4: 18-24 Months", isCurrent: level === 4 },
    { key: "24-30", label: "Level 5: 24-30 Months", isCurrent: level === 5 },
    { key: "30-36", label: "Level 6: 30-36 Months", isCurrent: level === 6 }
  ];

  return (
    <div className="catalog-section">
      {/* Collapsible Header */}
      <div 
        className="catalog-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="catalog-header-content">
          <div className="catalog-header-left">
            <h2 className="catalog-title">
              <span className="catalog-icon">🎯</span>
              Milestone Activities Catalog
            </h2>
            <p className="catalog-subtitle">
              {currentLevel && <span className="current-level-badge">Your Level: {currentLevel}</span>}
              {' '}Viewing Level {level}: {ageRange} • {totalActivities} Activities
            </p>
            <p className="catalog-description">{description}</p>
          </div>
          <button className="catalog-toggle-btn" onClick={(e) => e.stopPropagation()}>
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="catalog-content">
          {/* Level Selector */}
          <div className="level-selector">
            <h3 className="level-selector-title">
              <span>📚</span>
              Choose Age Level
            </h3>
            <div className="level-buttons">
              {allLevels.map((lvl) => (
                <button
                  key={lvl.key}
                  className={`level-btn ${selectedLevel === lvl.key ? 'active' : ''} ${lvl.isCurrent && !selectedLevel ? 'current' : ''}`}
                  onClick={() => {
                    setSelectedLevel(lvl.key);
                    setSelectedDomain(null);
                  }}
                >
                  {lvl.label}
                  {lvl.isCurrent && <span className="current-indicator">★ Current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Selection Cards */}
          <div className="domain-grid">
            {Object.entries(domains).map(([domainKey, activities]) => {
              const domainInfo = DOMAIN_INFO[domainKey];
              return (
                <div
                  key={domainKey}
                  className="domain-card"
                  onClick={() => setSelectedDomain(selectedDomain === domainKey ? null : domainKey)}
                  style={{ '--domain-color': domainInfo.color }}
                >
                  <div className="domain-card-header">
                    <span className="domain-icon">{domainInfo.icon}</span>
                    <h3 className="domain-name">{domainInfo.name}</h3>
                  </div>
                  <p className="domain-description">{domainInfo.description}</p>
                  <div className="domain-stats">
                    <span className="domain-activity-count">
                      {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Domain Activities */}
          {selectedDomain && (
            <div className="domain-activities-section">
              <div className="domain-activities-header">
                <h3>
                  <span>{DOMAIN_INFO[selectedDomain].icon}</span>
                  {DOMAIN_INFO[selectedDomain].name} Activities
                </h3>
                <button
                  className="close-domain-btn"
                  onClick={() => setSelectedDomain(null)}
                >
                  ✕
                </button>
              </div>

              <div className="activities-list">
                {domains[selectedDomain].map((activity, index) => (
                  <div
                    key={index}
                    className="catalog-activity-card"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <div className="activity-card-top">
                      <h4 className="activity-name">{activity.eActivity}</h4>
                      <span 
                        className="activity-domain-badge"
                        style={{ backgroundColor: DOMAIN_INFO[selectedDomain].color }}
                      >
                        {DOMAIN_INFO[selectedDomain].icon}
                      </span>
                    </div>

                    <div className="activity-milestone">
                      <strong>Milestone:</strong> {activity.milestone}
                    </div>

                    <p className="activity-description">{activity.description}</p>

                    <button className="view-details-btn">
                      View Full Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Domains Quick View */}
          {!selectedDomain && (
            <div className="all-domains-preview">
              <h3 className="preview-title">
                <span>📚</span>
                Explore Activities by Domain
              </h3>
              <p className="preview-subtitle">
                Click on any domain card above to view its activities for your child's age group ({ageRange})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div 
          className="activity-detail-overlay"
          onClick={() => setSelectedActivity(null)}
        >
          <div 
            className="activity-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedActivity(null)}
            >
              ✕
            </button>

            <div className="modal-header">
              <h2>{selectedActivity.eActivity}</h2>
              <div className="modal-badges">
                <span className="modal-badge">
                  {DOMAIN_INFO[selectedDomain]?.icon} {DOMAIN_INFO[selectedDomain]?.name}
                </span>
                <span className="modal-badge">{ageRange}</span>
              </div>
            </div>

            <div className="modal-body">
              <section className="modal-section">
                <h3>🎯 Milestone</h3>
                <p>{selectedActivity.milestone}</p>
              </section>

              <section className="modal-section">
                <h3>📝 Description</h3>
                <p>{selectedActivity.description}</p>
              </section>

              <section className="modal-section">
                <h3>🎮 Game Idea</h3>
                <p>{selectedActivity.gameIdea}</p>
              </section>

              <section className="modal-section">
                <h3>🤖 AI Integration</h3>
                <p>{selectedActivity.aiIntegration}</p>
              </section>

              <section className="modal-section">
                <h3>✨ Learning Outcome</h3>
                <p>{selectedActivity.learningOutcome}</p>
              </section>
            </div>

             <div className="modal-footer">
               <button 
                 className="btn-primary"
                 onClick={() => {
                   setActiveSimulation(selectedActivity);
                   setSimulationProgress(0);
                   setSimulationSuccess(false);
                   setSelectedActivity(null);
                   setGameScore(0);
                   setGameItems([]);
                   setGameStatus('Ready to play!');
                   setGameActive(Math.random() > 0.5 ? 'left' : 'right');
                 }}
               >
                 🚀 Start Activity
               </button>
               <button 
                 className={`btn-secondary ${bookmarks.includes(selectedActivity.eActivity) ? 'bookmarked' : ''}`}
                 onClick={() => handleToggleBookmark(selectedActivity.eActivity)}
               >
                 {bookmarks.includes(selectedActivity.eActivity) ? '📌 Bookmarked' : '🔖 Bookmark'}
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Simulation Overlay */}
       {activeSimulation && (
         <div className="simulation-overlay">
           <div className="simulation-container">
             <button 
               className="simulation-close" 
               onClick={() => {
                 setActiveSimulation(null);
                 setSimulationProgress(0);
                 setSimulationSuccess(false);
               }}
             >
               ✕ Exit Session
             </button>
 
             <div className="simulation-header">
               <span className="simulation-badge">Active Session</span>
               <h2>{activeSimulation.name || activeSimulation.eActivity}</h2>
               <p className="simulation-objective">{activeSimulation.objective || activeSimulation.description}</p>
             </div>
 
             <div className="simulation-body">
               {simulationSuccess ? (
                 <div className="simulation-success-pane">
                   <div className="success-badge-badge">🏆</div>
                   <h3>Activity Completed!</h3>
                   <p>Fantastic job! You and your child have earned rewards.</p>
                   
                   <div className="rewards-grid">
                     <div className="reward-box xp">
                       <span className="reward-icon">⚡</span>
                       <span className="reward-amount">+20 XP</span>
                     </div>
                     <div className="reward-box stars">
                       <span className="reward-icon">⭐</span>
                       <span className="reward-amount">+5 Stars</span>
                     </div>
                     <div className="reward-box coins">
                       <span className="reward-icon">🪙</span>
                       <span className="reward-amount">+10 Coins</span>
                     </div>
                   </div>
 
                   <button 
                     className="btn-success-close"
                     onClick={() => {
                       setActiveSimulation(null);
                       setSimulationProgress(0);
                       setSimulationSuccess(false);
                     }}
                   >
                     🎉 Awesome!
                   </button>
                 </div>
               ) : (
                 renderMiniGame(activeSimulation)
               )}
             </div>
           </div>
         </div>
       )}

       {/* Toast Notification */}
       {toastMessage && (
         <div className="local-toast">
           {toastMessage}
         </div>
       )}
     </div>
   );
 }
