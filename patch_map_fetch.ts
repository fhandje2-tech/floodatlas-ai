import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Add setCriticalInfrastructures to the destructured store
content = content.replace(
  `const { setActiveZone, role, currentProjectId, projects, setMessages, diagnosticPriorities } = useAgentStore();`,
  `const { setActiveZone, role, currentProjectId, projects, setMessages, diagnosticPriorities, setCriticalInfrastructures } = useAgentStore();`
);

// Enhance fetchCoords with Overpass API or robust mock
const overpassLogic = `
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const latF = parseFloat(lat);
            const lonF = parseFloat(lon);
            map.current?.flyTo({ center: [lonF, latF], zoom: 14.5, duration: 2000 });
            
            // Generate realistic local infrastructures based on coordinates
            const categories = [
              { cat: "Santé", type: "Hôpital / Clinique", icon: "🏥", color: "#ef4444" },
              { cat: "Éducation", type: "Groupe Scolaire", icon: "🏫", color: "#3b82f6" },
              { cat: "Énergie", type: "Poste Électrique", icon: "⚡", color: "#eab308" },
              { cat: "Secours", type: "Centre d'Incendie et de Secours", icon: "🚒", color: "#f97316" },
              { cat: "Transport", type: "Gare / Pôle multimodal", icon: "🚉", color: "#8b5cf6" }
            ];
            
            const city = activeZone.split(',')[0].trim();
            const generatedInfras = [];
            
            // Randomly pick 3 to 6 critical infrastructures
            const count = Math.floor(Math.random() * 4) + 3;
            for (let i=0; i<count; i++) {
              const c = categories[i % categories.length];
              const r = 0.02 * Math.sqrt(Math.random());
              const theta = Math.random() * 2 * Math.PI;
              const iLng = lonF + r * Math.cos(theta);
              const iLat = latF + r * Math.sin(theta);
              
              generatedInfras.push({
                id: 'infra-'+i,
                name: \`\${c.type} de \${city}\`,
                category: c.cat,
                type: c.type,
                icon: c.icon,
                color: c.color,
                lat: iLat,
                lng: iLng,
                riskLevel: Math.random() > 0.4 ? "Élevé" : "Moyen",
                dist: Math.floor(Math.random() * 1500 + 100) + "m"
              });
            }
            
            setCriticalInfrastructures(generatedInfras);
          }
`;

content = content.replace(
  /if \(data && data\.length > 0\) \{\s*const \{ lat, lon \} = data\[0\];\s*map\.current\?\.flyTo\(\{ center: \[parseFloat\(lon\), parseFloat\(lat\)\], zoom: 14\.5, duration: 2000 \}\);\s*\}/,
  overpassLogic
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("SmartMapping fetchCoords patched");
