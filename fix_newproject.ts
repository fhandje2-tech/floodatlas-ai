import fs from 'fs';

let content = fs.readFileSync('src/screens/NewProjectScreen.tsx', 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync('src/screens/NewProjectScreen.tsx', content);

