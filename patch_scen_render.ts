import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /if \(showScenarioPanel && selectedLevers\.length > 0\) \{[\s\S]*?\}\n        if \(selectedLevers\.includes\('roofs'\)\) \{[\s\S]*?\}\n      \}/;

const replacement = `if (showScenarioPanel && selectedLevers.length > 0) {
        // Desealing -> Points (Blue)
        if (selectedLevers.includes('desealing')) {
           mapObj.addSource('scen-src-blue', { type: 'geojson', data: generatePoints(100, 0.04, true) as any });
           mapObj.addLayer({
             id: 'scen-circles-blue',
             type: 'circle',
             source: 'scen-src-blue',
             paint: {
               'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 12],
               'circle-color': '#3b82f6', // brand-blue
               'circle-opacity': 0.6,
               'circle-stroke-width': 1.5,
               'circle-stroke-color': '#ffffff'
             }
           });
        }
        // Permeable Roads -> Lines (Teal)
        if (selectedLevers.includes('permeable')) {
           mapObj.addSource('scen-src-lines', { type: 'geojson', data: generateLines(40, 0.05) as any });
           mapObj.addLayer({
             id: 'scen-lines-teal',
             type: 'line',
             source: 'scen-src-lines',
             paint: {
               'line-color': '#14b8a6', // brand-teal
               'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 6],
               'line-opacity': 0.8
             }
           });
        }
        // Swales / Basins -> Polygons (Teal)
        if (selectedLevers.includes('swales') || selectedLevers.includes('basins') || selectedLevers.includes('daylighting') || selectedLevers.includes('expansion')) {
           mapObj.addSource('scen-src-teal', { type: 'geojson', data: generatePolygons(30, 0.04, 0.003) as any });
           mapObj.addLayer({
             id: 'scen-poly-teal',
             type: 'fill',
             source: 'scen-src-teal',
             paint: {
               'fill-color': '#0d9488', // darker teal
               'fill-opacity': 0.5,
               'fill-outline-color': '#14b8a6'
             }
           });
        }
        // Green Roofs -> Polygons (Green)
        if (selectedLevers.includes('roofs')) {
           mapObj.addSource('scen-src-green', { type: 'geojson', data: generatePolygons(50, 0.03, 0.0015) as any });
           mapObj.addLayer({
             id: 'scen-poly-green',
             type: 'fill',
             source: 'scen-src-green',
             paint: {
               'fill-color': '#22c55e', // green-500
               'fill-opacity': 0.7,
               'fill-outline-color': '#166534'
             }
           });
        }
      }`;

content = content.replace(regex, replacement);

// We must also update the layer/source cleanup!
const cleanupRegex = /\['diag-heat', 'scen-circles', 'scen-circles-blue', 'scen-circles-teal', 'scen-circles-green'\]/;
const cleanupReplacement = `['diag-heat', 'scen-circles-blue', 'scen-lines-teal', 'scen-poly-teal', 'scen-poly-green']`;
content = content.replace(cleanupRegex, cleanupReplacement);

const cleanupSrcRegex = /\['diag-src', 'scen-src', 'scen-src-blue', 'scen-src-teal', 'scen-src-green'\]/;
const cleanupSrcReplacement = `['diag-src', 'scen-src-blue', 'scen-src-lines', 'scen-src-teal', 'scen-src-green']`;
content = content.replace(cleanupSrcRegex, cleanupSrcReplacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Scen render patched");
