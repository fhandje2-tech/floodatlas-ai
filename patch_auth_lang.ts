import fs from 'fs';
let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

// add i18n hook
if (!content.includes('useTranslation')) {
  content = content.replace(
    'import { useNavigate } from "react-router";',
    'import { useNavigate } from "react-router";\nimport { useTranslation } from "react-i18next";'
  );
  content = content.replace(
    'export function AuthScreen() {',
    'export function AuthScreen() {\n  const { i18n } = useTranslation();'
  );
}

// set language in i18n and agentStore on change
content = content.replace(
  /onClick=\{\(\) => setLanguage\("([^"]+)"\)\}/g,
  'onClick={() => { setLanguage("$1"); useAgentStore.getState().setLanguage("$1"); i18n.changeLanguage("$1"); }}'
);

// update handleAuthSuccess
content = content.replace(
  'useAgentStore.getState().setRole(role);',
  'useAgentStore.getState().setRole(role);\n        useAgentStore.getState().setLanguage(language);\n        i18n.changeLanguage(language);'
);

// update stats text
content = content.replace(
  '<span>municipalities protected</span>',
  '<span>{language === "fr" ? "territoires analysés dans le monde" : "territories analysed worldwide"}</span>'
);
content = content.replace(
  '<span>parcels analysed</span>',
  '<span>{language === "fr" ? "parcelles cartographiées" : "parcels mapped"}</span>'
);
content = content.replace(
  '<span>geographic accuracy</span>',
  '<span>{language === "fr" ? "précision des données" : "data accuracy"}</span>'
);
content = content.replace('<AnimatedCounter value={127} />', '<AnimatedCounter value={15} />,<AnimatedCounter value={0} />00+');

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
