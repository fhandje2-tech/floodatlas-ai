import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(/autoSaveId="map-panels-v3"/g, '');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
