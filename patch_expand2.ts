import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Ensure the panel expands wider (change xl:w-[1200px] to xl:w-[1400px] or similar, and increase default to w-[600px] when expanded)
content = content.replace(
  `const handleExpand = () => setIsExpanded(true);`,
  `const handleExpand = () => setIsExpanded(prev => !prev);`
);

content = content.replace(
  `w-[900px] xl:w-[1200px]`,
  `w-[800px] xl:w-[1200px]`
); // Already quite large, but let's make sure it toggles properly.

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Expand toggler patched");
