import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regexPoly = /const generatePolygons = \(count: number, radius: number, size: number\) => \{[\s\S]*?return \{ type: 'FeatureCollection', features \};\n      \};/;

const replacementPoly = `const generatePolygons = (count: number, radius: number, size: number, type: string) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta);
          
          let coords;
          if (type === 'roofs') {
            // Simulate building footprints (rectangular)
            const w = size * (0.8 + Math.random() * 0.4);
            const h = size * (0.6 + Math.random() * 0.8);
            coords = [[[lng, lat], [lng + w, lat], [lng + w, lat + h], [lng, lat + h], [lng, lat]]];
          } else {
            // Simulate more organic shapes for basins/swales
            const s = size * (1 + Math.random());
            coords = [[[lng, lat], [lng + s*1.2, lat - s*0.2], [lng + s, lat + s], [lng - s*0.2, lat + s*0.8], [lng, lat]]];
          }

          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: coords
            },
            properties: {
              name: type === 'roofs' ? "Bâtiment critique" : "Espace public / Foncier",
              description: type === 'roofs' ? "Création d'une toiture végétalisée pour retenir les eaux à la source." : "Aménagement d'une zone de biorétention (noue ou bassin)."
            }
          });
        }
        return { type: 'FeatureCollection', features };
      };`;

content = content.replace(regexPoly, replacementPoly);

// Also update the calls to generatePolygons
content = content.replace(/generatePolygons\(30, 0.04, 0.003\)/g, "generatePolygons(30, 0.04, 0.003, 'basins')");
content = content.replace(/generatePolygons\(50, 0.03, 0.0015\)/g, "generatePolygons(50, 0.03, 0.0015, 'roofs')");

// Also add properties to generatePoints
const regexPoints = /const generatePoints = \(count: number, radius: number, isGood: boolean\) => \{[\s\S]*?return \{ type: 'FeatureCollection', features \};\n      \};/;
const replacementPoints = `const generatePoints = (count: number, radius: number, isGood: boolean) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta);
          features.push({ 
            type: 'Feature', 
            geometry: { type: 'Point', coordinates: [lng, lat] }, 
            properties: { 
              intensity: Math.random(),
              name: isGood ? "Espace imperméabilisé" : "Zone à risque",
              description: isGood ? "Désimperméabilisation potentielle (parking, cour, place)." : "Risque fort d'accumulation d'eau."
            } 
          });
        }
        return { type: 'FeatureCollection', features };
      };`;
content = content.replace(regexPoints, replacementPoints);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Poly/Points generator patched");
