import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

content = content.replace("activeZone?.split(',')[0] || \\\"Zone d'étude actuelle\\\"", "activeZone || \\\"Zone d'étude actuelle\\\"");
content = content.replace("activeZone?.split(',')[0]", "activeZone");

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
console.log("Zone name fixed");
