import fs from 'fs';

let content = fs.readFileSync('src/screens/TerritoryAnalysis.tsx', 'utf8');

const regex = /\{status === "results" && \([\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-6">/;

const replacement = `{status === "results" && (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/TerritoryAnalysis.tsx', content);
