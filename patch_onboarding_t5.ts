import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

content = content.replace(
  'function Step1Welcome({ role, name, language }: { role: string; name: string; language: string }) {',
  'function Step1Welcome({ role, name, language }: { role: string; name: string; language: string }) {\n  const { t } = useTranslation("onboarding");'
);

const oldPriorityOpts = `  const priorityOptions = language === "en" ? [
    "Flood & Runoff Risk Reduction",
    "Climate Change Adaptation (heat islands, biodiversity)",
    "De-sealing & Urban Greening",
    "Quality of Life & Citizens (parks, soft mobility)"
  ] : [
    "Réduction du risque inondation & ruissellement",
    "Adaptation au changement climatique (îlots de chaleur, biodiversité)",
    "Désimperméabilisation et reverdissement urbain",
    "Qualité de vie et usages citoyens (parcs, mobilités douces)"
  ];`;

const newPriorityOpts = `  const priorityOptions = [
    { label: t("priorities.GestionRuissellement"), icon: "💧" },
    { label: t("priorities.IlotsChaleur"), icon: "🌡️" },
    { label: t("priorities.Desimpermeabilisation"), icon: "🌱" },
    { label: t("priorities.Vegetalisation"), icon: "🌳" }
  ];`;
  
content = content.replace(oldPriorityOpts, newPriorityOpts);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
