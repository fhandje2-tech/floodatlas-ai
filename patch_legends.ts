import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Replace Diagnostic Legend
const diagLegendOld = `<h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3">Légende : Diagnostic</h4>
               <div className="space-y-3">
                 <div>
                   <div className="flex justify-between text-[10px] text-text-2 mb-1">
                     <span>Risque faible</span>
                     <span>Risque fort</span>`;

const diagLegendNew = `<h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-1">Diagnostic d'Aléa</h4>
               <p className="text-[10px] text-text-3 mb-3 leading-tight">Risque de ruissellement pluvial (Averse décennale Q10)</p>
               <div className="space-y-3">
                 <div>
                   <div className="flex justify-between text-[10px] text-text-2 mb-1">
                     <span>Faible (Infiltration)</span>
                     <span>Fort (Accumulation)</span>`;

content = content.replace(diagLegendOld, diagLegendNew);

// Replace Scenario Legend
const scenLegendOld = `<h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3">Légende : Scénarios</h4>
               <div className="space-y-2 text-[11px] text-text-2 flex flex-col">
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full border-2 border-white bg-brand-teal mr-2 opacity-70"></span>
                   Infiltration / Désimperméabilisation
                 </div>`;

const scenLegendNew = `<h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-1">Leviers Ville Éponge</h4>
               <p className="text-[10px] text-text-3 mb-3 leading-tight">Solutions fondées sur la nature appliquées</p>
               <div className="space-y-2 text-[11px] text-text-2 flex flex-col">
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full border-2 border-white bg-brand-blue mr-2 opacity-70"></span>
                   Désimperméabilisation
                 </div>
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full border-2 border-white bg-brand-teal mr-2 opacity-70"></span>
                   Noues & Bassins
                 </div>
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full border-2 border-white bg-green-500 mr-2 opacity-70"></span>
                   Toitures & Espaces verts
                 </div>`;
                 
content = content.replace(scenLegendOld, scenLegendNew);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Legends patched");
