import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In development, unregister any active service worker and clear caches to prevent stale chunk mismatches
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let unregisteredAny = false;
      const unregisterPromises = registrations.map((registration) => {
        return registration.unregister().then((success) => {
          if (success) {
            console.log('Unregistered stale service worker in development mode.');
            unregisteredAny = true;
          }
        });
      });
      Promise.all(unregisterPromises).then(() => {
        if (unregisteredAny) {
          window.location.reload();
        }
      });
    });

    if (window.caches) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
    });
  }
}
