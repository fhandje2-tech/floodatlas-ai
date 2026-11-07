const fs = require('fs');
let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

file = file.replace(/const actions = \[\.\.\.content\.matchAll\(\/ACTION:\(\[a-z\]\+\):\?\(\.\*\)\/g\)\];/, 'const actions = [...content.matchAll(/ACTION:([a-z]+)/g)];');

fs.writeFileSync('src/screens/AIAssistant.tsx', file);
