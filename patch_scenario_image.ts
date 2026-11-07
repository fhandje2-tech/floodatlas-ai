import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

// Update prompt generation to handle feature specific click vs general correctly
content = content.replace(
  `const leverNames = _currentLevers.map(id => LEVERS.find(l => l.id === id)?.label).filter(Boolean).join(", ");
    if (activeFeature) {`,
  `const leverNames = _currentLevers.map(id => LEVERS.find(l => l.id === id)?.label).filter(Boolean).join(", ");
    if (activeFeature && activeFeature.surface) {`
);

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
console.log("ScenarioPanel image patched");
