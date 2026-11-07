import fs from 'fs';
let content = fs.readFileSync('src/components/panels/AnalysisPanel.tsx', 'utf8');

const regex = /"Évaluation de l'imperméabilisation des sols\.\.\.",\n              "Calcul des capacités d'infiltration\.\.\.",\n              "Identification des vulnérabilités infrastructurelles\.\.\.",\n              "Modélisation de la résilience territoriale\.\.\."/;

const replacement = `"FloodAtlas is checking topographical data...",
              "FloodAtlas is analysing sealing patterns...",
              "FloodAtlas is searching for critical infrastructure...",
              "FloodAtlas is computing resilience indexes..."`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/panels/AnalysisPanel.tsx', content);
console.log("Analysis Panel loading patched");
