import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(
  `messages: newMessages.map(m => ({ role: m.role, content: m.content })),\n          zoneToUse || activeZone,`,
  `messages: newMessages.map(m => ({ role: m.role, content: m.content })),\n          activeZone: zoneToUse || activeZone,`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("JSON syntax fixed");
