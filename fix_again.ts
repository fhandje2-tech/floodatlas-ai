import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const target = `    React.useEffect(() => {
    if (!map.current) return;`;

const replacement = `
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

    React.useEffect(() => {
    if (!map.current) return;`;

content = content.replace(target, replacement);
fs.writeFileSync('src/screens/SmartMapping.tsx', content);
