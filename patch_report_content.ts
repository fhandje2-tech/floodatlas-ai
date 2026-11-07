import fs from 'fs';
let content = fs.readFileSync('src/screens/ReportGenerator.tsx', 'utf8');

const execSummaryReplacement = `
                  <h2 className="font-semibold text-lg border-l-[3px] border-brand-blue pl-4 mb-4 text-slate-900">Résumé Exécutif</h2>
                  <div className="text-[14px] leading-relaxed text-slate-700 mb-6 text-justify markdown-body-light">
                    {aiSummary ? (
                      aiSummary.split('\\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))
                    ) : (
                      \`L'analyse du territoire de \${currentZone} révèle une vulnérabilité forte face aux épisodes de ruissellement intense et aux crues centennales (Q100). Avec un taux d'imperméabilisation de 82% dans les zones denses, la capacité d'infiltration naturelle est critique. Le déploiement de stratégies de "Ville Éponge" offre un potentiel de désimperméabilisation de 12 hectares, permettant de réduire la pointe de crue de 18% lors d'un événement décennal.\`
                    )}
                  </div>
`;

content = content.replace(
  /<h2 className="font-semibold text-lg border-l-\[3px\] border-brand-blue pl-4 mb-4 text-slate-900">Résumé Exécutif<\/h2>[\s\S]*?<\/p>/,
  execSummaryReplacement
);

const financialsReplacement = `
                {includeCBA && (
                  <div className="break-inside-avoid pt-8">
                    <h2 className="font-semibold text-lg border-l-[3px] border-brand-red pl-4 mb-4 text-slate-900">Estimation Financière (ACB)</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-red-50 border border-red-100 p-6 rounded-lg text-center">
                        <div className="text-[11px] text-red-600 font-bold uppercase tracking-widest mb-2">Pertes & Dégâts (Non-action)</div>
                        <div className="text-3xl font-data font-bold text-red-700">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(financials.damages)}</div>
                        <div className="text-[11px] text-red-500 mt-2">Estimation des dommages directs en cas de crue centennale</div>
                      </div>
                      <div className="bg-teal-50 border border-teal-100 p-6 rounded-lg text-center">
                        <div className="text-[11px] text-teal-600 font-bold uppercase tracking-widest mb-2">Coût des Stratégies (Action)</div>
                        <div className="text-3xl font-data font-bold text-teal-700">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(financials.capex)}</div>
                        <div className="text-[11px] text-teal-500 mt-2">Estimation budgétaire pour {selectedLevers.length || 3} leviers Ville Éponge</div>
                      </div>
                    </div>
                    <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                      <span className="text-[13px] font-medium text-slate-700">Retour sur Investissement (ROI) estimé</span>
                      <span className="font-bold text-lg text-brand-blue">{financials.roi}</span>
                    </div>
                  </div>
                )}
`;

content = content.replace(
  /\{includeCBA && \([\s\S]*?\{includeScenarios && \(/,
  financialsReplacement + '\n                {includeScenarios && ('
);

fs.writeFileSync('src/screens/ReportGenerator.tsx', content);
console.log("Report content patched");
