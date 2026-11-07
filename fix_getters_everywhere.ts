import fs from 'fs';

const files = [
  'src/components/layout/TopBar.tsx',
  'src/components/layout/AppShell.tsx',
  'src/screens/TerritoryAnalysis.tsx',
  'src/components/panels/AnalysisPanel.tsx',
  'src/screens/SmartMapping.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // AppShell.tsx
  if (file.includes('AppShell.tsx')) {
    content = content.replace(
      'const { setZones, setActiveZone, activeZone, setLanguage, setMessages, role, setCurrentProject, currentProjectId, projects, setLastVisitedPath } = useAgentStore();',
      'const { setZones, setActiveZone, setLanguage, setMessages, role, setCurrentProject, currentProjectId, projects, setLastVisitedPath } = useAgentStore();\n  const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;'
    );
  }
  
  // TopBar.tsx
  if (file.includes('TopBar.tsx')) {
    content = content.replace(
      'const { activeZone, zones, setActiveZone } = useAgentStore();',
      'const { currentProjectId, projects, zones, setActiveZone } = useAgentStore();\n  const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;'
    );
  }
  
  // AnalysisPanel.tsx and TerritoryAnalysis.tsx
  if (file.includes('AnalysisPanel.tsx') || file.includes('TerritoryAnalysis.tsx')) {
    content = content.replace(
      'const { activeZone, setActiveZone, setResilienceIndex } = useAgentStore();',
      'const { currentProjectId, projects, setActiveZone, setResilienceIndex } = useAgentStore();\n  const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;'
    );
  }
  
  // SmartMapping.tsx
  if (file.includes('SmartMapping.tsx')) {
    content = content.replace(
      'const { activeZone, setActiveZone, role, currentProjectId, projects, setMessages } = useAgentStore();',
      'const { setActiveZone, role, currentProjectId, projects, setMessages } = useAgentStore();\n  const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;'
    );
  }

  fs.writeFileSync(file, content);
}
