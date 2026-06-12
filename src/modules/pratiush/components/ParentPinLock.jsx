import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n';
import './ParentPinLock.css';

const PIN_HASH_KEY = 'spacece_pin_hash';
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 30;

async function hashPin(pin) {
  const encoded = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hasPinSet() {
  return !!localStorage.getItem(PIN_HASH_KEY);
}

export async function setParentPin(pin) {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
}

export function removeParentPin() {
  localStorage.removeItem(PIN_HASH_KEY);
}

export async function verifyPin(pin) {
  const stored = localStorage.getItem(PIN_HASH_KEY);
  if (!stored) return true;
  const hash = await hashPin(pin);
  return hash === stored;
}

export default function ParentPinLock({ isOpen, onSuccess, onCancel, mode = 'verify' }) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState('enter'); // 'enter' or 'confirm' (for set mode)
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setStep('enter');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigit = useCallback((digit) => {
    if (cooldown > 0) return;
    if (step === 'confirm') {
      if (confirmPin.length < 4) setConfirmPin(prev => prev + digit);
    } else {
      if (pin.length < 4) setPin(prev => prev + digit);
    }
  }, [pin, confirmPin, step, cooldown]);

  const handleBackspace = () => {
    if (step === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
    setError('');
  };

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (mode === 'set') {
      if (step === 'enter' && pin.length === 4) {
        setStep('confirm');
      } else if (step === 'confirm' && confirmPin.length === 4) {
        if (pin === confirmPin) {
          setParentPin(pin).then(() => {
            setSuccess(true);
            setTimeout(() => onSuccess?.(), 800);
          });
        } else {
          setError(t('pinWrong'));
          setConfirmPin('');
          setStep('enter');
          setPin('');
        }
      }
    } else if (pin.length === 4) {
      verifyPin(pin).then(valid => {
        if (valid) {
          setSuccess(true);
          setTimeout(() => onSuccess?.(), 600);
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          setError(t('pinWrong'));
          setPin('');
          if (newAttempts >= MAX_ATTEMPTS) {
            setCooldown(COOLDOWN_SECONDS);
            setAttempts(0);
          }
        }
      });
    }
  }, [pin, confirmPin, step, mode]);

  if (!isOpen) return null;

  const currentPin = step === 'confirm' ? confirmPin : pin;
  const title = mode === 'set'
    ? (step === 'confirm' ? t('pinDesc') : t('pinSetTitle'))
    : t('pinTitle');
  const desc = mode === 'set'
    ? (step === 'confirm' ? 'Re-enter PIN to confirm' : t('pinSetDesc'))
    : t('pinDesc');

  return (
    <div className="pin-overlay" onClick={onCancel}>
      <div className={`pin-modal ${success ? 'success' : ''}`} onClick={e => e.stopPropagation()}>
        {onCancel && (
          <button className="pin-close" onClick={onCancel} aria-label="Close">✕</button>
        )}

        <div className="pin-header">
          <span className="pin-icon">{success ? '✅' : '🔒'}</span>
          <h2>{success ? t('pinSuccess') : title}</h2>
          <p>{!success && desc}</p>
        </div>

        {!success && (
          <>
            {/* PIN dots */}
            <div className="pin-dots">
              {[0, 1, 2, 3].map(i => (
                <span
                  key={i}
                  className={`pin-dot ${i < currentPin.length ? 'filled' : ''} ${error ? 'shake' : ''}`}
                />
              ))}
            </div>

            {/* Error / Cooldown */}
            {error && !cooldown && <p className="pin-error">{error}</p>}
            {cooldown > 0 && (
              <p className="pin-cooldown">
                {t('pinCooldown', { seconds: cooldown })}
              </p>
            )}

            {/* Number pad */}
            <div className="pin-pad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'back'].map((key, i) => {
                if (key === null) return <span key={i} className="pin-key empty" />;
                if (key === 'back') {
                  return (
                    <button key={i} className="pin-key pin-back" onClick={handleBackspace}>
                      ←
                    </button>
                  );
                }
                return (
                  <button
                    key={i}
                    className="pin-key"
                    onClick={() => handleDigit(String(key))}
                    disabled={cooldown > 0}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
