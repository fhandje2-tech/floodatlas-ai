import fs from 'fs';
let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

// Remove duplicate i18n declaration
content = content.replace(
  'const { t, i18n } = useTranslation("auth");\n  const { i18n } = useTranslation();',
  'const { t, i18n } = useTranslation("auth");'
);

// If the above regex doesn't match perfectly, let's just replace the exact line
content = content.replace('const { i18n } = useTranslation();\n', '');
content = content.replace('const { i18n } = useTranslation();', '');

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
