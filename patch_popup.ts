import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Patch setActiveFeature call inside map click
content = content.replace(
  /setActiveFeature\(\{[\s\S]*?name: f\.properties\?\.name \|\| "Proposition d'aménagement",[\s\S]*?type: f\.properties\?\.description \|\| "Solution fondée sur la nature",[\s\S]*?lng: e\.lngLat\.lng\.toFixed\(4\),[\s\S]*?lat: e\.lngLat\.lat\.toFixed\(4\),[\s\S]*?imperm: "N\/A",[\s\S]*?infiltration: "Élevé" \/\/ By default for a solution[\s\S]*?\}\);/,
  `setActiveFeature({
                name: f.properties?.name || "Proposition d'aménagement",
                type: f.properties?.description || "Solution fondée sur la nature",
                lng: e.lngLat.lng.toFixed(4),
                lat: e.lngLat.lat.toFixed(4),
                imperm: "N/A",
                infiltration: "Élevé",
                surface: f.properties?.surface,
                linear: f.properties?.linear,
                unitPrice: f.properties?.unitPrice,
                totalCost: f.properties?.totalCost
              });`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("setActiveFeature patched");
