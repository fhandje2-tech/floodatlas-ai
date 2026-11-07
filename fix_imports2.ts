import fs from 'fs';

let onb = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');
if (!onb.includes('AlertCircle')) {
  onb = onb.replace('import { Check, Map as MapIcon, Target, Sparkles, FileBarChart, Waves } from "lucide-react";', 'import { Check, Map as MapIcon, Target, Sparkles, FileBarChart, Waves, AlertCircle } from "lucide-react";');
  fs.writeFileSync('src/screens/OnboardingScreen.tsx', onb);
}

let smap = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');
if (!smap.includes('FileBarChart')) {
  smap = smap.replace('import { Map as MapIcon, Layers', 'import { Map as MapIcon, Layers, FileBarChart');
  fs.writeFileSync('src/screens/SmartMapping.tsx', smap);
}
