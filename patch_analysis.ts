import fs from 'fs';
let content = fs.readFileSync('src/components/panels/AnalysisPanel.tsx', 'utf8');

// Change placeholder and activeZone handling
content = content.replace(/activeZone \|\| ""/g, 'activeZone || "Zone d\'étude actuelle"');
content = content.replace(/disabled=\{!activeZone\}/g, ''); // Remove disabled condition

fs.writeFileSync('src/components/panels/AnalysisPanel.tsx', content);
console.log("AnalysisPanel patched");
