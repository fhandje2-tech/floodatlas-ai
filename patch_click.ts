import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /\/\/ Setup simple interaction for demo[\s\S]*?map\.current\?\.on\('click', async \(e\) => \{[\s\S]*?const lng = e\.lngLat\.lng\.toFixed\(4\);[\s\S]*?const lat = e\.lngLat\.lat\.toFixed\(4\);/;

const replacement = `      // Setup simple interaction for demo
      map.current?.on('click', async (e) => {
        // First check if we clicked on a scenario layer
        const mapObj = map.current;
        if (mapObj) {
          const scenarioLayers = ['scen-circles-blue', 'scen-lines-teal', 'scen-poly-teal', 'scen-poly-green'];
          const activeLayers = scenarioLayers.filter(l => mapObj.getLayer(l));
          
          if (activeLayers.length > 0) {
            const features = mapObj.queryRenderedFeatures(e.point, { layers: activeLayers });
            if (features.length > 0) {
              const f = features[0];
              setActiveFeature({
                name: f.properties?.name || "Proposition d'aménagement",
                type: f.properties?.description || "Solution fondée sur la nature",
                lng: e.lngLat.lng.toFixed(4),
                lat: e.lngLat.lat.toFixed(4),
                imperm: "N/A",
                infiltration: "Élevé" // By default for a solution
              });
              return; // Stop here, don't do the reverse geocoding
            }
          }
        }

        const lng = e.lngLat.lng.toFixed(4);
        const lat = e.lngLat.lat.toFixed(4);`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Click interaction patched");
