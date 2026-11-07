import fs from 'fs';
let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

content = content.replace(/\{t\.([a-zA-Z0-9_]+)\}/g, '{t("$1")}');
content = content.replace(/\(t\.([a-zA-Z0-9_]+)\)/g, '(t("$1"))');
content = content.replace(/ t\.([a-zA-Z0-9_]+) /g, ' t("$1") ');
content = content.replace(/ t\.([a-zA-Z0-9_]+)$/gm, ' t("$1")');
content = content.replace(/ t\.([a-zA-Z0-9_]+) \|\| /g, ' t("$1") || ');
content = content.replace(/ t\.([a-zA-Z0-9_]+);/g, ' t("$1");');

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
