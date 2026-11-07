import fs from 'fs';
let content = fs.readFileSync('src/components/panels/AnalysisPanel.tsx', 'utf8');

const regex = /<div className="flex items-center justify-between">[\s\S]*?<Button onClick=\{\(\) => navigate\(\`\/project\/\$\{currentProjectId \|\| 'new'\}\/reports\`\)\} className="ml-4 shrink-0">\n                    Générer Rapport <FileBarChart className="w-4 h-4 ml-2" \/>\n                  <\/Button>\n                <\/div>\n              <\/div>/;

const replacement = `<div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-display text-text-1">Diagnostic de Résilience Territoriale</h2>
                  <p className="text-text-3 mt-1 text-[14px]">
                    Basé sur la zone : <span className="text-text-1 font-medium">{activeZone || "Globale"}</span>
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={() => window.dispatchEvent(new Event('expand-panel'))} variant="outline" className="text-text-2">
                    Étendre les détails
                  </Button>
                  <Button onClick={() => navigate(\`/project/\${currentProjectId || 'new'}/reports\`)} className="ml-4 shrink-0 bg-brand-blue text-white">
                    Générer Rapport <FileBarChart className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/panels/AnalysisPanel.tsx', content);
console.log("Analysis buttons patched");
