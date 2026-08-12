(function() {
  try {
    let origFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get: () => origFetch,
      set: (v) => { origFetch = v; },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn('Fetch descriptor safeguard error:', e);
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAnalytics } from './services/firebase';
import { AudioEngine } from './engine/AudioEngine';

// Firebase ინიციალიზდება აპლიკაციის ჩატვირთვისთანავე; Analytics არასავალდებულოა
void initAnalytics();

// ხმის სისტემა იხსნება მომხმარებლის პირველივე ჟესტზე (autoplay policy)
AudioEngine.installUnlockHandlers();

/*
 * დიაგნოსტიკა მხოლოდ განვითარების რეჟიმში.
 * კონსოლში: __debug.audio.recordedCount(), __debug.geo.snapshot
 * production build-ში ეს ბლოკი საერთოდ არ ხვდება (import.meta.env.DEV).
 */
if (import.meta.env.DEV) {
  void import('./services/geolocation').then(({ Geo }) => {
    (window as unknown as Record<string, unknown>).__debug = { audio: AudioEngine, geo: Geo };
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
