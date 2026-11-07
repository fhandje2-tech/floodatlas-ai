import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

// Add t to Step2Territory
content = content.replace(
  'function Step2Territory({ zones, setZones, language }: { zones: string[]; setZones: React.Dispatch<React.SetStateAction<string[]>>; language: string }) {',
  'function Step2Territory({ zones, setZones, language }: { zones: string[]; setZones: React.Dispatch<React.SetStateAction<string[]>>; language: string }) {\n  const { t } = useTranslation("onboarding");'
);

// Add t to Step3Priorities
content = content.replace(
  'function Step3Priorities({ language }: { language: string }) {',
  'function Step3Priorities({ language }: { language: string }) {\n  const { t } = useTranslation("onboarding");'
);

// Add t to Step4Ready
content = content.replace(
  'function Step4Ready({ language }: { language: string }) {',
  'function Step4Ready({ language }: { language: string }) {\n  const { t } = useTranslation("onboarding");'
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
