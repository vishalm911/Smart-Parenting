import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../i18n';
import { useLocation } from 'react-router-dom';
import './Mascot.css';

const IDLE_TIMEOUT = 30000; // 30 seconds
const MESSAGE_DURATION = 4000;

export default function Mascot({ visible = true, triggerAchieve = 0 }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [state, setState] = useState('idle'); // idle, wave, jump, peek, confused
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const idleTimer = useRef(null);
  const messageTimer = useRef(null);

  const idleMessages = [t('mascotIdle1'), t('mascotIdle2'), t('mascotIdle3')];
  const achieveMessages = [t('mascotAchieve1'), t('mascotAchieve2'), t('mascotAchieve3')];

  const showBubble = useCallback((msg, duration = MESSAGE_DURATION) => {
    setMessage(msg);
    setShowMessage(true);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setShowMessage(false), duration);
  }, []);

  // Reset idle timer on user interaction
  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setState('wave');
      const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
      showBubble(msg);
      setTimeout(() => setState('idle'), 2000);
    }, IDLE_TIMEOUT);
  }, [idleMessages, showBubble]);

  useEffect(() => {
    resetIdle();
    const events = ['click', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    return () => {
      clearTimeout(idleTimer.current);
      clearTimeout(messageTimer.current);
      events.forEach(e => window.removeEventListener(e, resetIdle));
    };
  }, [resetIdle]);

  // React to page navigation
  useEffect(() => {
    setState('peek');
    setTimeout(() => setState('idle'), 1200);
  }, [location.pathname]);

  // React to achievement trigger
  useEffect(() => {
    if (triggerAchieve > 0) {
      setState('jump');
      const msg = achieveMessages[Math.floor(Math.random() * achieveMessages.length)];
      showBubble(msg, 5000);
      setTimeout(() => setState('idle'), 2500);
    }
  }, [triggerAchieve]);

  // Welcome message on mount
  useEffect(() => {
    setTimeout(() => showBubble(t('mascotWelcome'), 5000), 1500);
  }, []);

  if (!visible) return null;

  return (
    <div className={`mascot-container ${minimized ? 'minimized' : ''}`} id="mascot-companion">
      {/* Speech Bubble */}
      {showMessage && !minimized && (
        <div className="mascot-bubble" onClick={() => setShowMessage(false)}>
          <span className="bubble-text">{message}</span>
          <span className="bubble-pointer" />
        </div>
      )}

      {/* Mascot Character */}
      <button
        className={`mascot-character mascot-${state}`}
        onClick={() => {
          if (minimized) {
            setMinimized(false);
          } else {
            const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
            showBubble(msg);
          }
        }}
        aria-label="Mascot companion"
      >
        <img
          src="/images/logo.png"
          alt="SpacECE Mascot"
          className="mascot-img"
          draggable="false"
        />
        {state === 'jump' && (
          <div className="mascot-sparkles">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="sparkle" style={{
                '--angle': `${i * 60}deg`,
                '--delay': `${i * 0.1}s`,
              }}>✦</span>
            ))}
          </div>
        )}
      </button>

      {/* Minimize button */}
      {!minimized && (
        <button
          className="mascot-minimize"
          onClick={(e) => { e.stopPropagation(); setMinimized(true); setShowMessage(false); }}
          aria-label="Minimize mascot"
        >
          ▾
        </button>
      )}
    </div>
  );
}
