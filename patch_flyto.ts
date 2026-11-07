import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Add a useEffect to watch activeZone and flyTo it if it changes
const flyToLogic = `
  useEffect(() => {
    if (activeZone && map.current && map.current.isStyleLoaded()) {
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
    }
  }, [activeZone]);
`;

content = content.replace('useEffect(() => {', flyToLogic + '\n  useEffect(() => {');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("flyTo logic added");
