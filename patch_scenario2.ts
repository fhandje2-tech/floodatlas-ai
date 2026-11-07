import fs from 'fs';
let content = fs.readFileSync('src/screens/ScenarioSimulation.tsx', 'utf8');

const imageGenUI = `
           <div className="mt-6 bg-surface border border-border rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold text-[15px] mb-1">Visualisation du Scénario</h3>
                  <p className="text-[12px] text-text-3">Généré par l'IA Imagen 3</p>
                </div>
                <Button variant="secondary" onClick={handleGenerateImage} disabled={generatingImage}>
                  {generatingImage ? "Génération en cours..." : "Générer Rendu Visuel"} <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {scenarioImage ? (
                <div className="w-full h-[300px] rounded-xl overflow-hidden border border-border">
                  <img src={scenarioImage} alt="Scenario Visualization" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-[300px] rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-text-3 bg-void/50">
                  <Sparkles className="w-8 h-8 mb-3 opacity-50" />
                  <p className="text-sm">Cliquez sur générer pour visualiser l'impact des leviers sélectionnés</p>
                </div>
              )}
            </div>
`;

content = content.replace(
  '           </div>\n        </div>',
  '           </div>\n' + imageGenUI + '\n        </div>'
);
fs.writeFileSync('src/screens/ScenarioSimulation.tsx', content);
