import fs from 'fs';

let onb = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');
onb = onb.replace('import { Check, Map as MapIcon, Target, Sparkles, FileBarChart, Waves, AlertCircle, FileBarChart }', 'import { Check, Map as MapIcon, Target, Sparkles, FileBarChart, Waves, AlertCircle }');
// Also if it was imported differently:
onb = onb.replace(/FileBarChart,\s*FileBarChart/g, 'FileBarChart');
fs.writeFileSync('src/screens/OnboardingScreen.tsx', onb);

