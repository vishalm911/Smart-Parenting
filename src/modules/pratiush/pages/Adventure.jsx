import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';
import { getZoneProgress } from '../utils/firestoreHelpers';
import './Adventure.css';

const ZONES = [
  { id: 'literacy', nameKey: 'zone.literacy', emoji: '📚', color: '#42A5F5', descKey: 'zone.literacy.desc', pos: { top: '18%', left: '15%' },
    modules: [
      { id: 'l1', title: 'Letter Sounds', desc: 'Learn A-Z sounds', stars: 3, done: true },
      { id: 'l2', title: 'Word Builder', desc: 'Build simple words', stars: 2, done: true },
      { id: 'l3', title: 'Story Time', desc: 'Read fun stories', stars: 0, done: false },
      { id: 'l4', title: 'Rhyme Time', desc: 'Find rhyming words', stars: 0, done: false },
    ]},
  { id: 'math', nameKey: 'zone.math', emoji: '🔢', color: '#66BB6A', descKey: 'zone.math.desc', pos: { top: '12%', left: '55%' },
    modules: [
      { id: 'm1', title: 'Counting Fun', desc: 'Count 1 to 20', stars: 3, done: true },
      { id: 'm2', title: 'Shape Safari', desc: 'Learn basic shapes', stars: 0, done: false },
      { id: 'm3', title: 'Add & Subtract', desc: 'Simple math', stars: 0, done: false },
    ]},
  { id: 'brain', nameKey: 'zone.brain', emoji: '🧩', color: '#7C4DFF', descKey: 'zone.brain.desc', pos: { top: '48%', left: '70%' },
    modules: [
      { id: 'b1', title: 'Pattern Match', desc: 'Find the pattern', stars: 0, done: false },
      { id: 'b2', title: 'Memory Game', desc: 'Train your memory', stars: 0, done: false },
    ]},
  { id: 'creative', nameKey: 'zone.creative', emoji: '🎨', color: '#FF8A65', descKey: 'zone.creative.desc', pos: { top: '60%', left: '25%' },
    modules: [
      { id: 'c1', title: 'Color Lab', desc: 'Mix & create colors', stars: 0, done: false },
      { id: 'c2', title: 'Draw Along', desc: 'Follow & draw', stars: 0, done: false },
    ]},
  { id: 'emotion', nameKey: 'zone.emotion', emoji: '💝', color: '#FF6B9D', descKey: 'zone.emotion.desc', pos: { top: '38%', left: '40%' },
    modules: [
      { id: 'e1', title: 'Feeling Faces', desc: 'Name emotions', stars: 0, done: false },
      { id: 'e2', title: 'Kindness Quest', desc: 'Acts of kindness', stars: 0, done: false },
    ]},
];

export default function Adventure() {
  const { state } = useApp();
  const { t } = useTranslation();
  const [selectedZone, setSelectedZone] = useState(null);
  const zoneProgress = getZoneProgress();

  // Calculate total XP
  const totalXP = Object.values(zoneProgress).reduce((sum, z) => sum + z.xp, 0);
  const maxXP = 500;
  const level = Math.floor(totalXP / 100) + 1;

  return (
    <div className="adventure-page">
      {/* XP Bar */}
      <div className="xp-bar-container">
        <div className="xp-bar-info">
          <span className="xp-level">{t('adventureLevel', { level })}</span>
          <span className="xp-count">{t('xpCount', { current: totalXP, max: maxXP })}</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-fill"
            style={{ width: `${Math.min(100, (totalXP / maxXP) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Adventure Map */}
      <div className="adventure-map">
        <img src="/images/adventure-map.png" alt="Adventure World" className="map-bg" />

        {/* SVG Path connecting zones */}
        <svg className="map-paths" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 18 25 Q 35 15 55 18" className="zone-path completed" />
          <path d="M 55 18 Q 68 35 72 50" className="zone-path" />
          <path d="M 72 50 Q 55 58 42 42" className="zone-path" />
          <path d="M 42 42 Q 30 50 28 62" className="zone-path" />
        </svg>

        {/* Zone Markers */}
        {ZONES.map((zone, i) => {
          const progress = zoneProgress[zone.id];
          const isUnlocked = progress?.unlocked;
          const isComplete = progress?.completed === progress?.total;

          return (
            <button
              key={zone.id}
              className={`zone-marker ${isUnlocked ? 'unlocked' : 'locked'} ${isComplete ? 'complete' : ''}`}
              style={{ top: zone.pos.top, left: zone.pos.left, animationDelay: `${i * 0.15}s` }}
              onClick={() => isUnlocked && setSelectedZone(zone)}
              id={`zone-${zone.id}`}
            >
              <span className="zone-emoji">{zone.emoji}</span>
              <span className="zone-name">{t(zone.nameKey)}</span>
              {isComplete && <span className="zone-stamp">✅</span>}
              {!isUnlocked && <span className="zone-lock">🔒</span>}
              {isUnlocked && !isComplete && progress && (
                <span className="zone-progress-mini">{progress.completed}/{progress.total}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Zone Detail Panel */}
      {selectedZone && (
        <div className="zone-panel-overlay" onClick={() => setSelectedZone(null)}>
          <div className="zone-panel" onClick={e => e.stopPropagation()}>
            <button className="panel-close" onClick={() => setSelectedZone(null)}>✕</button>

            <div className="panel-header" style={{ background: selectedZone.color }}>
              <span className="panel-emoji">{selectedZone.emoji}</span>
              <h2>{t(selectedZone.nameKey)}</h2>
              <p>{t(selectedZone.descKey)}</p>
            </div>

            <div className="panel-modules">
              <h3>{t('learningModules')}</h3>
              {selectedZone.modules.map((mod, i) => (
                <div
                  key={mod.id}
                  className={`module-card ${mod.done ? 'done' : ''}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="module-info">
                    <h4>{mod.title}</h4>
                    <p>{mod.desc}</p>
                  </div>
                  <div className="module-stars">
                    {[1, 2, 3].map(s => (
                      <span key={s} className={`star ${s <= mod.stars ? 'filled' : ''}`}>⭐</span>
                    ))}
                  </div>
                  <button className={`btn btn-sm ${mod.done ? 'btn-secondary' : 'btn-primary'}`}>
                    {mod.done ? t('review') : t('start')}
                  </button>
                </div>
              ))}
            </div>

            <div className="panel-treasure">
              <span className="treasure-icon">🎁</span>
              <span>{t('treasureMsg')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
