import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const hashFunc = `
  const getDynamicMetrics = (lat, lng, displayName, name) => {
    const text = ((displayName || "") + " " + (name || "")).toLowerCase();
    let isDenseUrban = false;
    let isNature = false;
    
    if (text.includes("paris") || text.includes("genève") || text.includes("london") || text.includes("rue") || text.includes("avenue")) {
      isDenseUrban = true;
    }
    
    if (text.includes("parc") || text.includes("bafoussam") || text.includes("forêt") || text.includes("jardin") || text.includes("bois") || text.includes("lake")) {
      isNature = true;
      isDenseUrban = false;
    }
    
    const hash = Math.abs(Math.sin(parseFloat(lat) * parseFloat(lng)) * 10000);
    let impermBase = isDenseUrban ? 85 : (isNature ? 15 : 45);
    let imperm = Math.min(100, Math.max(0, Math.round(impermBase + (hash % 30) - 15)));
    
    let infiltration = "Moyen";
    if (imperm > 80) infiltration = "Très faible";
    else if (imperm > 60) infiltration = "Faible";
    else if (imperm > 30) infiltration = "Moyen";
    else if (imperm > 10) infiltration = "Élevé";
    else infiltration = "Très élevé";
  
    return { imperm, infiltration };
  };
`;

// Insert after imports
content = content.replace('export function SmartMapping() {', hashFunc + '\nexport function SmartMapping() {');

// Replace the setActiveFeature block in map.current?.on('click' ...
content = content.replace(/setActiveFeature\(\{[\s\S]*?name: name,[\s\S]*?type: details \|\| address\.country \|\| "Zone analysée",[\s\S]*?lng,[\s\S]*?lat,[\s\S]*?displayName: data\.display_name[\s\S]*?\}\);/,
`const metrics = getDynamicMetrics(lat, lng, data.display_name, name);
            setActiveFeature({
              name: name,
              type: details || address.country || "Zone analysée",
              lng,
              lat,
              displayName: data.display_name,
              imperm: metrics.imperm,
              infiltration: metrics.infiltration
            });`);

content = content.replace(/setActiveFeature\(\{[\s\S]*?name: "Point d'intérêt",[\s\S]*?type: "Zone non identifiée",[\s\S]*?lng,[\s\S]*?lat[\s\S]*?\}\);/,
`const metrics = getDynamicMetrics(lat, lng, "", "Point d'intérêt");
             setActiveFeature({
                name: "Point d'intérêt",
                type: "Zone non identifiée",
                lng,
                lat,
                imperm: metrics.imperm,
                infiltration: metrics.infiltration
             });`);

content = content.replace(/setActiveFeature\(\{[\s\S]*?name: "Point d'intérêt",[\s\S]*?type: "Zone analysée",[\s\S]*?lng,[\s\S]*?lat[\s\S]*?\}\);/g,
`const metrics = getDynamicMetrics(lat, lng, "", "Point d'intérêt");
             setActiveFeature({
              name: "Point d'intérêt",
              type: "Zone analysée",
              lng,
              lat,
              imperm: metrics.imperm,
              infiltration: metrics.infiltration
           });`);

// Update popup rendering
content = content.replace(/<span className="font-data font-bold text-brand-teal">Élevé<\/span>/g, '<span className="font-data font-bold text-brand-teal">{activeFeature.infiltration || "Élevé"}</span>');
content = content.replace(/<span className="font-data font-bold text-brand-amber">95%<\/span>/g, '<span className="font-data font-bold text-brand-amber">{activeFeature.imperm ? activeFeature.imperm + "%" : "95%"}</span>');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Popup metrics patched");
