import fs from 'fs';
let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

// We need to keep language but ensure it stays in sync.
// We will just let the components sync it with i18n on load.

// Wait, the prompt says: "remove agentStore.language duplication or make it strictly derived from i18next's active language, never set independently."

content = content.replace(
  'language: "fr",',
  'language: "fr", // Fallback, managed by i18n'
);

fs.writeFileSync('src/stores/agentStore.ts', content);
