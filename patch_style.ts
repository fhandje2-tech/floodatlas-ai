import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(/"https:\/\/basemaps\.cartocdn\.com\/gl\/dark-matter-gl-style\/style\.json"/g, '"https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Style patched");
