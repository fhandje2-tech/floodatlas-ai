import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(/autoSaveId="smartmap-panels"/g, '');
content = content.replace(/order=\{1\}/g, '');
content = content.replace(/order=\{2\}/g, '');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Fixed Panel props");
