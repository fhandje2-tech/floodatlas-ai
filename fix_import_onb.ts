import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');
if (!content.includes('import { AddressAutocomplete }')) {
  content = content.replace(
    'import { Button }',
    'import { AddressAutocomplete } from "../components/AddressAutocomplete";\nimport { Button }'
  );
  fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
}
