import fs from 'fs';
let content = fs.readFileSync('src/components/panels/AnalysisPanel.tsx', 'utf8');

content = content.replace(
  'import { Target, Map as MapIcon, FileBarChart, Waves, Sparkles, Droplets, Leaf, ShieldAlert, ArrowRight, ExternalLink } , X from "lucide-react";',
  'import { Target, Map as MapIcon, FileBarChart, Waves, Sparkles, Droplets, Leaf, ShieldAlert, ArrowRight, ExternalLink, X } from "lucide-react";'
);

fs.writeFileSync('src/components/panels/AnalysisPanel.tsx', content);
