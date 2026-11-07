import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Pass activeFeature to ScenarioPanel
content = content.replace(
  `<ScenarioPanel onClose={() => setShowScenarioPanel(false)} />`,
  `<ScenarioPanel onClose={() => setShowScenarioPanel(false)} activeFeature={activeFeature} />`
);

// Reduce lines generator sizes
content = content.replace(
  `const generateLines = (count: number, radius: number) => {`,
  `const generateLines = (count: number, radius: number) => {
        radius = radius * 0.3; // shrink the overall area`
);

// Reduce polygon generator sizes and logic
content = content.replace(
  /const generatePolygons = \(count: number, radius: number, size: number, type: string\) => \{/,
  `const generatePolygons = (count: number, radius: number, size: number, type: string) => {
        radius = radius * 0.4;
        size = size * 0.15; // radically reduce the polygon size from thousands of square meters to realistic local plots`
);

// Reduce points surface
content = content.replace(
  `const surface = Math.floor(50 + Math.random() * 450); // 50 to 500 m2`,
  `const surface = Math.floor(20 + Math.random() * 80); // 20 to 100 m2 for points`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("SmartMapping math patched");
