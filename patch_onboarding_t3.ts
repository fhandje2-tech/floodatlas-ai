import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

// The main problem is that Step2Territory was using t without it being imported properly maybe? 
// No, I injected it into Step2Territory but wait, t is not available in OnboardingScreen outside the component body.
// Oh, the t("welcomeName") stuff is in Step1Role which I missed.

content = content.replace(
  'function Step1Role({ role, setRole, language, name }: { role: string; setRole: (r: string) => void; language: string; name: string; }) {',
  'function Step1Role({ role, setRole, language, name }: { role: string; setRole: (r: string) => void; language: string; name: string; }) {\n  const { t } = useTranslation("onboarding");'
);

// We need to fix the priorityOptions type issue in Step3Priorities.
const fixedPriorityOptions = `
  const priorityOptions = [
    { id: "Desimpermeabilisation", label: t("priorities.Desimpermeabilisation"), icon: "🌱" },
    { id: "GestionRuissellement", label: t("priorities.GestionRuissellement"), icon: "💧" },
    { id: "IlotsChaleur", label: t("priorities.IlotsChaleur"), icon: "🌡️" },
    { id: "Vegetalisation", label: t("priorities.Vegetalisation"), icon: "🌳" },
    { id: "PreservationBiodiversite", label: t("priorities.PreservationBiodiversite"), icon: "🦋" }
  ];
`;

content = content.replace(/const priorityOptions = \[[\s\S]*?\];/, fixedPriorityOptions.trim());

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
