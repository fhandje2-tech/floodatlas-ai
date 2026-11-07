import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex1 = /try \{\s*const res = await fetch\(`https:\/\/nominatim\.openstreetmap\.org\/search\?format=json&q=\$\{encodeURIComponent\(activeZone\)\}&limit=1`\);\s*const data = await res\.json\(\);\s*if \(data && data\.length > 0\) \{\s*const \{ lat, lon \} = data\[0\];\s*map\.current\?\.flyTo\(\{ center: \[parseFloat\(lon\), parseFloat\(lat\)\], zoom: 14\.5, duration: 2000 \}\);\s*\}\s*\} catch\(e\) \{\s*console\.error\(e\);\s*setChatMessages\(\[\.\.\.newMessages, \{ id: Date\.now\(\)\.toString\(\), role: 'ai', content: "Désolé, l'analyse en temps réel est actuellement limitée \(Quota API atteint\)\. Cependant, sur la base de mes modèles pré-calculés, cette zone montre un fort potentiel de désimperméabilisation\. Pensez à activer les scénarios de toitures végétalisées ou de chaussées perméables pour voir l'impact estimé !" \}\]\);\s*\}/g;

content = content.replace(regex1, `try {
          const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(activeZone)}&limit=1\`);
          const data = await res.json();
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            map.current?.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14.5, duration: 2000 });
          }
        } catch(e) {
          console.error(e);
        }`);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Reverted accidental catch block patches");
