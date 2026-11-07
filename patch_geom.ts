import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /const generatePoints = \(count: number, radius: number, isGood: boolean\) => \{[\s\S]*?return \{ type: 'FeatureCollection', features \};\n      \};/;

const replacement = `const generatePoints = (count: number, radius: number, isGood: boolean) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta);
          features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { intensity: Math.random() } });
        }
        return { type: 'FeatureCollection', features };
      };

      const generateLines = (count: number, radius: number) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta);
          const length = 0.005 + Math.random() * 0.01;
          const angle = Math.random() * Math.PI;
          const endLng = lng + length * Math.cos(angle);
          const endLat = lat + length * Math.sin(angle);
          features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[lng, lat], [endLng, endLat]] }, properties: {} });
        }
        return { type: 'FeatureCollection', features };
      };

      const generatePolygons = (count: number, radius: number, size: number) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta);
          const s = size * (0.5 + Math.random() * 1.5);
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[lng, lat], [lng + s, lat], [lng + s, lat + s], [lng, lat + s], [lng, lat]]]
            },
            properties: {}
          });
        }
        return { type: 'FeatureCollection', features };
      };`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Geom generated");
