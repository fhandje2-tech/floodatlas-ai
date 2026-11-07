import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const target = '  React.useEffect(() => {\\n    if (!map.current) return;';
const realTarget = content.match(/  React\.useEffect\(\(\) => \{\n    if \(\!map\.current\) return;/);

if (realTarget) {
  content = content.replace(realTarget[0], `
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!map.current) return;`);
  fs.writeFileSync('src/screens/SmartMapping.tsx', content);
  console.log("Success");
} else {
  console.log("Not found");
}
