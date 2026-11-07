import fs from 'fs';

let content = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

content = content.replace(
  'const { messages, setMessages, isTyping, setIsTyping, activeZone, zones, role, selectedLevers, resilienceIndex } = useAgentStore();',
  'const { messages, setMessages, isTyping, setIsTyping, activeZone, zones, role, selectedLevers, resilienceIndex, language } = useAgentStore();'
);

content = content.replace(
  'activeZone,\n          role,\n          selectedLevers,\n          resilienceIndex',
  'activeZone,\n          role,\n          selectedLevers,\n          resilienceIndex,\n          language'
);

// Part C: AI Assistant Layout
// Fix AIAssistant.tsx layout so generated results/analysis content is never visually obscured or cut off by the fixed chat input bar
content = content.replace(
  'className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col pb-56"',
  'className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col pb-64"'
);

fs.writeFileSync('src/screens/AIAssistant.tsx', content);
