import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Pull criticalInfrastructures from store
content = content.replace(
  `const { setActiveZone, role, currentProjectId, projects, setMessages, diagnosticPriorities, setCriticalInfrastructures } = useAgentStore();`,
  `const { setActiveZone, role, currentProjectId, projects, setMessages, diagnosticPriorities, setCriticalInfrastructures, criticalInfrastructures } = useAgentStore();`
);

// Add infra layer to cleanup list
content = content.replace(
  `['diag-heat', 'scen-circles-blue', 'scen-lines-teal', 'scen-poly-teal', 'scen-poly-green'].forEach`,
  `['diag-heat', 'scen-circles-blue', 'scen-lines-teal', 'scen-poly-teal', 'scen-poly-green', 'infra-points'].forEach`
);
content = content.replace(
  `['diag-src', 'scen-src-blue', 'scen-src-lines', 'scen-src-teal', 'scen-src-green'].forEach`,
  `['diag-src', 'scen-src-blue', 'scen-src-lines', 'scen-src-teal', 'scen-src-green', 'infra-src'].forEach`
);

// Inject the layer creation after the scenario layers
const infraLayerLogic = `
        }
        
        // Critical Infrastructures -> Points
        const infras = useAgentStore.getState().criticalInfrastructures || [];
        if (infras.length > 0) {
           const infraFeatures = infras.map((inf: any) => ({
             type: 'Feature',
             geometry: { type: 'Point', coordinates: [inf.lng, inf.lat] },
             properties: {
               name: inf.name,
               description: "Infrastructure Stratégique - Vulnérabilité: " + inf.riskLevel,
               category: inf.category,
               type: 'infrastructure',
               color: inf.color
             }
           }));
           
           mapObj.addSource('infra-src', { type: 'geojson', data: { type: 'FeatureCollection', features: infraFeatures } as any });
           mapObj.addLayer({
             id: 'infra-points',
             type: 'circle',
             source: 'infra-src',
             paint: {
               'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 15, 9],
               'circle-color': ['get', 'color'],
               'circle-stroke-width': 2,
               'circle-stroke-color': '#ffffff'
             }
           });
        }
      }
    };
`;

content = content.replace(
  /\s*\}\s*\}\s*\}\s*\}\s*\};\s*if \(map\.current\.isStyleLoaded\(\)\) \{/g,
  infraLayerLogic + "\n\n    if (map.current.isStyleLoaded()) {"
);

// Add infra layer to map click check
content = content.replace(
  `const scenarioLayers = ['scen-circles-blue', 'scen-lines-teal', 'scen-poly-teal', 'scen-poly-green'];`,
  `const scenarioLayers = ['scen-circles-blue', 'scen-lines-teal', 'scen-poly-teal', 'scen-poly-green', 'infra-points'];`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("SmartMapping layer patched");
