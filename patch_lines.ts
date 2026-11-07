import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /const generateLines = \(count: number, radius: number\) => \{[\s\S]*?return \{ type: 'FeatureCollection', features \};\n      \};/;

const replacement = `const generateLines = (count: number, radius: number) => {
        const features = [];
        // Simulate a grid-like street network rather than random floating lines
        const step = radius / Math.sqrt(count);
        for (let x = -radius; x < radius; x += step) {
          for (let y = -radius; y < radius; y += step) {
             if (Math.random() > 0.6) continue; // sparse grid
             const lng = center.lng + x;
             const lat = center.lat + y;
             const isHorizontal = Math.random() > 0.5;
             const length = step * (1 + Math.random());
             const endLng = isHorizontal ? lng + length : lng;
             const endLat = isHorizontal ? lat : lat + length;
             
             features.push({
               type: 'Feature',
               geometry: { type: 'LineString', coordinates: [[lng, lat], [endLng, endLat]] },
               properties: {
                 name: "Axe routier existant",
                 description: "Requalification en chaussée perméable pour infiltrer les eaux de ruissellement."
               }
             });
          }
        }
        return { type: 'FeatureCollection', features };
      };`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Lines generator patched");
