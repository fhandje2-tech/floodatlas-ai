import fs from 'fs';
let content = fs.readFileSync('src/screens/NewProjectScreen.tsx', 'utf8');

if (!content.includes('AddressAutocomplete')) {
  content = content.replace(
    'import { Target, Map as MapIcon, Plus, ArrowRight } from "lucide-react";',
    'import { Target, Map as MapIcon, Plus, ArrowRight } from "lucide-react";\nimport { AddressAutocomplete } from "../components/AddressAutocomplete";'
  );
  
  content = content.replace(
    /<div className="relative">[\s\S]*?<MapIcon className="absolute left-3 top-1\/2 -translate-y-1\/2 w-4 h-4 text-text-3" \/>[\s\S]*?<input[\s\S]*?value=\{zone\}[\s\S]*?onChange=\{e => setZone\(e.target.value\)\}[\s\S]*?\/>[\s\S]*?<\/div>/,
    '<AddressAutocomplete value={zone} onChange={setZone} placeholder={t("territoryZonePlaceholder")} />'
  );
  
  fs.writeFileSync('src/screens/NewProjectScreen.tsx', content);
}
