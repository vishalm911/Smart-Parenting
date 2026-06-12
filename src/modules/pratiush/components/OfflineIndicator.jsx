import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import './OfflineIndicator.css';

export default function OfflineIndicator() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    function handleOffline() { setIsOffline(true); setShowReconnect(false); }
    function handleOnline() {
      setIsOffline(false);
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnect) return null;

  return (
    <div
      className={`offline-indicator ${isOffline ? 'offline' : 'reconnected'}`}
      role="alert"
      id="offline-indicator"
    >
      <span className="offline-text">
        {isOffline ? t('offlineMsg') : t('backOnline')}
      </span>
    </div>
  );
}
