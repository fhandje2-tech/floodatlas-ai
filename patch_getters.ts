import fs from 'fs';

function replaceGetters(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('const { activeZone, lastAnalysis, lastScenario, selectedLevers } = useAgentStore();')) {
    content = content.replace(
      'const { activeZone, lastAnalysis, lastScenario, selectedLevers } = useAgentStore();',
      'const { currentProjectId, projects, activeZone } = useAgentStore();\n  const { lastAnalysis, lastScenario, selectedLevers } = currentProjectId && projects[currentProjectId] ? projects[currentProjectId] : { lastAnalysis: null, lastScenario: null, selectedLevers: [] };'
    );
  }

  if (content.includes('const { activeZone, selectedLevers, setSelectedLevers, setLastScenario } = useAgentStore();')) {
    content = content.replace(
      'const { activeZone, selectedLevers, setSelectedLevers, setLastScenario } = useAgentStore();',
      'const { currentProjectId, projects, activeZone, setSelectedLevers, setLastScenario } = useAgentStore();\n  const selectedLevers = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].selectedLevers || [] : [];'
    );
  }

  if (content.includes('const { currentProjectId, projects, setMessages, isTyping, setIsTyping, activeZone, zones, role, selectedLevers, resilienceIndex, language } = useAgentStore();')) {
    content = content.replace(
      'const { currentProjectId, projects, setMessages, isTyping, setIsTyping, activeZone, zones, role, selectedLevers, resilienceIndex, language } = useAgentStore();',
      'const { currentProjectId, projects, setMessages, isTyping, setIsTyping, activeZone, zones, role, language } = useAgentStore();\n  const { selectedLevers, resilienceIndex } = currentProjectId && projects[currentProjectId] ? projects[currentProjectId] : { selectedLevers: [], resilienceIndex: 45 };'
    );
  }
  
  fs.writeFileSync(filePath, content);
}

replaceGetters('src/screens/ReportGenerator.tsx');
replaceGetters('src/screens/ScenarioSimulation.tsx');
replaceGetters('src/components/panels/ScenarioPanel.tsx');
replaceGetters('src/screens/AIAssistant.tsx');
