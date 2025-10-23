// Block unwanted fetch requests to localhost:4444/logs
if (window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function(resource, init) {
    if (typeof resource === 'string' && resource.includes('localhost:4444/logs')) {
      console.warn('Blocked log request to:', resource);
      return Promise.resolve(new Response(null, {status: 204}));
    }
    return originalFetch(resource, init);
  }
}

// Then your normal imports
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
