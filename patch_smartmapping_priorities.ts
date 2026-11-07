import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(
  `const { setActiveZone, role, currentProjectId, projects, setMessages } = useAgentStore();`,
  `const { setActiveZone, role, currentProjectId, projects, setMessages, diagnosticPriorities } = useAgentStore();`
);

// We need to use diagnosticPriorities in useEffect dependencies for updating map
content = content.replace(
  `  }, [showAnalysisPanel, showScenarioPanel, selectedLevers]);`,
  `  }, [showAnalysisPanel, showScenarioPanel, selectedLevers, diagnosticPriorities]);`
);

// We need to change the legend output based on diagnosticPriorities
const legendReplacement = `
        {/* Legends (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
          {showAnalysisPanel && (
             <div className="bg-surface/95 backdrop-blur-md shadow-elevated rounded-xl border border-border p-4 w-[240px]">
               <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-1">Diagnostic d'Aléa</h4>
               <p className="text-[13px] font-semibold text-text-1 mb-3">
                 {diagnosticPriorities && diagnosticPriorities.length > 0 ? diagnosticPriorities.join(" & ") : "Risque de ruissellement pluvial (Averse décennale Q10)"}
               </p>
               <div className="space-y-2">
                 <div className="flex items-center text-[12px] text-text-2">
                   <div className="w-3 h-3 rounded-full bg-[#2166ac] opacity-50 mr-2" /> 
                   {diagnosticPriorities?.includes("Îlots de chaleur urbains") ? "Faible (Îlots tempérés)" : "Faible (Infiltration)"}
                 </div>
                 <div className="flex items-center text-[12px] text-text-2">
                   <div className="w-3 h-3 rounded-full bg-[#ef8a62] opacity-80 mr-2" /> Moyen
                 </div>
                 <div className="flex items-center text-[12px] text-text-2">
                   <div className="w-3 h-3 rounded-full bg-[#ff3232] mr-2 shadow-[0_0_8px_rgba(255,50,50,0.6)]" /> 
                   {diagnosticPriorities?.includes("Îlots de chaleur urbains") ? "Fort (Îlot de Chaleur)" : "Fort (Accumulation)"}
                 </div>
               </div>
             </div>
          )}
`;

content = content.replace(
  /\{\/\* Legends \(Bottom Left\) \*\/\}\s*<div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">\s*\{showAnalysisPanel && \([\s\S]*?<\/div>\s*\)\}/,
  legendReplacement
);

// Also we should dynamically adjust the color palette for heat based on focus
content = content.replace(
  /'heatmap-color': \[[\s\S]*?1, 'rgba\(255,50,50, 1\)'[\s\S]*?\],/,
  `'heatmap-color': (diagnosticPriorities?.includes("Îlots de chaleur urbains") && !diagnosticPriorities?.includes("Risque inondation (ruissellement)")) ? [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.2, 'rgba(255,237,160, 0.5)',
              0.4, 'rgba(254,178,76, 0.7)',
              0.6, 'rgba(253,141,60, 0.8)',
              0.8, 'rgba(252,78,42, 0.9)',
              1, 'rgba(177,0,38, 1)'
            ] : [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.2, 'rgba(33,102,172, 0.5)',
              0.4, 'rgba(103,169,207, 0.7)',
              0.6, 'rgba(253,219,199, 0.8)',
              0.8, 'rgba(239,138,98, 0.9)',
              1, 'rgba(255,50,50, 1)'
            ],`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("SmartMapping priorities patched");
