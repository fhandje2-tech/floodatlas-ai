import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

content = content.replace(
  'function Step3Preferences({ language }: { language: string }) {',
  'function Step3Preferences({ language }: { language: string }) {\n  const { t } = useTranslation("onboarding");'
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
