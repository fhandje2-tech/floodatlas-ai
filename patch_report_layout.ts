import fs from 'fs';
let content = fs.readFileSync('src/screens/ReportGenerator.tsx', 'utf8');

// Combine the Type de rapport, Contextualisation, and Diagnostic checkboxes into a single scrollable container.
const regex = /<div className="p-6 border-b border-border space-y-4">\s*<h3 className="text-\[13px\] font-bold uppercase tracking-wider text-text-3">Type de Rapport<\/h3>[\s\S]*?<div className="p-6 border-t border-border bg-surface">\s*<Button fullWidth onClick=\{handleGenerate\}/;

const replacement = `<div className="flex-1 overflow-y-auto">
        <div className="p-6 border-b border-border space-y-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-text-3">Type de Rapport</h3>
          <div className="space-y-2">
            {[
              { id: 'technical', label: 'Note Technique (Hydrologie)', icon: Waves },
              { id: 'financial', label: 'Bilan Financier & CAPEX', icon: Activity },
              { id: 'urbanistic', label: 'Rapport Urbanistique (PLU)', icon: MapIcon }
            ].map(rt => (
              <label key={rt.id} className={\`flex items-center p-3 border rounded-xl cursor-pointer transition-colors \${reportType === rt.id ? 'bg-brand-blue/10 border-brand-blue' : 'bg-void border-border hover:border-border-lit'}\`}>
                <input type="radio" name="reportType" className="hidden" checked={reportType === rt.id} onChange={() => setReportType(rt.id as any)} />
                <rt.icon className={\`w-4 h-4 mr-3 \${reportType === rt.id ? 'text-brand-blue' : 'text-text-3'}\`} />
                <span className={\`text-[13px] font-medium \${reportType === rt.id ? 'text-text-1' : 'text-text-2'}\`}>{rt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 border-b border-border space-y-4">
          <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-2">Contextualisation (Prompt)</h3>
          <textarea 
            placeholder="Ex: Utiliser la norme NF EN 752. Limiter le rapport à 10 pages..."
            className="w-full h-24 bg-void border border-border rounded-lg p-3 text-[13px] text-text-1 resize-none focus:border-brand-blue outline-none"
          ></textarea>
          <button className="flex items-center text-[12px] text-brand-blue font-medium hover:text-brand-blue/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            Joindre un document de contexte
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3">Diagnostic</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setIncludeGraphs(!includeGraphs); }}>
                <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${includeGraphs ? "bg-brand-blue border-brand-blue" : "border-text-3 group-hover:border-text-2"}\`}>
                  {includeGraphs && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[13px] text-text-1">Graphiques de Vulnérabilité</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setIncludeMap(!includeMap); }}>
                <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${includeMap ? "bg-brand-blue border-brand-blue" : "border-text-3 group-hover:border-text-2"}\`}>
                  {includeMap && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[13px] text-text-1">Cartographie Q100 / Q1000</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3">Stratégies Ville Éponge</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setIncludeSponge(!includeSponge); }}>
                <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${includeSponge ? "bg-brand-teal border-brand-teal" : "border-text-3 group-hover:border-text-2"}\`}>
                  {includeSponge && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[13px] text-text-1">Leviers recommandés</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setIncludeCBA(!includeCBA); }}>
                <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${includeCBA ? "bg-brand-teal border-brand-teal" : "border-text-3 group-hover:border-text-2"}\`}>
                  {includeCBA && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[13px] text-text-1">Analyse Coûts/Bénéfices (ACB)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setIncludeScenarios(!includeScenarios); }}>
                <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${includeScenarios ? "bg-brand-teal border-brand-teal" : "border-text-3 group-hover:border-text-2"}\`}>
                  {includeScenarios && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[13px] text-text-1">Comparaison des Scénarios simulés</span>
              </label>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3">Format</h3>
            <select className="w-full bg-void border border-border text-text-1 text-[13px] rounded px-3 py-2 outline-none focus:border-brand-blue">
              <option>PDF Document</option>
              <option>Word (DOCX)</option>
              <option>Présentation (PPTX)</option>
            </select>
          </div>
        </div>
        </div>
        
        <div className="p-6 border-t border-border bg-surface shrink-0">
          <Button fullWidth onClick={handleGenerate}`;

content = content.replace(regex, replacement);

// And make sure the parent is h-full. It is: <div className="w-[320px] lg:w-[380px] shrink-0 bg-surface border-r border-border h-full flex flex-col z-20 overflow-hidden">
// The flex-1 overflow-y-auto is now properly wrapping everything between the header and the footer.

fs.writeFileSync('src/screens/ReportGenerator.tsx', content);
console.log("Report layout patched");
