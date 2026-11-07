import fs from 'fs';
let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

// Add to ProjectState
content = content.replace(
  `  selectedLevers: string[];\n  resilienceIndex: number;`,
  `  selectedLevers: string[];\n  resilienceIndex: number;\n  diagnosticPriorities: string[];`
);

// Add to AgentState
content = content.replace(
  `  setSelectedLevers: (levers: string[]) => void;\n  get resilienceIndex(): number;`,
  `  setSelectedLevers: (levers: string[]) => void;\n  get diagnosticPriorities(): string[];\n  setDiagnosticPriorities: (priorities: string[]) => void;\n  get resilienceIndex(): number;`
);

// Add to createProject
content = content.replace(
  `          selectedLevers: [],\n          resilienceIndex: 45,`,
  `          selectedLevers: [],\n          resilienceIndex: 45,\n          diagnosticPriorities: ["Risque inondation (ruissellement)"],`
);

// Add getters/setters
content = content.replace(
  `      get resilienceIndex() {`,
  `      get diagnosticPriorities() {
        const state = get();
        return state.currentProjectId ? state.projects[state.currentProjectId]?.diagnosticPriorities || ["Risque inondation (ruissellement)"] : ["Risque inondation (ruissellement)"];
      },
      setDiagnosticPriorities: (priorities) => get().updateCurrentProject(() => ({ diagnosticPriorities: priorities })),
      get resilienceIndex() {`
);

fs.writeFileSync('src/stores/agentStore.ts', content);
console.log("agentStore patched for priorities");
