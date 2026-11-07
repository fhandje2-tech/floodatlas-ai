import fs from 'fs';
let content = fs.readFileSync('src/screens/NewProjectScreen.tsx', 'utf8');
content = content.replace(
  'navigate(`/project/${id}/map`);',
  'navigate(`/project/${id}/assistant`);'
);
fs.writeFileSync('src/screens/NewProjectScreen.tsx', content);
