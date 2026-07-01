import { useState, useEffect, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { awardProgress } from '../../firebase/services';
import './MilestoneActivities.css';

// Import the milestone data
import rawMilestonesData from '../../data/milestones_0_3.json';
import { MILESTONE_ACTIVITIES_CATALOG } from '../../data/milestoneActivitiesCatalog';

export default function MilestoneActivities() {
  const { profile, refreshProfile } = useUser();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Bookmark and simulation states
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

  // Get age from age_months field (used for 1-3 age group)
  const childAge = profile?.age_months;
  
  // Debug: Log the child's age
  console.log('=== MilestoneActivities Debug ===');
  console.log('Child Age (months):', childAge);
  console.log('Age Group:', profile?.age_group);
  console.log('Full Profile:', profile);
  console.log('================================');
  
  // Group raw milestones and catalog activities into levels matching user age
  const processedMilestones = useMemo(() => {
    const levels = [
      { key: "0-6", rangeName: "0-6 months", levelNum: 1 },
      { key: "6-12", rangeName: "6-12 months", levelNum: 2 },
      { key: "12-18", rangeName: "12-18 months", levelNum: 3 },
      { key: "18-24", rangeName: "18-24 months", levelNum: 4 },
      { key: "24-30", rangeName: "24-30 months", levelNum: 5 },
      { key: "30-36", rangeName: "30-36 months", levelNum: 6 }
    ];

    return levels.map(levelInfo => {
      const catalogEntry = MILESTONE_ACTIVITIES_CATALOG[levelInfo.key];
      const activities = [];
      if (catalogEntry) {
        Object.entries(catalogEntry.domains).forEach(([domain, list]) => {
          list.forEach(act => {
            activities.push({
              ...act,
              category: domain.charAt(0).toUpperCase() + domain.slice(1) + ' Development',
              ageGroup: levelInfo.key
            });
          });
        });
      }

      const filtered = rawMilestonesData.filter(m => m.level === levelInfo.levelNum);
      const uniqueSkillsMap = new Map();
      filtered.forEach(m => {
        if (m.skill && !uniqueSkillsMap.has(m.skill)) {
          uniqueSkillsMap.set(m.skill, {
            skill: m.skill,
            description: m.milestone
          });
        }
      });
      const skills = Array.from(uniqueSkillsMap.values());

      return {
        ageRange: levelInfo.rangeName,
        level: levelInfo.levelNum,
        skills: skills,
        activities: activities
      };
    });
  }, [rawMilestonesData]);

  // Show for children aged 0-36 months OR age_group "1-3"
  const shouldShow = (childAge >= 0 && childAge <= 36) || profile?.age_group === '1-3';

  if (!shouldShow) {
    console.log('MilestoneActivities: Not showing. age_months:', childAge, 'age_group:', profile?.age_group);
    return null;
  }
  
  // If age_months is not set but age_group is 1-3, default to 12 months for demo
  const effectiveAge = childAge === null || childAge === undefined ? 12 : (childAge === 0 ? 1 : childAge);
  
  console.log('Effective Age used for milestone selection:', effectiveAge);
  
  // Find the appropriate milestone data based on age
  const getCurrentMilestone = () => {
    let levelNum;
    if (effectiveAge <= 6) levelNum = 1;
    else if (effectiveAge <= 12) levelNum = 2;
    else if (effectiveAge <= 18) levelNum = 3;
    else if (effectiveAge <= 24) levelNum = 4;
    else if (effectiveAge <= 30) levelNum = 5;
    else if (effectiveAge <= 36) levelNum = 6;
    else return null;

    return processedMilestones.find(m => m.level === levelNum);
  };

  const currentMilestone = getCurrentMilestone();

  if (!currentMilestone) {
    console.log('MilestoneActivities - No milestone data found for age:', effectiveAge);
    return null;
  }

  console.log('MilestoneActivities - Displaying milestone for:', currentMilestone.ageRange);

  return (
    <div className="milestone-activities-section">
      {/* Collapsible Header */}
      <div 
        className="milestone-header milestone-header-collapsible" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h2 className="milestone-title">
              <span className="milestone-icon">🎯</span>
              Milestone Activities for {currentMilestone.ageRange}
            </h2>
            <p className="milestone-subtitle">
              Click to {isExpanded ? 'hide' : 'view'} age-appropriate activities for your child's development
            </p>
          </div>
          <button 
            className="milestone-toggle-btn"
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              flexShrink: 0,
              marginLeft: '16px'
            }}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="milestone-content-wrapper">
          {/* Skills Development Cards */}
          <div className="milestone-skills">
            <h3 className="skills-title">
              <span className="skills-icon">🌟</span>
              Key Skills to Develop
            </h3>
            <div className="skills-grid">
              {currentMilestone.skills.map((skill, index) => (
                <div key={index} className="skill-card">
                  <h4 className="skill-name">{skill.skill}</h4>
                  <p className="skill-description">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activities Section */}
          <div className="milestone-activities-list">
            <h3 className="activities-title">
              <span className="activities-icon">🎨</span>
              Recommended Activities
            </h3>
            <div className="activities-grid">
              {currentMilestone.activities.map((activity, index) => (
                <div 
                  key={index} 
                  className="activity-card"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="activity-card-header">
                    <h4 className="activity-name">{activity.name}</h4>
                    <span className="activity-category-badge">{activity.category}</span>
                  </div>
                  
                  <div className="activity-preview">
                    <div className="activity-info-row">
                      <span className="activity-label">Age Group:</span>
                      <span className="activity-value">{activity.ageGroup} months</span>
                    </div>
                    <p className="activity-objective-preview">{activity.objective}</p>
                  </div>

                  <button className="activity-view-btn">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* All Milestones Preview */}
          <div className="all-milestones-section">
            <h3 className="all-milestones-title">
              <span>📋</span>
              View All Milestone Groups
            </h3>
            <div className="milestones-accordion">
              {processedMilestones.map((milestone, index) => (
                <div key={index} className="milestone-accordion-item">
                  <button
                    className={`milestone-accordion-btn ${expandedMilestone === index ? 'active' : ''}`}
                    onClick={() => setExpandedMilestone(expandedMilestone === index ? null : index)}
                  >
                    <span className="milestone-age-range">{milestone.ageRange}</span>
                    <span className="milestone-activity-count">
                      {milestone.activities.length} activities
                    </span>
                    <span className="accordion-icon">
                      {expandedMilestone === index ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedMilestone === index && (
                    <div className="milestone-accordion-content">
                      <div className="accordion-skills">
                        <h4>Skills:</h4>
                        <div className="accordion-skills-list">
                          {milestone.skills.map((skill, idx) => (
                            <span key={idx} className="accordion-skill-tag">
                              {skill.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="accordion-activities">
                        <h4>Activities:</h4>
                        <ul className="accordion-activities-list">
                          {milestone.activities.map((activity, idx) => (
                            <li key={idx} className="accordion-activity-item">
                              <strong>{activity.name}</strong> - {activity.category}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="activity-modal-overlay" onClick={() => setSelectedActivity(null)}>
          <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
            <button className="activity-modal-close" onClick={() => setSelectedActivity(null)}>
              ✕
            </button>
            
            <div className="activity-modal-header">
              <h2 className="activity-modal-title">{selectedActivity.name}</h2>
              <div className="activity-modal-badges">
                <span className="badge-category">{selectedActivity.category}</span>
                <span className="badge-age">Age {selectedActivity.ageGroup} months</span>
              </div>
            </div>

            <div className="activity-modal-content">
              <section className="activity-section">
                <h3 className="section-title">📦 Materials Needed</h3>
                <ul className="materials-list">
                  {selectedActivity.materials.map((material, idx) => (
                    <li key={idx} className="material-item">{material}</li>
                  ))}
                </ul>
              </section>

              <section className="activity-section">
                <h3 className="section-title">🛠️ Setup Instructions</h3>
                <p className="section-content">{selectedActivity.setup}</p>
              </section>

              <section className="activity-section">
                <h3 className="section-title">🎯 Learning Objective</h3>
                <p className="section-content">{selectedActivity.objective}</p>
              </section>

              <section className="activity-section">
                <h3 className="section-title">✨ Expected Outcome</h3>
                <p className="section-content">{selectedActivity.outcome}</p>
              </section>

              <section className="activity-section">
                <h3 className="section-title">📚 Research Support</h3>
                <ul className="research-list">
                  {selectedActivity.supportResearch.map((research, idx) => (
                    <li key={idx} className="research-item">{research}</li>
                  ))}
                </ul>
              </section>
            </div>

             <div className="activity-modal-footer">
               <button 
                 className="btn-start-activity"
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
                 className={`btn-bookmark ${bookmarks.includes(selectedActivity.name) ? 'bookmarked' : ''}`}
                 onClick={() => handleToggleBookmark(selectedActivity.name)}
               >
                 {bookmarks.includes(selectedActivity.name) ? '📌 Bookmarked' : '🔖 Save for Later'}
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
