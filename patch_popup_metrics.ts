import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const replacement = `
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-text-3">Imperméabilisation</span>
                <span className="font-data font-bold text-brand-amber">{activeFeature.imperm ? activeFeature.imperm + "%" : "95%"}</span>
              </div>
              {activeFeature.surface && (
                 <div className="flex justify-between items-center text-[12px]">
                   <span className="text-text-3">Surface estimée</span>
                   <span className="font-data font-bold text-brand-teal">{activeFeature.surface} m²</span>
                 </div>
              )}
              {activeFeature.linear && (
                 <div className="flex justify-between items-center text-[12px]">
                   <span className="text-text-3">Linéaire estimé</span>
                   <span className="font-data font-bold text-brand-teal">{activeFeature.linear} ml</span>
                 </div>
              )}
              {activeFeature.totalCost && (
                 <div className="flex flex-col pt-2 mt-2 border-t border-border">
                   <div className="flex justify-between items-center text-[12px]">
                     <span className="text-text-3 text-[10px] uppercase tracking-wider">Estimation financière</span>
                     <span className="font-data font-bold text-brand-amber">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(activeFeature.totalCost)}</span>
                   </div>
                   <div className="text-[10px] text-text-3 mt-1 text-right">Basé sur {activeFeature.unitPrice} €/{activeFeature.surface ? 'm²' : 'ml'}</div>
                 </div>
              )}
              <div className="flex justify-between items-center text-[12px] pt-2 mt-2 border-t border-border">
                <span className="text-text-3">Coordonnées</span>
`;

content = content.replace(
  /<div className="flex justify-between items-center text-\[12px\]">\s*<span className="text-text-3">Imperméabilisation<\/span>\s*<span className="font-data font-bold text-brand-amber">\{activeFeature\.imperm \? activeFeature\.imperm \+ "%" : "95%"\}<\/span>\s*<\/div>\s*<div className="flex justify-between items-center text-\[12px\]">\s*<span className="text-text-3">Coordonnées<\/span>/m,
  replacement
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Popup metrics patched");
