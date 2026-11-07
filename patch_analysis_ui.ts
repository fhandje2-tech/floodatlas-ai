import fs from 'fs';
let content = fs.readFileSync('src/components/panels/AnalysisPanel.tsx', 'utf8');

const regex = /<Button onClick=\{\(\) => window\.dispatchEvent\(new Event\('expand-panel'\)\)\} variant="outline" className="text-text-2">[\s\S]*?Étendre les détails[\s\S]*?<\/Button>/;

const replacement = `<Button onClick={() => window.dispatchEvent(new Event('expand-panel'))} variant="outline" className="text-text-2">
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Étendre les détails
                  </Button>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/panels/AnalysisPanel.tsx', content);
console.log("Analysis Expand UI patched");
