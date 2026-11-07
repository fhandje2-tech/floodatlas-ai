import fs from 'fs';
let content = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');

// The replacement was: 
// 'const modules = [\n    { name: "Cartographie & Diagnostic IA", icon: MapIcon, desc: "SmartMapping", link: "map", color: "text-brand-blue" },\n    { name: "Génération de Rapports", icon: FileBarChart, desc: "Notes & Bilans", link: "reports", color: "text-text-1" }\n  ];\n  // '
// And it left the rest of the array. Let's fix that.
const correctModules = `const modules = [
    { name: "Cartographie & Diagnostic IA", icon: MapIcon, desc: "SmartMapping", link: "map", color: "text-brand-blue" },
    { name: "Génération de Rapports", icon: FileBarChart, desc: "Notes & Bilans", link: "reports", color: "text-text-1" }
  ];`;

content = content.replace(/const modules = \[\n.*?  \/\/ .*?  \];/s, correctModules);
// wait, the regex might be wrong. Let's use string operations.

fs.writeFileSync('src/screens/DashboardHome.tsx', content);
