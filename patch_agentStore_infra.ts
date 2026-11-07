import fs from 'fs';
let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

// Add to ProjectState
content = content.replace(
  `  diagnosticPriorities: string[];`,
  `  diagnosticPriorities: string[];\n  criticalInfrastructures: any[];`
);

// Add to AgentState
content = content.replace(
  `  setDiagnosticPriorities: (priorities: string[]) => void;`,
  `  setDiagnosticPriorities: (priorities: string[]) => void;\n  get criticalInfrastructures(): any[];\n  setCriticalInfrastructures: (infras: any[]) => void;`
);

// Add to createProject
content = content.replace(
  `          diagnosticPriorities: ["Risque inondation (ruissellement)"],`,
  `          diagnosticPriorities: ["Risque inondation (ruissellement)"],\n          criticalInfrastructures: [],`
);

// Add getters/setters
content = content.replace(
  `      setDiagnosticPriorities: (priorities) => get().updateCurrentProject(() => ({ diagnosticPriorities: priorities })),`,
  `      setDiagnosticPriorities: (priorities) => get().updateCurrentProject(() => ({ diagnosticPriorities: priorities })),\n      get criticalInfrastructures() {\n        const state = get();\n        return state.currentProjectId ? state.projects[state.currentProjectId]?.criticalInfrastructures || [] : [];\n      },\n      setCriticalInfrastructures: (infras) => get().updateCurrentProject(() => ({ criticalInfrastructures: infras })),`
);

fs.writeFileSync('src/stores/agentStore.ts', content);
console.log("agentStore patched for criticalInfrastructures");
