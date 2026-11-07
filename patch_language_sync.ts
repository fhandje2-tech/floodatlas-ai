import fs from 'fs';

let shellContent = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');

if (!shellContent.includes('useTranslation')) {
  shellContent = shellContent.replace(
    'import { Outlet, useLocation, Link, useNavigate, useParams } from "react-router";',
    'import { Outlet, useLocation, Link, useNavigate, useParams } from "react-router";\nimport { useTranslation } from "react-i18next";'
  );
  
  shellContent = shellContent.replace(
    'const { id } = useParams();',
    'const { id } = useParams();\n  const { i18n } = useTranslation();'
  );

  shellContent = shellContent.replace(
    'if (id && id !== currentProjectId) {',
    `if (i18n.language && i18n.language !== useAgentStore.getState().language) {
      setLanguage(i18n.language);
    }
    if (id && id !== currentProjectId) {`
  );
  
  fs.writeFileSync('src/components/layout/AppShell.tsx', shellContent);
}

// Ensure handleNewProject uses the current language
shellContent = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');
shellContent = shellContent.replace(
  'setMessages([{ id: "welcome", role: "ai", content: `Bonjour ! Prêt à démarrer un nouveau projet. Je suis votre conseiller expert en résilience territoriale. Par quoi voulez-vous commencer pour ce nouveau territoire ?`, timestamp: new Date().toLocaleTimeString([], { hour: \'2-digit\', minute: \'2-digit\' }) }]);',
  ''
);
// In AppShell, we don't set messages on new project, because Onboarding handles creating the project!
fs.writeFileSync('src/components/layout/AppShell.tsx', shellContent);

