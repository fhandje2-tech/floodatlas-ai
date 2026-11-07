import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Rename button
content = content.replace('<Sparkles className="w-4 h-4 mr-2" /> DIAGNOSTIC & IA', '<Sparkles className="w-4 h-4 mr-2" /> GÉNÉRER LES RECOMMANDATIONS');

// Add onClick to Aléa
content = content.replace(
  '<button className="px-3 py-2 text-[12px] font-medium text-brand-teal hover:bg-brand-teal/10 rounded-lg flex items-center transition-colors">',
  `<button onClick={() => {
                if (activeZone) {
                  setChatMessages([...chatMessages, {
                    id: Date.now().toString(),
                    role: 'user',
                    content: \`Génère une analyse détaillée de l'aléa d'inondation et de ruissellement pour : \${activeZone}.\`
                  }]);
                  setLayersOpen(true);
                } else {
                  alert("Veuillez d'abord rechercher une zone.");
                }
              }} className="px-3 py-2 text-[12px] font-medium text-brand-teal hover:bg-brand-teal/10 rounded-lg flex items-center transition-colors">`
);

// Add onClick to Éponge
content = content.replace(
  '<button className="px-3 py-2 text-[12px] font-medium text-brand-amber hover:bg-brand-amber/10 rounded-lg flex items-center transition-colors">',
  `<button onClick={() => {
                if (activeZone) {
                  setChatMessages([...chatMessages, {
                    id: Date.now().toString(),
                    role: 'user',
                    content: \`Quelles sont les meilleures solutions de Ville Éponge pour : \${activeZone} ?\`
                  }]);
                  setLayersOpen(true);
                } else {
                  alert("Veuillez d'abord rechercher une zone.");
                }
              }} className="px-3 py-2 text-[12px] font-medium text-brand-amber hover:bg-brand-amber/10 rounded-lg flex items-center transition-colors">`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Search patched");
