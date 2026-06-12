import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';
import { saveChildProfile } from '../utils/firestoreHelpers';
import './Welcome.css';

// Background floating stars
function FloatingStars() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 16 + 8,
    delay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 3 + 3}s`,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="floating-stars">
      {stars.map(s => (
        <span
          key={s.id}
          className="star-particle"
          style={{
            left: s.left, top: s.top,
            fontSize: `${s.size}px`,
            animationDelay: s.delay,
            animationDuration: s.duration,
            opacity: s.opacity,
          }}
        >✦</span>
      ))}
    </div>
  );
}

export default function Welcome() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0: splash, 1: age, 2: name
  const [ageGroup, setAgeGroup] = useState(null);
  const [childName, setChildName] = useState('');
  const [emojiCategory, setEmojiCategory] = useState('Faces');
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const AGE_GROUPS = [
    { id: '1-3', label: t('age1_3'), emoji: '👶', color: '#FF8A80', desc: t('tinyExplorers'), bg: 'linear-gradient(135deg, #FFCDD2, #F8BBD0)' },
    { id: '4-6', label: t('age4_6'), emoji: '🧒', color: '#A5D6A7', desc: t('curiousCubs'), bg: 'linear-gradient(135deg, #C8E6C9, #B2DFDB)' },
    { id: '7-10', label: t('age7_10'), emoji: '🚀', color: '#90CAF9', desc: t('starVoyagers'), bg: 'linear-gradient(135deg, #BBDEFB, #B3E5FC)' },
  ];

  const EMOJI_CATEGORIES = {
    [t('emojiCatFaces')]: ['😊', '😄', '🥰', '😎', '🤩', '😇', '🦸', '🧑‍🚀'],
    [t('emojiCatAnimals')]: ['🐶', '🐱', '🐻', '🐼', '🦁', '🐯', '🦋', '🐙'],
    [t('emojiCatStars')]: ['⭐', '🌟', '✨', '💫', '🌈', '☀️', '🌙', '🔮'],
    [t('emojiCatHearts')]: ['❤️', '💛', '💚', '💙', '💜', '🧡', '🤍', '💖'],
  };

  // Removed auto-advance - user must tap to continue
  // useEffect(() => {
  //   if (step === 0) {
  //     const timer = setTimeout(() => goToStep(1), 4000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [step]);

  function goToStep(next) {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(next);
      setIsAnimating(false);
    }, 400);
  }

  async function handleSubmit() {
    if (!childName.trim()) return;
    const profile = await saveChildProfile({
      name: childName.trim(),
      ageGroup,
      createdAt: Date.now(),
    });
    dispatch({ type: 'SET_PROFILE', payload: profile });
    navigate('/avatar');
  }

  function addEmoji(emoji) {
    setChildName(prev => prev + emoji);
  }

  // Set initial category key
  const categoryKeys = Object.keys(EMOJI_CATEGORIES);
  const activeCat = categoryKeys.includes(emojiCategory) ? emojiCategory : categoryKeys[0];

  return (
    <div className="welcome-page">
      <FloatingStars />

      {/* Step 0: Splash */}
      {step === 0 && (
        <div className={`welcome-splash ${isAnimating ? 'exit' : ''}`} onClick={() => goToStep(1)}>
          {/* Floating educational elements */}
          <div className="floating-elements">
            {/* Clouds */}
            <div className="cloud cloud-1">☁️</div>
            <div className="cloud cloud-2">☁️</div>
            <div className="cloud cloud-3">☁️</div>
            
            {/* Educational icons */}
            <div className="float-icon icon-1">🚀</div>
            <div className="float-icon icon-2">📚</div>
            <div className="float-icon icon-3">✏️</div>
            <div className="float-icon icon-4">🌟</div>
            <div className="float-icon icon-5">🎨</div>
            <div className="float-icon icon-6">🔤</div>
            <div className="float-icon icon-7">🔢</div>
            <div className="float-icon icon-8">🪐</div>
            <div className="float-icon icon-9">🌙</div>
            <div className="float-icon icon-10">✨</div>
            
            {/* Orbit rings */}
            <div className="orbit-ring ring-1"></div>
            <div className="orbit-ring ring-2"></div>
            
            {/* Light particles */}
            <div className="particles">
              {Array.from({ length: 15 }).map((_, i) => (
                <span key={i} className="particle" style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}>•</span>
              ))}
            </div>
          </div>

          <div className="splash-content">
            {/* Glassmorphism logo card */}
            <div className="logo-card">
              <div className="logo-glow"></div>
              <img src="/images/logo.png" alt="SpacECE Logo" className="splash-mascot" />
              <div className="logo-particles">
                <span className="logo-sparkle sparkle-1">✨</span>
                <span className="logo-sparkle sparkle-2">⭐</span>
                <span className="logo-sparkle sparkle-3">✨</span>
                <span className="logo-sparkle sparkle-4">⭐</span>
              </div>
            </div>

            {/* Hero heading */}
            <h1 className="splash-hero-title">
              Welcome to <span className="brand-highlight">Spac<span className="ece">ECE</span></span> 🚀
            </h1>
            <p className="splash-hero-subtitle">
              Explore, Learn, and Grow Through Fun Adventures
            </p>

            {/* CTA Button */}
            <button className="cta-button" onClick={(e) => { e.stopPropagation(); goToStep(1); }}>
              <span className="cta-icon">🚀</span>
              <span className="cta-text">Start Learning Adventure</span>
              <div className="cta-glow"></div>
            </button>

            {/* Feature cards */}
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Interactive Lessons</h3>
                <p>Hands-on activities that make learning fun</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎮</div>
                <h3>Fun Learning Games</h3>
                <p>Engaging challenges that build skills</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Achievement Rewards</h3>
                <p>Earn badges and celebrate progress</p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="trust-badges">
              <div className="trust-item">
                <span className="trust-icon">📖</span>
                <span className="trust-number">1000+</span>
                <span className="trust-label">Activities</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">📚</span>
                <span className="trust-number">500+</span>
                <span className="trust-label">Stories</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🎯</span>
                <span className="trust-number">Personalized</span>
                <span className="trust-label">Learning Paths</span>
              </div>
            </div>

            {/* Floating mascot character */}
            <div className="mascot-float">
              <div className="mascot-character">🧑‍🚀</div>
              <div className="mascot-bubble">Let's explore together!</div>
            </div>

            {/* Achievement badges floating */}
            <div className="floating-badges">
              <div className="badge badge-1">⭐</div>
              <div className="badge badge-2">🏅</div>
              <div className="badge badge-3">💎</div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Age Selection */}
      {step === 1 && (
        <div className={`welcome-step step-age ${isAnimating ? 'exit' : ''}`}>
          {/* Decorative background elements */}
          <div className="age-bg-elements">
            {/* Floating educational icons */}
            <div className="age-float-icon icon-a1">☁️</div>
            <div className="age-float-icon icon-a2">⭐</div>
            <div className="age-float-icon icon-a3">📚</div>
            <div className="age-float-icon icon-a4">✨</div>
            <div className="age-float-icon icon-a5">🪐</div>
            <div className="age-float-icon icon-a6">🔤</div>
            <div className="age-float-icon icon-a7">🔢</div>
            <div className="age-float-icon icon-a8">✏️</div>
            <div className="age-float-icon icon-a9">🎨</div>
            <div className="age-float-icon icon-a10">🌈</div>
          </div>

          {/* Mascot character */}
          <div className="age-mascot">
            <div className="mascot-glow-ring"></div>
            <div className="mascot-avatar">👨‍🏫</div>
            <div className="mascot-stars">
              <span className="mascot-star star-1">⭐</span>
              <span className="mascot-star star-2">✨</span>
              <span className="mascot-star star-3">⭐</span>
            </div>
          </div>

          {/* Header section */}
          <div className="age-header">
            <h1 className="age-title">How old are you? 🎂</h1>
            <p className="age-subtitle">Choose your age group and start your learning adventure!</p>
          </div>

          {/* Progress indicator */}
          <div className="step-indicator">
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>

          {/* Glassmorphism container */}
          <div className="age-selection-container">
            <div className="age-cards">
              {AGE_GROUPS.map((ag, i) => (
                <button
                  key={ag.id}
                  className={`age-card ${ageGroup === ag.id ? 'selected' : ''}`}
                  style={{ background: ag.bg, animationDelay: `${i * 0.15}s` }}
                  onClick={() => setAgeGroup(ag.id)}
                  id={`age-card-${ag.id}`}
                >
                  <div className="age-card-glow"></div>
                  <div className="age-card-content">
                    <span className="age-emoji">{ag.emoji}</span>
                    <span className="age-label">{ag.label}</span>
                    <span className="age-desc">{ag.desc}</span>
                  </div>
                  {ageGroup === ag.id && (
                    <div className="age-check-badge">
                      <span className="check-icon">✓</span>
                    </div>
                  )}
                  <div className="age-card-sparkles">
                    <span className="card-sparkle sparkle-1">✨</span>
                    <span className="card-sparkle sparkle-2">⭐</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Premium Continue button */}
          <button
            className="continue-button premium-btn"
            disabled={!ageGroup}
            onClick={() => goToStep(2)}
            id="age-continue-btn"
          >
            <span className="btn-text">Continue</span>
            <span className="btn-arrow">→</span>
            <div className="btn-shine"></div>
          </button>

          {/* Decorative floating elements */}
          <div className="age-decorative-elements">
            <div className="deco-circle circle-1"></div>
            <div className="deco-circle circle-2"></div>
            <div className="deco-circle circle-3"></div>
          </div>
        </div>
      )}

      {/* Step 2: Name Entry */}
      {step === 2 && (
        <div className={`welcome-step step-name ${isAnimating ? 'exit' : ''}`}>
          {/* Decorative background elements */}
          <div className="name-bg-elements">
            {/* Floating educational icons */}
            <div className="name-float-icon icon-n1">☁️</div>
            <div className="name-float-icon icon-n2">⭐</div>
            <div className="name-float-icon icon-n3">📚</div>
            <div className="name-float-icon icon-n4">✨</div>
            <div className="name-float-icon icon-n5">🪐</div>
            <div className="name-float-icon icon-n6">🔤</div>
            <div className="name-float-icon icon-n7">🔢</div>
            <div className="name-float-icon icon-n8">✏️</div>
            <div className="name-float-icon icon-n9">🎨</div>
            <div className="name-float-icon icon-n10">🌈</div>
            <div className="name-float-icon icon-n11">🦄</div>
            <div className="name-float-icon icon-n12">🦖</div>
          </div>

          {/* Animated mascot waving */}
          <div className="name-mascot">
            <div className="mascot-wave-glow"></div>
            <div className="mascot-wave-avatar">👋</div>
            <div className="mascot-wave-sparkles">
              <span className="wave-sparkle sparkle-1">✨</span>
              <span className="wave-sparkle sparkle-2">⭐</span>
              <span className="wave-sparkle sparkle-3">✨</span>
            </div>
          </div>

          {/* Header */}
          <div className="name-header">
            <h1 className="name-title">What's your name? 👋</h1>
            <p className="name-subtitle">Tell us what to call you!</p>
          </div>

          {/* Progress indicator */}
          <div className="step-indicator">
            <span className="dot"></span>
            <span className="dot active"></span>
          </div>

          {/* Glassmorphism main card */}
          <div className="name-main-card">
            {/* Name input section */}
            <div className="name-input-section">
              <div className="name-input-wrapper">
                <input
                  type="text"
                  className="name-input premium-input"
                  placeholder="Type your name..."
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                  maxLength={20}
                  autoFocus
                  id="child-name-input"
                />
                <div className="input-glow-border"></div>
              </div>
              
              {childName && (
                <div className="name-preview premium-preview">
                  <span className="preview-wave">👋</span>
                  <span className="preview-text">Hello, <strong>{childName}</strong>! Nice to meet you!</span>
                </div>
              )}
            </div>

            {/* Avatar picker section */}
            <div className="avatar-picker-section">
              <p className="picker-label">Add a fun character to your name!</p>
              
              <div className="emoji-keyboard premium-keyboard">
                <div className="emoji-tabs premium-tabs">
                  {categoryKeys.map(cat => (
                    <button
                      key={cat}
                      className={`emoji-tab premium-tab ${activeCat === cat ? 'active' : ''}`}
                      onClick={() => setEmojiCategory(cat)}
                    >
                      <span className="tab-icon">{EMOJI_CATEGORIES[cat][0]}</span>
                      <span className="tab-label">{cat}</span>
                    </button>
                  ))}
                </div>
                
                <div className="emoji-grid premium-grid">
                  {(EMOJI_CATEGORIES[activeCat] || []).map((emoji, i) => (
                    <button
                      key={i}
                      className="emoji-btn premium-emoji-btn"
                      onClick={() => addEmoji(emoji)}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <span className="emoji-character">{emoji}</span>
                      <div className="emoji-btn-glow"></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="name-actions premium-actions">
            <button 
              className="btn-back premium-back" 
              onClick={() => goToStep(1)}
            >
              <span className="back-arrow">←</span>
              <span className="back-text">Back</span>
            </button>
            
            <button
              className="btn-continue premium-continue"
              disabled={!childName.trim()}
              onClick={handleSubmit}
              id="name-submit-btn"
            >
              <span className="continue-text">Let's Go!</span>
              <span className="continue-icon">🚀</span>
              <div className="continue-shine"></div>
            </button>
          </div>

          {/* Decorative particles */}
          <div className="name-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="name-particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}>•</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
