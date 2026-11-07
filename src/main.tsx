import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import './i18n/config.ts';
import { applyTheme, getSavedTheme } from './lib/theme';

applyTheme(getSavedTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
