export type ThemeMode = 'dark' | 'light' | 'system' | 'high-contrast' | 'high-contrast-light';

export function getSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem('sponge_city_theme') as ThemeMode;
    if (saved && ['dark', 'light', 'system', 'high-contrast', 'high-contrast-light'].includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'dark';
}

export function applyTheme(mode: ThemeMode) {
  try {
    localStorage.setItem('sponge_city_theme', mode);
  } catch (e) {}

  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Remove all theme classes first
  root.classList.remove('light', 'dark', 'high-contrast', 'high-contrast-light');

  if (mode === 'high-contrast') {
    root.classList.add('dark', 'high-contrast');
    root.setAttribute('data-theme', 'high-contrast');
  } else if (mode === 'high-contrast-light') {
    root.classList.add('light', 'high-contrast-light');
    root.setAttribute('data-theme', 'high-contrast-light');
  } else if (mode === 'light') {
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
  } else if (mode === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    // System
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }
  }
}
