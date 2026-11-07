import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const targetStr = `messages: newMessages.map(m => ({ role: m.role, content: m.content })),\n          zoneToUse || activeZone,\n          role,`;

const repStr = `messages: newMessages.map(m => ({ role: m.role, content: m.content })),\n          activeZone: zoneToUse || activeZone,\n          role,`;

content = content.replace(targetStr, repStr);

// Also verify selectedLevers doesn't have syntax errors, it looks fine from the cat output

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("JSON syntax fixed again");
