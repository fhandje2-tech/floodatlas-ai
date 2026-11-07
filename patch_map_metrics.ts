import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Patch generatePoints
content = content.replace(
  /const generatePoints = \(count: number, radius: number, isGood: boolean\) => \{[\s\S]*?return \{ type: 'FeatureCollection', features \};\n      \};/,
  `const generatePoints = (count: number, radius: number, isGood: boolean) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta);
          const surface = Math.floor(50 + Math.random() * 450); // 50 to 500 m2
          const unitPrice = 45; // €/m2
          features.push({ 
            type: 'Feature', 
            geometry: { type: 'Point', coordinates: [lng, lat] }, 
            properties: { 
              intensity: Math.random(),
              name: isGood ? "Espace imperméabilisé" : "Zone à risque",
              description: isGood ? "Désimperméabilisation potentielle (parking, cour, place)." : "Risque fort d'accumulation d'eau.",
              surface: isGood ? surface : undefined,
              unitPrice: isGood ? unitPrice : undefined,
              totalCost: isGood ? surface * unitPrice : undefined
            } 
          });
        }
        return { type: 'FeatureCollection', features };
      };`
);

// Patch generateLines
content = content.replace(
  /const generateLines = \(count: number, radius: number\) => \{[\s\S]*?return \{ type: 'FeatureCollection', features \};\n      \};/,
  `const generateLines = (count: number, radius: number) => {
        const features = [];
        const step = radius / Math.sqrt(count);
        for (let x = -radius; x < radius; x += step) {
          for (let y = -radius; y < radius; y += step) {
             if (Math.random() > 0.6) continue;
             const lng = center.lng + x;
             const lat = center.lat + y;
             const isHorizontal = Math.random() > 0.5;
             const lengthDeg = step * (1 + Math.random());
             const endLng = isHorizontal ? lng + lengthDeg : lng;
             const endLat = isHorizontal ? lat : lat + lengthDeg;
             
             // Approximate length in meters (1 deg lat ~ 111km, 1 deg lng ~ 78km at 45N)
             const lengthMeters = Math.floor(lengthDeg * (isHorizontal ? 78000 : 111000));
             const width = 6; // standard road width 6m
             const surface = lengthMeters * width;
             const unitPrice = 60; // €/m2
                
             features.push({
               type: 'Feature',
               geometry: { type: 'LineString', coordinates: [[lng, lat], [endLng, endLat]] },
               properties: {
                 name: "Axe routier existant",
                 description: "Requalification en chaussée perméable pour infiltrer les eaux de ruissellement.",
                 linear: lengthMeters,
                 surface: surface,
                 unitPrice: unitPrice,
                 totalCost: surface * unitPrice
               }
             });
          }
        }
        return { type: 'FeatureCollection', features };
      };`
);

// Patch generatePolygons
content = content.replace(
  /const generatePolygons = \(count: number, radius: number, size: number, type: string\) => \{[\s\S]*?return \{ type: 'FeatureCollection', features \};\n      \};/,
  `const generatePolygons = (count: number, radius: number, size: number, type: string) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta);
          
          let coords;
          let surface = 0;
          let unitPrice = 0;

          if (type === 'roofs') {
            const w = size * (0.8 + Math.random() * 0.4);
            const h = size * (0.6 + Math.random() * 0.8);
            coords = [[[lng, lat], [lng + w, lat], [lng + w, lat + h], [lng, lat + h], [lng, lat]]];
            surface = Math.floor((w * 78000) * (h * 111000));
            unitPrice = 90; // €/m2
          } else {
            const s = size * (1 + Math.random());
            coords = [[[lng, lat], [lng + s*1.2, lat - s*0.2], [lng + s, lat + s], [lng - s*0.2, lat + s*0.8], [lng, lat]]];
            surface = Math.floor((s * 78000) * (s * 111000) * 0.8); // approx area
            unitPrice = 30; // €/m2 (noues/bassins)
          }

          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: coords
            },
            properties: {
              name: type === 'roofs' ? "Bâtiment critique" : "Espace public / Foncier",
              description: type === 'roofs' ? "Création d'une toiture végétalisée pour retenir les eaux à la source." : "Aménagement d'une zone de biorétention (noue ou bassin).",
              surface: surface,
              unitPrice: unitPrice,
              totalCost: surface * unitPrice
            }
          });
        }
        return { type: 'FeatureCollection', features };
      };`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Map metrics patched");
