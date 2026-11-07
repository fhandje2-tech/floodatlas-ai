import fs from 'fs';

let content = fs.readFileSync('src/screens/TerritoryAnalysis.tsx', 'utf8');

if (!content.includes('onClick={() => navigate(`/project/${currentProjectId || \'new\'}/reports`)}')) {
  const target = '<div className="flex justify-between items-end border-b border-border pb-4">';
  const replacement = `
          <div className="flex justify-between items-end border-b border-border pb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-display text-text-1">Diagnostic de Résilience Territoriale</h2>
                  <p className="text-text-3 mt-1 text-[14px]">
                    Basé sur la zone : <span className="text-text-1 font-medium">{activeZone || "Globale"}</span>
                  </p>
                </div>
                <Button onClick={() => navigate(\`/project/\${currentProjectId || 'new'}/reports\`)} className="ml-4 shrink-0">
                  Générer Rapport <FileBarChart className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
`;
  content = content.replace(
    /<div className="flex justify-between items-end border-b border-border pb-4">[\s\S]*?<h2 className="text-2xl font-bold font-display text-text-1">Diagnostic de Résilience Territoriale<\/h2>/,
    replacement
  );
  fs.writeFileSync('src/screens/TerritoryAnalysis.tsx', content);
}

