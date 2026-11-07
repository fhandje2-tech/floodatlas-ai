import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Ensure selectedLevers is imported and accessible
content = content.replace('const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;',
  'const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;\n  const selectedLevers = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].selectedLevers || [] : [];');

// Replace the scen-circles block
const scenOld = `      if (showScenarioPanel) {
        mapObj.addSource('scen-src', { type: 'geojson', data: generatePoints(150, 0.04, true) as any });
        mapObj.addLayer({
          id: 'scen-circles',
          type: 'circle',
          source: 'scen-src',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 12],
            'circle-color': '#14b8a6',
            'circle-opacity': 0.7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      }`;

const scenNew = `      if (showScenarioPanel && selectedLevers.length > 0) {
        // Different layers based on active levers
        if (selectedLevers.includes('desealing') || selectedLevers.includes('permeable')) {
           mapObj.addSource('scen-src-blue', { type: 'geojson', data: generatePoints(80, 0.03, true) as any });
           mapObj.addLayer({
             id: 'scen-circles-blue',
             type: 'circle',
             source: 'scen-src-blue',
             paint: {
               'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 12],
               'circle-color': '#3b82f6', // brand-blue
               'circle-opacity': 0.7,
               'circle-stroke-width': 2,
               'circle-stroke-color': '#ffffff'
             }
           });
        }
        if (selectedLevers.includes('swales') || selectedLevers.includes('basins') || selectedLevers.includes('daylighting') || selectedLevers.includes('expansion')) {
           mapObj.addSource('scen-src-teal', { type: 'geojson', data: generatePoints(70, 0.035, true) as any });
           mapObj.addLayer({
             id: 'scen-circles-teal',
             type: 'circle',
             source: 'scen-src-teal',
             paint: {
               'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 10],
               'circle-color': '#14b8a6', // brand-teal
               'circle-opacity': 0.7,
               'circle-stroke-width': 2,
               'circle-stroke-color': '#ffffff'
             }
           });
        }
        if (selectedLevers.includes('roofs')) {
           mapObj.addSource('scen-src-green', { type: 'geojson', data: generatePoints(60, 0.02, true) as any });
           mapObj.addLayer({
             id: 'scen-circles-green',
             type: 'circle',
             source: 'scen-src-green',
             paint: {
               'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 15, 8],
               'circle-color': '#22c55e', // green-500
               'circle-opacity': 0.7,
               'circle-stroke-width': 2,
               'circle-stroke-color': '#ffffff'
             }
           });
        }
      }`;

content = content.replace(scenOld, scenNew);

// Also need to clean up these new layers/sources
content = content.replace("['diag-heat', 'scen-circles']", "['diag-heat', 'scen-circles', 'scen-circles-blue', 'scen-circles-teal', 'scen-circles-green']");
content = content.replace("['diag-src', 'scen-src']", "['diag-src', 'scen-src', 'scen-src-blue', 'scen-src-teal', 'scen-src-green']");

// Update dependency array for useEffect
content = content.replace("}, [showAnalysisPanel, showScenarioPanel]);", "}, [showAnalysisPanel, showScenarioPanel, selectedLevers]);");

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Scenario map layers patched");
