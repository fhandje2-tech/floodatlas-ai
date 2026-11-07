import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const targetStr = `{/* Map Styles & Sources (Bottom Right) */}`;
const legendStr = `{/* Legends (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
          {showAnalysisPanel && (
             <div className="bg-surface/95 backdrop-blur-md shadow-elevated rounded-xl border border-border p-4 w-[240px]">
               <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3">Légende : Diagnostic</h4>
               <div className="space-y-3">
                 <div>
                   <div className="flex justify-between text-[10px] text-text-2 mb-1">
                     <span>Risque faible</span>
                     <span>Risque fort</span>
                   </div>
                   <div className="h-2 w-full rounded-full bg-gradient-to-r from-transparent via-[#67a9cf] to-[#ff3232]"></div>
                 </div>
               </div>
             </div>
          )}
          {showScenarioPanel && (
             <div className="bg-surface/95 backdrop-blur-md shadow-elevated rounded-xl border border-border p-4 w-[240px]">
               <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3">Légende : Scénarios</h4>
               <div className="space-y-2 text-[11px] text-text-2 flex flex-col">
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full border-2 border-white bg-brand-teal mr-2 opacity-70"></span>
                   Infiltration / Désimperméabilisation
                 </div>
               </div>
             </div>
          )}
        </div>

        {/* Map Styles & Sources (Bottom Right) */}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, legendStr);
  fs.writeFileSync('src/screens/SmartMapping.tsx', content);
  console.log("Legend added!");
} else {
  console.log("Could not find insertion point.");
}
