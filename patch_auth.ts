import fs from 'fs';
let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

content = content.replace(/useAgentStore\.getState\(\)\.lastVisitedPath \|\| "\/dashboard"/g, '"/dashboard"');

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
