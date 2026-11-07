import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const legendOld = `<h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-1">Leviers Ville Éponge</h4>
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

const legendNew = `<h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-1">Leviers Ville Éponge</h4>
               <p className="text-[10px] text-text-3 mb-3 leading-tight">Projections spatialisées des solutions</p>
               <div className="space-y-2 text-[11px] text-text-2 flex flex-col">
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full border-2 border-white bg-brand-blue mr-2 opacity-70"></span>
                   Désimperméabilisation (Points)
                 </div>
                 <div className="flex items-center">
                   <span className="w-4 h-1 bg-brand-teal mr-2 opacity-80 rounded-full"></span>
                   Chaussées perméables (Tracés)
                 </div>
                 <div className="flex items-center">
                   <span className="w-3 h-3 bg-[#0d9488] border border-[#14b8a6] mr-2 opacity-70"></span>
                   Noues & Bassins (Zones)
                 </div>
                 <div className="flex items-center">
                   <span className="w-3 h-3 bg-green-500 border border-[#166534] mr-2 opacity-70"></span>
                   Toitures végétalisées (Bâtiments)
                 </div>`;

content = content.replace(legendOld, legendNew);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Scen legend patched");
