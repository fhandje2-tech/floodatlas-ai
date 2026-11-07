import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'const lastMessage = history.pop().parts[0].text;',
  `const lastMessage = history.pop().parts[0].text;
      
      if (history.length > 0 && history[0].role === 'model') {
        history.unshift({ role: 'user', parts: [{ text: "Bonjour" }] });
      }`
);

fs.writeFileSync('server.ts', content);
