import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

// Remove it from line 69 (approx)
content = content.replace('  const _currentLevers = selectedLevers;\n', '');

// Add it near the top of the component, just after selectedLevers is defined.
const searchFor = '  const [generatingImage, setGeneratingImage] = useState(false);';
const replaceWith = '  const _currentLevers = selectedLevers;\n  const [generatingImage, setGeneratingImage] = useState(false);';
content = content.replace(searchFor, replaceWith);

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
