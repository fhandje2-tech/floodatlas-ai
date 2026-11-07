import fs from 'fs';

// 1. Fix AIAssistant.tsx
let contentAI = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');
contentAI = contentAI.replace(
  'const { messages, setMessages, isTyping, setIsTyping, activeZone, zones, role, selectedLevers, resilienceIndex, language } = useAgentStore();',
  'const { currentProjectId, projects, setMessages, isTyping, setIsTyping, activeZone, zones, role, selectedLevers, resilienceIndex, language } = useAgentStore();\n  const messages = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].messages || [] : [];'
);
fs.writeFileSync('src/screens/AIAssistant.tsx', contentAI);

// 2. Fix SmartMapping.tsx
let contentMap = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');
contentMap = contentMap.replace(
  'const { activeZone, setActiveZone, role, currentProjectId, messages, setMessages } = useAgentStore();',
  'const { activeZone, setActiveZone, role, currentProjectId, projects, setMessages } = useAgentStore();\n  const messages = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].messages || [] : [];'
);
fs.writeFileSync('src/screens/SmartMapping.tsx', contentMap);

