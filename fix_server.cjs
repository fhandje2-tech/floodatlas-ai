const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

file = file.replace(/const prompt = \\`Active Zone/, 'const prompt = `Active Zone');
file = file.replace(/User Query: \\\$\{lastMessage\}\\`/, 'User Query: ${lastMessage}`');
file = file.replace(/Unknown"\\}\\n\\n/, 'Unknown"}\\n\\n');

fs.writeFileSync('server.ts', file);
