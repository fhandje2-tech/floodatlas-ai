import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

const regex = /<div className="flex space-x-2">[\s\S]*?<Button onClick=\{handleGenerateImage\} variant="primary" className="shrink-0" disabled=\{generatingImage\}>[\s\S]*?<\/Button>[\s\S]*?<\/div>/;

const replacement = `<div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="flex-1 bg-void border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:border-brand-teal outline-none"
                        placeholder="Affiner le prompt de l'IA (ex: ambiance nocturne, focus sur l'eau...)"
                      />
                      <button className="px-3 py-2 bg-void border border-border rounded-lg text-text-3 hover:text-brand-blue hover:border-brand-blue transition-colors flex items-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        Joindre une image (Contexte)
                      </button>
                      <Button onClick={handleGenerateImage} variant="primary" className="shrink-0 bg-brand-blue" disabled={generatingImage}>
                        {generatingImage ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <><Sparkles className="w-4 h-4 mr-2" /> Générer Rendu</>}
                      </Button>
                    </div>
                  </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
console.log("Scenario prompt patched");
