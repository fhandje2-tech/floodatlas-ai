import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /\/\/ Setup simple interaction for demo[\s\S]*?map\.current\?\.on\('click'[\s\S]*?\}\);\n    \}\);/m;

const replacement = `      // Setup simple interaction for demo
      map.current?.on('click', async (e) => {
        const lng = e.lngLat.lng.toFixed(4);
        const lat = e.lngLat.lat.toFixed(4);
        
        setActiveFeature({
          name: "Chargement...",
          type: "Recherche en cours",
          lng,
          lat
        });

        try {
          const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`);
          const data = await res.json();
          if (data && data.address) {
            const address = data.address;
            const name = address.road || address.pedestrian || address.amenity || address.suburb || "Point d'intérêt";
            const details = [address.house_number, address.postcode, address.city].filter(Boolean).join(" ");
            
            const metrics = getDynamicMetrics(lat, lng, data.display_name, name);
            setActiveFeature({
              name: name,
              type: details || address.country || "Zone analysée",
              lng,
              lat,
              displayName: data.display_name,
              imperm: metrics.imperm,
              infiltration: metrics.infiltration
            });
          } else {
             const metrics = getDynamicMetrics(lat, lng, "", "Point d'intérêt");
             setActiveFeature({
                name: "Point d'intérêt",
                type: "Zone non identifiée",
                lng,
                lat,
                imperm: metrics.imperm,
                infiltration: metrics.infiltration
             });
          }
        } catch(err) {
           const metrics = getDynamicMetrics(lat, lng, "", "Point d'intérêt");
           setActiveFeature({
              name: "Point d'intérêt",
              type: "Zone analysée",
              lng,
              lat,
              imperm: metrics.imperm,
              infiltration: metrics.infiltration
           });
        }
      });
    });`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Click handler fixed");
