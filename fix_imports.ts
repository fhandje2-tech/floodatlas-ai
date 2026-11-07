import fs from 'fs';

// OnboardingScreen
let onb = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');
if (!onb.includes('AlertCircle')) {
  onb = onb.replace('import { Check, Target, Sparkles, Map as MapIcon, Waves, FileBarChart } from "lucide-react";', 'import { Check, Target, Sparkles, Map as MapIcon, Waves, FileBarChart, AlertCircle } from "lucide-react";');
  fs.writeFileSync('src/screens/OnboardingScreen.tsx', onb);
}

// SmartMapping
let smap = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');
if (!smap.includes('FileBarChart')) {
  smap = smap.replace('import { Map as MapIcon, Layers, ChevronRight, RotateCcw, Search, ExternalLink, ArrowRight, X } from "lucide-react";', 'import { Map as MapIcon, Layers, ChevronRight, RotateCcw, Search, ExternalLink, ArrowRight, X, FileBarChart } from "lucide-react";');
  fs.writeFileSync('src/screens/SmartMapping.tsx', smap);
}
