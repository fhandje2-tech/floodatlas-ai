import fs from 'fs';
let content = fs.readFileSync('src/components/panels/AnalysisPanel.tsx', 'utf8');

// 1. Fix diagnostic priorities and infras extraction
content = content.replace(
  `const { currentProjectId, projects, setActiveZone, setResilienceIndex, diagnosticPriorities, setDiagnosticPriorities, criticalInfrastructures } = useAgentStore();`,
  `const { currentProjectId, projects, setActiveZone, setResilienceIndex, setDiagnosticPriorities } = useAgentStore();
  const currentProject = currentProjectId ? projects[currentProjectId] : null;
  const diagnosticPriorities = currentProject?.diagnosticPriorities || ["Risque inondation (ruissellement)"];
  const criticalInfrastructures = currentProject?.criticalInfrastructures || [];`
);

// Fallback if previous replacement failed: check if it still has `getInfrastructureList()`
const infraRenderLogic = `
          <div className="grid grid-cols-1 gap-6">
            <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-[15px] mb-4 text-text-1">Infrastructures Critiques Menacées</h3>
              <div className="space-y-4">
                {Object.entries((criticalInfrastructures || []).reduce((acc: any, curr: any) => {
                  if (!acc[curr.category]) acc[curr.category] = [];
                  acc[curr.category].push(curr);
                  return acc;
                }, {})).map(([category, items]: [string, any]) => (
                  <div key={category}>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-3 mb-2">{category}</h4>
                    <div className="space-y-2">
                      {items.map((item: any, i: number) => (
                        <div key={i} className={\`flex items-center p-3 rounded-xl border \${item.riskLevel === 'Élevé' ? "border-brand-red/30 bg-brand-red/5" : "border-border bg-void"}\`}>
                          <span className="text-xl mr-3">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                             <span className="font-medium text-[13px] text-text-1 block truncate">{item.name}</span>
                             <span className="text-[11px] text-text-3 mt-0.5 block">{item.type}</span>
                          </div>
                          <div className="text-right pl-3">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-text-3 block mb-0.5">Vulnérabilité</span>
                             <span className={\`font-data text-[12px] font-bold \${item.riskLevel === 'Élevé' ? 'text-brand-red' : 'text-brand-amber'}\`}>{item.riskLevel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {(!criticalInfrastructures || criticalInfrastructures.length === 0) && (
                   <div className="text-[13px] text-text-3 text-center py-4 italic">Recherchez une zone pour analyser ses infrastructures.</div>
                )}
              </div>
            </section>
`;

content = content.replace(
  /<div className="grid grid-cols-1 gap-6">\s*<section className="bg-surface border border-border p-6 rounded-2xl shadow-sm">\s*<h3 className="font-semibold text-\[15px\] mb-4 text-text-1">Infrastructures Critiques Menacées<\/h3>\s*<div className="space-y-3">\s*\{getInfrastructureList\(\)\.map\(\(item, i\) => \([\s\S]*?\}\)\}\s*<\/div>\s*<\/section>/,
  infraRenderLogic
);

fs.writeFileSync('src/components/panels/AnalysisPanel.tsx', content);
console.log("AnalysisPanel completely fixed");
