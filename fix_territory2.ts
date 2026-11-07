import fs from 'fs';

let content = fs.readFileSync('src/screens/TerritoryAnalysis.tsx', 'utf8');

const targetRegex = /<div className="flex justify-between items-end border-b border-border pb-4">[\s\S]*?<\/div>\s*<\/div>/;

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
                <div className="flex space-x-3">
                  <Button onClick={() => navigate(\`/project/\${currentProjectId || 'new'}/reports\`)} className="ml-4 shrink-0">
                    Générer Rapport <FileBarChart className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
`;

content = content.replace(targetRegex, replacement);

fs.writeFileSync('src/screens/TerritoryAnalysis.tsx', content);
