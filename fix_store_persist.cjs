const fs = require('fs');

let file = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

if (!file.includes("persist")) {
  file = file.replace(/import \{ create \} from 'zustand';/, "import { create } from 'zustand';\nimport { persist } from 'zustand/middleware';");
  file = file.replace(/export const useAgentStore = create<AgentState>\(\(set\) => \(\{/, "export const useAgentStore = create<AgentState>()(\n  persist(\n    (set) => ({");
  file = file.replace(/\}\)\);/, "    }),\n    {\n      name: 'agent-storage',\n    }\n  )\n);");
  fs.writeFileSync('src/stores/agentStore.ts', file);
}
