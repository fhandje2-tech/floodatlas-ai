import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

// Ensure language state is retrieved
if (!content.includes('const language = useAgentStore.getState().language')) {
  content = content.replace(
    'const [error, setError] = useState<string | null>(null);',
    'const [error, setError] = useState<string | null>(null);\n  const language = useAgentStore((state) => state.language);'
  );
}

// Pass language down
content = content.replace(
  '<Step1Welcome role={role} name={name} />',
  '<Step1Welcome role={role} name={name} language={language} />'
);
content = content.replace(
  '<Step2Territory zones={zones} setZones={setZones} />',
  '<Step2Territory zones={zones} setZones={setZones} language={language} />'
);
content = content.replace(
  '<Step3Preferences />',
  '<Step3Preferences language={language} />'
);
content = content.replace(
  '<Step4Tour />',
  '<Step4Tour language={language} />'
);

content = content.replace(
  /function Step1Welcome\(\{ role, name \}: \{ role: string; name: string \}\) \{/,
  'function Step1Welcome({ role, name, language }: { role: string; name: string; language: string }) {'
);

content = content.replace(
  /function Step2Territory\(\{ zones, setZones \}: \{ zones: string\[\]; setZones: React\.Dispatch<React\.SetStateAction<string\[\]>> \}\) \{/,
  'function Step2Territory({ zones, setZones, language }: { zones: string[]; setZones: React.Dispatch<React.SetStateAction<string[]>>; language: string }) {'
);

content = content.replace(
  /function Step3Preferences\(\) \{/,
  'function Step3Preferences({ language }: { language: string }) {'
);

content = content.replace(
  /function Step4Tour\(\) \{/,
  'function Step4Tour({ language }: { language: string }) {'
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
