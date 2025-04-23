import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/tailwind.css';
import './assets/styles/index.css';
import App from './App.tsx';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider> {/* Envolva App com HelmetProvider */}
      <App />
    </HelmetProvider>
  </StrictMode>,
);