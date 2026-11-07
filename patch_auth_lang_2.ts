import fs from 'fs';
let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

// Replace all occurrences of useAgentStore.getState().setRole(role); inside handleAuthSuccess with the block
content = content.replace(
  /useAgentStore\.getState\(\)\.setRole\(role\);\n        useAgentStore\.getState\(\)\.setLanguage\(language\);\n        i18n\.changeLanguage\(language\);/g,
  'useAgentStore.getState().setRole(role);'
);

content = content.replace(
  /useAgentStore\.getState\(\)\.setRole\(role\);/g,
  'useAgentStore.getState().setRole(role);\n      useAgentStore.getState().setLanguage(language);\n      i18n.changeLanguage(language);'
);

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
