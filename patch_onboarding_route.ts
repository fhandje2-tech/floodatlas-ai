import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

content = content.replace(
  'navigate(`/project/${projectId}/assistant`);',
  'navigate(`/project/${projectId}/map`);'
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
