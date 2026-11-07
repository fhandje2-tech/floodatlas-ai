import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Fix the undefined newMessages error inside runAnalysis
content = content.replace(
  'setChatMessages([...newMessages, { id: \'err\', role: \'ai\', content: "Erreur lors de l\'analyse: " + data.error }]);',
  'setChatMessages(prev => [...prev, { id: \'err\', role: \'ai\', content: "Erreur lors de l\'analyse: " + data.error }]);'
);

content = content.replace(
  'setChatMessages([...newMessages, { id: \'err\', role: \'ai\', content: "Erreur de connexion." }]);',
  'setChatMessages(prev => [...prev, { id: \'err\', role: \'ai\', content: "Erreur de connexion." }]);'
);

// We need to also fix the success case of runAnalysis which was probably untouched but we want to make sure it appends
content = content.replace(
  'setChatMessages([{          id: Date.now().toString(),          role: \'ai\',          content: data.content        }]);',
  'setChatMessages(prev => [...prev, { id: Date.now().toString(), role: \'ai\', content: data.content }]);'
);

content = content.replace(
  'setChatMessages([{          id: Date.now().toString(),\n          role: \'ai\',\n          content: data.content\n        }]);',
  'setChatMessages(prev => [...prev, { id: Date.now().toString(), role: \'ai\', content: data.content }]);'
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
