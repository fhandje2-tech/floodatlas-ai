import fs from 'fs';
let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

// I need to add lastVisitedPath and setLastVisitedPath to the initial state block
// in the zustand create<AgentState>()(persist((set, get) => ({ ... })))

content = content.replace(
  '      contextPanelOpen: false,',
  '      lastVisitedPath: null,\n      setLastVisitedPath: (path) => set({ lastVisitedPath: path }),\n      contextPanelOpen: false,'
);

fs.writeFileSync('src/stores/agentStore.ts', content);
