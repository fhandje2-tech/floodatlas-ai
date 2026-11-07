import fs from 'fs';
let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

// Add context to ProjectState
content = content.replace(
  `export interface ProjectState {
  id: string;
  name: string;
  activeZone: string | null;`,
  `export interface ProjectState {
  id: string;
  name: string;
  activeZone: string | null;
  context?: string;`
);

// Add context to createProject
content = content.replace(
  `createProject: (name: string, activeZone: string | null, lang?: string) => string;`,
  `createProject: (name: string, activeZone: string | null, lang?: string, context?: string) => string;`
);

// Update createProject implementation
content = content.replace(
  `createProject: (name, activeZone, lang = "fr") => {`,
  `createProject: (name, activeZone, lang = "fr", context = "") => {`
);

content = content.replace(
  `name,
          activeZone,`,
  `name,
          activeZone,
          context,`
);

fs.writeFileSync('src/stores/agentStore.ts', content);
console.log("AgentStore patched successfully");
