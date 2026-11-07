import fs from 'fs';
let content = fs.readFileSync('src/i18n/config.ts', 'utf8');
content = content.replace(
  "ns: ['common', 'auth', 'dashboard', 'analysis', 'mapping', 'assistant', 'reports', 'scenarios', 'settings']",
  "ns: ['common', 'auth', 'dashboard', 'analysis', 'mapping', 'assistant', 'reports', 'scenarios', 'settings', 'onboarding']"
);
fs.writeFileSync('src/i18n/config.ts', content);
