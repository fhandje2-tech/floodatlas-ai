import fs from 'fs';
let content = fs.readFileSync('src/screens/NewProjectScreen.tsx', 'utf8');

if (!content.includes('import { useTranslation } from "react-i18next";')) {
  content = content.replace(
    'import { useNavigate } from "react-router";',
    'import { useNavigate } from "react-router";\nimport { useTranslation } from "react-i18next";'
  );
}

content = content.replace(
  'export function NewProjectScreen() {',
  'export function NewProjectScreen() {\n  const { t } = useTranslation("onboarding");'
);

const oldRoles = `const roles = [
    { id: "Collectivité", label: language === "en" ? "Municipality" : "Collectivité", icon: "🏛️" },
    { id: "Aménageur", label: language === "en" ? "Developer" : "Aménageur", icon: "🏗️" },
    { id: "Bureau d'études", label: language === "en" ? "Consultancy" : "Bureau d'études", icon: "📐" },
    { id: "Gestionnaire de risques", label: language === "en" ? "Risk Manager" : "Gestionnaire de risques", icon: "🛡️" }
  ];`;
  
const newRoles = `const roles = [
    { id: "Collectivité", label: t("roles.Municipality"), icon: "🏛️" },
    { id: "Aménageur", label: t("roles.Developer"), icon: "🏗️" },
    { id: "Bureau d'études", label: t("roles.Consultancy"), icon: "📐" },
    { id: "Gestionnaire de risques", label: t("roles.RiskManager"), icon: "🛡️" }
  ];`;
content = content.replace(oldRoles, newRoles);

content = content.replace(/\{language === "en" \? "New Project" : "Nouveau Projet"\}/g, '{t("newProjectTitle")}');
content = content.replace(/\{language === "en" \? "Set up a new isolated workspace for your territory\." : "Configurez un nouvel espace de travail isolé pour votre territoire\."\}/g, '{t("newProjectDesc")}');
content = content.replace(/\{language === "en" \? "Project Name" : "Nom du Projet"\}/g, '{t("projectName")}');
content = content.replace(/language === "en" \? "e\.g\. Flood Risk Assessment 2026" : "ex: Plan de prévention 2026"/g, 't("projectNamePlaceholder")');
content = content.replace(/\{language === "en" \? "Territory \/ Zone" : "Territoire \/ Zone"\}/g, '{t("territoryZone")}');
content = content.replace(/language === "en" \? "City, region, or address\.\.\." : "Ville, région ou adresse\.\.\."/g, 't("territoryZonePlaceholder")');
content = content.replace(/\{language === "en" \? "Your Profile \/ Role" : "Votre Profil \/ Rôle"\}/g, '{t("yourProfile")}');
content = content.replace(/\{language === "en" \? "Brief Context \(Optional\)" : "Contexte \(Optionnel\)"\}/g, '{t("briefContext")}');
content = content.replace(/language === "en" \? "What are the main objectives of this project\?" : "Quels sont les objectifs principaux de ce projet \?"/g, 't("briefContextPlaceholder")');
content = content.replace(/\{language === "en" \? "Cancel" : "Annuler"\}/g, '{t("cancel")}');
content = content.replace(/\{language === "en" \? "Create Project" : "Créer le Projet"\}/g, '{t("createProject")}');

fs.writeFileSync('src/screens/NewProjectScreen.tsx', content);
