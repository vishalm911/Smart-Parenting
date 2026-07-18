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
    // In development, unregister any active service worker and clear caches
    // without forcing a hard reload, which was interrupting the login flow.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      const unregisterPromises = registrations.map((registration) => {
        return registration.unregister().then((success) => {
          if (success) {
            console.log('Unregistered stale service worker in development mode.');
          }
        });
      });

      Promise.all(unregisterPromises).catch((err) => {
        console.warn('Failed to unregister service worker in development mode:', err);
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
