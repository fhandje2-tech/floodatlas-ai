import fs from 'fs';

let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const target = '<div className="absolute top-6 left-6 z-10 w-[350px]">';
const replacement = `
      <div className="absolute top-6 left-6 z-10 w-[350px]">
        <div className="flex gap-2 mb-2">
          <Button onClick={() => navigate(\`/project/\${currentProjectId || 'new'}/reports\`)} size="sm" variant="primary" className="shadow-elevated w-full justify-center">
            Générer Rapport de Zone <FileBarChart className="w-4 h-4 ml-2" />
          </Button>
        </div>
`;

if (!content.includes('Générer Rapport de Zone')) {
  content = content.replace(target, replacement);
  
  if (!content.includes('FileBarChart')) {
    content = content.replace('MapIcon, Layers,', 'MapIcon, Layers, FileBarChart,');
  }

  fs.writeFileSync('src/screens/SmartMapping.tsx', content);
}
