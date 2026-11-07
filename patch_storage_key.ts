import fs from 'fs';

let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

content = content.replace(
  "name: 'agent-storage',",
  "name: 'agent-storage-v2',"
);

fs.writeFileSync('src/stores/agentStore.ts', content);
