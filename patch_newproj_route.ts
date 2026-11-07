import fs from 'fs';
let content = fs.readFileSync('src/screens/NewProjectScreen.tsx', 'utf8');

content = content.replace(
  'navigate(`/project/${id}/assistant`);',
  'navigate(`/project/${id}/map`);'
);

fs.writeFileSync('src/screens/NewProjectScreen.tsx', content);
