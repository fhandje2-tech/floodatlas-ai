import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(
  `{chatMessages.map(msg => (`,
  `{chatMessages.filter((m: any) => !m.isHidden).map((msg: any) => (`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("chat filtering patched");
