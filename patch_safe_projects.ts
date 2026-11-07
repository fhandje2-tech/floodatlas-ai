import fs from 'fs';

const filesToPatch = [
  'src/screens/DashboardHome.tsx',
  'src/components/layout/AppShell.tsx',
  'src/screens/AIAssistant.tsx',
  'src/screens/SmartMapping.tsx',
  'src/screens/TerritoryAnalysis.tsx',
  'src/screens/ScenarioSimulation.tsx',
  'src/screens/ReportGenerator.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // DashboardHome
  if (file.includes('DashboardHome.tsx')) {
    content = content.replace(
      'const projectList = Object.values(projects);',
      'const projectList = Object.values(projects || {});'
    );
  }
  
  // AppShell
  if (file.includes('AppShell.tsx')) {
    content = content.replace(
      'Object.keys(projects)[0]',
      'Object.keys(projects || {})[0]'
    );
  }
  
  fs.writeFileSync(file, content);
}

