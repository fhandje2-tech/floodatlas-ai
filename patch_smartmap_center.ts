import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');
content = content.replace('center: [-0.1276, 51.5072],', 'center: [2.3522, 48.8566], // Paris default instead of London');
fs.writeFileSync('src/screens/SmartMapping.tsx', content);
