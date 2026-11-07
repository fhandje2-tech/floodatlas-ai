import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

const setOptimalOld = `  const setOptimal = () => {
    setSelectedLevers(OPTIMAL_LEVERS);
  };`;

const setOptimalNew = `  const setOptimal = () => {
    const text = (activeZone || "").toLowerCase();
    let optimal = [...OPTIMAL_LEVERS];
    
    // Customize optimal levers based on context
    if (text.includes("paris") || text.includes("genève") || text.includes("centre") || text.includes("ville")) {
      optimal = ['desealing', 'roofs', 'permeable', 'swales'];
    } else if (text.includes("bafoussam") || text.includes("forêt") || text.includes("parc")) {
      optimal = ['swales', 'basins', 'expansion', 'daylighting'];
    } else {
      optimal = ['desealing', 'swales', 'expansion', 'plu', 'permeable'];
    }
    
    setSelectedLevers(optimal);
  };`;

content = content.replace(setOptimalOld, setOptimalNew);

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
console.log("Optimal patched");
