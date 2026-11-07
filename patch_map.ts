import fs from 'fs';

let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Use a more reliable free style for maplibre if maptiler key is invalid
content = content.replace(
  /style: \`https:\/\/api.maptiler.com.*?\`,/,
  'style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",'
);

// Add geocoding function and Enter key support
const searchFunction = `
  const handleSearch = async (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (!activeZone) return;
    
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(activeZone)}&limit=1\`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        if (map.current) {
          map.current.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14 });
        }
      }
    } catch (err) {
      console.error("Geocoding error", err);
    }
  };
`;

content = content.replace(
  'const isInvestor = role?.toLowerCase().includes("investor") || role?.toLowerCase().includes("aménageur");',
  'const isInvestor = role?.toLowerCase().includes("investor") || role?.toLowerCase().includes("aménageur");\n' + searchFunction
);

content = content.replace(
  'onChange={(e) => setActiveZone(e.target.value)}',
  'onChange={(e) => setActiveZone(e.target.value)}\n            onKeyDown={handleSearch}'
);

content = content.replace(
  '<button className="p-1.5 bg-elevated hover:bg-border rounded text-text-2 transition-colors">',
  '<button onClick={() => handleSearch()} className="p-1.5 bg-elevated hover:bg-border rounded text-text-2 transition-colors">'
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
