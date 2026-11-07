import fs from 'fs';

let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

content = content.replace(
  "name: 'agent-storage',",
  "name: 'agent-storage',\n      partialize: (state) => ({\n        projects: state.projects,\n        currentProjectId: state.currentProjectId,\n        role: state.role,\n        zones: state.zones,\n        language: state.language\n      }),"
);

fs.writeFileSync('src/stores/agentStore.ts', content);
