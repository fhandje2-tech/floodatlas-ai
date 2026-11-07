import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

content = content.replace(
  `export function ScenarioPanel({ onClose }: { onClose?: () => void }) {`,
  `export function ScenarioPanel({ onClose, activeFeature }: { onClose?: () => void, activeFeature?: any }) {`
);

content = content.replace(
  /React\.useEffect\(\(\) => \{\s*const leverNames = _currentLevers\.map\(id => LEVERS\.find\(l => l\.id === id\)\?\.label\)\.filter\(Boolean\)\.join\(\", \"\);\s*setCustomPrompt\(\`Un aménagement urbain résilient pour \$\{activeZone \|\| \"la zone d\'étude actuelle\"\}, intégrant : \$\{leverNames \|\| \"des solutions fondées sur la nature\"\}\. Lumière naturelle réaliste, vue piétonne, haute qualité architecturale\.\`\);\s*\}, \[\_currentLevers, activeZone\]\);/,
  `React.useEffect(() => {
    const leverNames = _currentLevers.map(id => LEVERS.find(l => l.id === id)?.label).filter(Boolean).join(", ");
    if (activeFeature) {
      setCustomPrompt(\`Génère une simulation visuelle photoréaliste pour l'aménagement d'une \${activeFeature.name} de \${activeFeature.surface || 150}m² aux coordonnées \${activeFeature.lat}, \${activeFeature.lng}. Objectif: intégrer \${leverNames || "des solutions fondées sur la nature"}. Lumière naturelle, vue piétonne.\`);
    } else {
      setCustomPrompt(\`Aménagement urbain résilient à l'échelle du quartier pour \${activeZone || "la zone d'étude"}, intégrant : \${leverNames || "des solutions fondées sur la nature"}. Vue aérienne ou perspective large, intégration harmonieuse au tissu urbain.\`);
    }
  }, [_currentLevers, activeZone, activeFeature]);`
);

// Add surface and cost calculations to computeMetrics
content = content.replace(
  /return \{ runoff: Math\.round\(runoff\), peak: Math\.round\(peak\), infiltration: Math\.round\(infil\), cost: Math\.round\(cost\), score, resilience \};\s*\};/,
  `const interventionSurface = activeFeature?.surface || (isDenseUrban ? 15000 : 45000); // m2
    const totalCost = Math.round(cost * interventionSurface);
    const avoidedDamages = Math.round((totalCost * (1 + score/100)) * (isDenseUrban ? 2.5 : 1.5));
    
    return { runoff: Math.round(runoff), peak: Math.round(peak), infiltration: Math.round(infil), cost: Math.round(cost), score, resilience, totalCost, avoidedDamages, interventionSurface };
  };`
);

// Update UI to show the new costs and damages
content = content.replace(
  /<div className="pt-5 mt-5 border-t border-border">\s*<span className="text-\[11px\] text-text-3 uppercase tracking-wider">Coût estimé des dommages<\/span>\s*<div className="text-\[20px\] font-data font-bold text-brand-red mt-1">Élevé<\/div>\s*<\/div>/,
  `<div className="pt-5 mt-5 border-t border-border">
     <span className="text-[11px] text-text-3 uppercase tracking-wider">Pertes éco. potentielles</span>
     <div className="text-[18px] font-data font-bold text-brand-red mt-1">~{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(activeFeature ? (activeFeature.surface || 15000) * 150 : 3000000)}</div>
   </div>`
);

content = content.replace(
  /<div className="pt-5 mt-5 border-t border-brand-blue\/20">\s*<span className="text-\[11px\] text-brand-blue\/60 uppercase tracking-wider">Investissement estimé<\/span>\s*<div className="text-\[20px\] font-data font-bold text-brand-blue mt-1">~\{customMetrics\.cost\} €\/m²<\/div>\s*<\/div>/,
  `<div className="pt-5 mt-5 border-t border-brand-blue/20">
     <span className="text-[11px] text-brand-blue/60 uppercase tracking-wider">Coût total ({customMetrics.interventionSurface}m²)</span>
     <div className="text-[18px] font-data font-bold text-brand-blue mt-1">~{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(customMetrics.totalCost)}</div>
     <div className="text-[11px] text-brand-teal mt-1">Dommages évités: ~{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(customMetrics.avoidedDamages)}</div>
   </div>`
);

content = content.replace(
  /<div className="pt-5 mt-5 border-t border-brand-teal\/20">\s*<span className="text-\[11px\] text-brand-teal\/60 uppercase tracking-wider">Investissement estimé<\/span>\s*<div className="text-\[20px\] font-data font-bold text-brand-teal mt-1">~\{optimalMetrics\.cost\} €\/m²<\/div>\s*<\/div>/,
  `<div className="pt-5 mt-5 border-t border-brand-teal/20">
     <span className="text-[11px] text-brand-teal/60 uppercase tracking-wider">Coût total ({optimalMetrics.interventionSurface}m²)</span>
     <div className="text-[18px] font-data font-bold text-brand-teal mt-1">~{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(optimalMetrics.totalCost)}</div>
     <div className="text-[11px] text-brand-teal mt-1 font-bold">Dommages évités: ~{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(optimalMetrics.avoidedDamages)}</div>
   </div>`
);

content = content.replace(
  `{activeZone || "Zone d'étude actuelle"}`,
  `{activeFeature?.name || activeZone || "Zone d'étude actuelle"}`
);

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
console.log("ScenarioPanel patched successfully");
