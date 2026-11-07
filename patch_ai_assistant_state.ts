import fs from 'fs';
let content = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

content = content.replace(
  'const { currentProjectId, projects, setMessages, isTyping, setIsTyping, activeZone, zones, role, language } = useAgentStore();\n  const { selectedLevers, resilienceIndex } = currentProjectId && projects[currentProjectId] ? projects[currentProjectId] : { selectedLevers: [], resilienceIndex: 45 };',
  'const { currentProjectId, projects, setMessages, isTyping, setIsTyping, zones, role, language } = useAgentStore();\n  const project = currentProjectId ? projects[currentProjectId] : null;\n  const activeZone = project?.activeZone || null;\n  const selectedLevers = project?.selectedLevers || [];\n  const resilienceIndex = project?.resilienceIndex || 45;'
);

fs.writeFileSync('src/screens/AIAssistant.tsx', content);
