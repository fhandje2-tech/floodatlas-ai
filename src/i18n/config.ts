import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪', dir: 'rtl' }
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

export const getSavedLanguage = (): string => {
  try {
    // 1. Explicit local storage keys
    const direct = localStorage.getItem('sponge_city_lang') || localStorage.getItem('i18nextLng');
    if (direct) {
      const code = direct.slice(0, 2).toLowerCase();
      if (['fr', 'en', 'de', 'ar'].includes(code)) {
        return code;
      }
    }
    // 2. Zustand agent-storage-v2 persistence
    const zustandRaw = localStorage.getItem('agent-storage-v2');
    if (zustandRaw) {
      const parsed = JSON.parse(zustandRaw);
      const code = parsed.state?.language?.slice(0, 2)?.toLowerCase();
      if (code && ['fr', 'en', 'de', 'ar'].includes(code)) {
        return code;
      }
    }
    // 3. Browser navigator language
    const nav = navigator.language?.slice(0, 2)?.toLowerCase();
    if (nav && ['fr', 'en', 'de', 'ar'].includes(nav)) {
      return nav;
    }
  } catch (e) {
    // ignore
  }
  return 'fr';
};

export const applyDocumentDirection = (lang: string) => {
  if (typeof document !== 'undefined') {
    const code = (lang || 'fr').slice(0, 2).toLowerCase();
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  }
};

const initialLang = getSavedLanguage();
applyDocumentDirection(initialLang);

i18next
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: initialLang,
    fallbackLng: 'fr',
    preload: ['fr', 'en', 'de', 'ar'],
    ns: ['common', 'auth', 'dashboard', 'analysis', 'mapping', 'assistant', 'reports', 'scenarios', 'settings', 'onboarding'],
    defaultNS: 'common',
    backend: { 
      loadPath: '/locales/{{lng}}/{{ns}}.json' 
    },
    react: {
      useSuspense: false,
    },
    interpolation: { escapeValue: false }
  });

// Listen to language changes to keep HTML attributes synchronized
i18next.on('languageChanged', (lng) => {
  applyDocumentDirection(lng);
  try {
    localStorage.setItem('sponge_city_lang', lng);
    localStorage.setItem('i18nextLng', lng);
  } catch (e) {
    // storage unavailable
  }
});

export default i18next;
