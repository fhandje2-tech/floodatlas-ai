import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Replace local chatMessages with global messages
content = content.replace(
  'const { activeZone, setActiveZone, role, currentProjectId } = useAgentStore();',
  'const { activeZone, setActiveZone, role, currentProjectId, messages, setMessages } = useAgentStore();\n  const chatMessages = messages || [];\n  const setChatMessages = setMessages;'
);

// Remove local state
content = content.replace('const [chatMessages, setChatMessages] = useState<any[]>([]);', '');

// Update initial prompt to append to existing messages rather than replace them entirely
content = content.replace(
  'setChatMessages([]);',
  '' // We don't want to clear chat history on analysis
);

content = content.replace(
  'const initialPrompt = `Génère un diagnostic détaillé de résilience territoriale pour ${activeZone}. Analyse les aléas climatiques (ruissellement, inondation) et propose des solutions "Ville Éponge" adaptées. Fournis des sources crédibles.`;\n      const res = await fetch(\'/api/chat\', {\n        method: \'POST\',\n        headers: { \'Content-Type\': \'application/json\' },\n        body: JSON.stringify({\n          messages: [{ role: \'user\', content: initialPrompt }],',
  'const initialPrompt = `Génère un diagnostic détaillé de résilience territoriale pour ${activeZone}. Analyse les aléas climatiques (ruissellement, inondation) et propose des solutions "Ville Éponge" adaptées. Fournis des sources crédibles.`;\n      const newMessages = [...chatMessages, { role: "user", content: initialPrompt, id: Date.now().toString() }];\n      setChatMessages(newMessages);\n      const res = await fetch(\'/api/chat\', {\n        method: \'POST\',\n        headers: { \'Content-Type\': \'application/json\' },\n        body: JSON.stringify({\n          messages: newMessages,'
);

content = content.replace(
  'setChatMessages([{ id: \'err\', role: \'ai\', content: "Erreur lors de l\'analyse: " + data.error }]);',
  'setChatMessages([...newMessages, { id: \'err\', role: \'ai\', content: "Erreur lors de l\'analyse: " + data.error }]);'
);

content = content.replace(
  'setChatMessages([{ id: \'err\', role: \'ai\', content: "Erreur de connexion." }]);',
  'setChatMessages([...newMessages, { id: \'err\', role: \'ai\', content: "Erreur de connexion." }]);'
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
