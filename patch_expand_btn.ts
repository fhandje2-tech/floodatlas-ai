import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(/className="absolute top-6 right-6 z-50"/g, 'className="absolute top-6 right-20 z-50"');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Patched expand btn");
