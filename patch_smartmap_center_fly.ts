import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// remove the existing activeZone effect
content = content.replace(
  /useEffect\(\(\) => \{\s*if \(map\.current && activeZone\) \{[\s\S]*?\} catch\(e\) \{\s*console\.error\(e\);\s*\}\s*\}\s*fetchCoords\(\);\s*\}\s*\}, \[activeZone\]\);/,
  ''
);

// inside map.current.on('load')
content = content.replace(
  /map\.current\.on\('load', \(\) => \{/,
  `map.current.on('load', () => {
      if (activeZone) {
        const fetchCoords = async () => {
          try {
            const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(activeZone)}&limit=1\`);
            const data = await res.json();
            if (data && data.length > 0) {
              const { lat, lon } = data[0];
              map.current?.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14.5, duration: 2000 });
            }
          } catch(e) {
            console.error(e);
          }
        }
        fetchCoords();
      }`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
