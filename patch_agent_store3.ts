import fs from 'fs';

let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

content = content.replace(
  'createProject: (name: string, activeZone: string | null) => string;',
  'createProject: (name: string, activeZone: string | null, lang?: string) => string;'
);

fs.writeFileSync('src/stores/agentStore.ts', content);
