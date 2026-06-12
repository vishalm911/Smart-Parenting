import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';
import { unlockBadge, getCurrentChildId } from '../utils/firestoreHelpers';
import { generateCertificate } from '../utils/certificate';
import Confetti from '../components/Confetti';
import './Achievements.css';

const ALL_BADGES = [
  { id: 'literacy-star', emoji: '📚', nameKey: 'badge.literacy-star', desc: 'Complete 5 reading activities', category: 'literacy', required: 5 },
  { id: 'math-champ', emoji: '🔢', nameKey: 'badge.math-champ', desc: 'Solve 10 math challenges', category: 'math', required: 10 },
  { id: 'creative-mind', emoji: '🎨', nameKey: 'badge.creative-mind', desc: 'Finish 5 creative projects', category: 'creative', required: 5 },
  { id: 'emotion-explorer', emoji: '💝', nameKey: 'badge.emotion-explorer', desc: 'Complete emotional learning path', category: 'emotion', required: 4 },
  { id: 'science-whiz', emoji: '🔬', nameKey: 'badge.science-whiz', desc: 'Do 5 science experiments', category: 'science', required: 5 },
  { id: 'problem-solver', emoji: '🧩', nameKey: 'badge.problem-solver', desc: 'Crack 8 brain puzzles', category: 'brain', required: 8 },
  { id: 'super-reader', emoji: '📖', nameKey: 'badge.super-reader', desc: 'Read 10 stories', category: 'literacy', required: 10 },
  { id: 'number-ninja', emoji: '🥷', nameKey: 'badge.number-ninja', desc: 'Master multiplication tables', category: 'math', required: 12 },
  { id: 'music-master', emoji: '🎵', nameKey: 'badge.music-master', desc: 'Complete 4 rhythm games', category: 'creative', required: 4 },
  { id: 'kind-heart', emoji: '🤗', nameKey: 'badge.kind-heart', desc: 'Practice 5 kindness activities', category: 'emotion', required: 5 },
  { id: 'word-wizard', emoji: '✨', nameKey: 'badge.word-wizard', desc: 'Learn 50 new words', category: 'literacy', required: 50 },
  { id: 'logic-legend', emoji: '🧠', nameKey: 'badge.logic-legend', desc: 'Solve 15 logic puzzles', category: 'brain', required: 15 },
];

const TROPHIES = [
  { id: 't1', emoji: '🏆', nameKey: 'trophy.first-steps', desc: 'Complete your first activity', color: '#FFD700' },
  { id: 't2', emoji: '🌟', nameKey: 'trophy.rising-star', desc: 'Earn 10 stars', color: '#FF9A56' },
  { id: 't3', emoji: '🚀', nameKey: 'trophy.rocket-learner', desc: 'Complete 3 zones', color: '#7C4DFF' },
  { id: 't4', emoji: '👑', nameKey: 'trophy.knowledge-king', desc: 'Unlock all badges', color: '#F5A623' },
];

const CATEGORIES = ['all', 'literacy', 'math', 'creative', 'emotion', 'brain', 'science'];

export default function Achievements() {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const filtered = filter === 'all' ? ALL_BADGES : ALL_BADGES.filter(b => b.category === filter);
  const unlockedCount = state.badges.length;

  // Demo: Click badge to unlock it
  async function handleBadgeClick(badge) {
    setSelectedBadge(badge);
    if (!state.badges.includes(badge.id)) {
      await unlockBadge(getCurrentChildId(), badge.id);
      dispatch({ type: 'UNLOCK_BADGE', payload: badge.id });
      dispatch({ type: 'ADD_STARS', payload: 5 });
      dispatch({ type: 'ADD_COINS', payload: 10 });
      setShowConfetti(true);
    }
  }

  return (
    <div className="achievements-page">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="achievements-inner">
        {/* Header */}
        <div className="ach-header">
          <h1>{t('achievementsTitle')}</h1>
          <p className="ach-sub">{t('badgesUnlocked', { count: unlockedCount, total: ALL_BADGES.length })}</p>
          <div className="ach-overall-bar">
            <div
              className="ach-overall-fill"
              style={{ width: `${(unlockedCount / ALL_BADGES.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Trophy Shelf */}
        <div className="trophy-section">
          <h2>{t('trophyShelf')}</h2>
          <div className="trophy-shelf">
            <div className="shelf-bar"></div>
            <div className="trophies">
              {TROPHIES.map((trophy, i) => {
                const earned = i < Math.ceil(unlockedCount / 3);
                return (
                  <div
                    key={trophy.id}
                    className={`trophy ${earned ? 'earned' : 'locked'}`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <span className="trophy-emoji">{trophy.emoji}</span>
                    <span className="trophy-name">{t(trophy.nameKey)}</span>
                    {!earned && <span className="trophy-lock">🔒</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="ach-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? t('filterAll') : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Badge Gallery */}
        <div className="badge-gallery">
          {filtered.map((badge, i) => {
            const unlocked = state.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => handleBadgeClick(badge)}
                style={{ animationDelay: `${i * 0.06}s` }}
                id={`badge-${badge.id}`}
              >
                <div className="badge-icon-wrapper">
                  <span className="badge-emoji">{badge.emoji}</span>
                  {unlocked && <span className="badge-glow"></span>}
                  {!unlocked && <span className="badge-lock-icon">🔒</span>}
                </div>
                <h4 className="badge-name">{t(badge.nameKey)}</h4>
                <p className="badge-desc">{badge.desc}</p>
                {unlocked && <span className="badge-unlocked-tag">{t('unlocked')}</span>}
              </div>
            );
          })}
        </div>

        {/* Certificate Section */}
        <div className="certificate-section">
          <h2>{t('certificates')}</h2>
          <p className="cert-desc">{t('certDesc')}</p>
          <div className="cert-grid">
            {[
              { nameKey: 'cert.literacy', name: 'Literacy Explorer', needed: 2, icon: '📚', cat: 'literacy' },
              { nameKey: 'cert.math', name: 'Math Wizard', needed: 2, icon: '🔢', cat: 'math' },
              { nameKey: 'cert.creative', name: 'Creative Star', needed: 2, icon: '🎨', cat: 'creative' },
            ].map((cert, i) => {
              const earned = state.badges.filter(b =>
                ALL_BADGES.find(ab => ab.id === b)?.category === cert.cat
              ).length >= cert.needed;
              return (
                <div key={i} className={`cert-card ${earned ? 'earned' : ''}`}>
                  <span className="cert-icon">{cert.icon}</span>
                  <span className="cert-name">{t(cert.nameKey)}</span>
                  {earned ? (
                    <button className="btn btn-sm btn-primary" onClick={() => generateCertificate({ childName: state.childProfile?.name || 'Explorer', achievementName: t(cert.nameKey), category: cert.cat, date: Date.now() })}>{t('downloadPdf')}</button>
                  ) : (
                    <span className="cert-locked">{t('needBadges', { count: cert.needed })}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Badge Detail Modal */}
        {selectedBadge && (
          <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
            <div className="badge-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedBadge(null)}>✕</button>
              <span className="modal-emoji">{selectedBadge.emoji}</span>
              <h3>{t(selectedBadge.nameKey)}</h3>
              <p>{selectedBadge.desc}</p>
              <span className="modal-status">
                {state.badges.includes(selectedBadge.id) ? t('unlocked') : t('keepLearningBadge')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
