import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

// Fonts — choose ONE of these approaches
// Option A (recommended):
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/700.css';
import '@fontsource-variable/inter';

// Option B (self-hosted):
// import './assets/fonts/fonts.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);