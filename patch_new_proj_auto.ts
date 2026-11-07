import fs from 'fs';
let content = fs.readFileSync('src/screens/NewProjectScreen.tsx', 'utf8');

content = content.replace(
  'import { Map as MapIcon, ArrowRight, Shield, Target, Plus } from "lucide-react";',
  'import { Map as MapIcon, ArrowRight, Shield, Target, Plus } from "lucide-react";\nimport { AddressAutocomplete } from "../components/AddressAutocomplete";'
);

const regex = /<div className="relative">\s*<MapIcon className="absolute left-3 top-1\/2 -translate-y-1\/2 w-4 h-4 text-text-3" \/>\s*<input[^>]+>\s*<\/div>/g;

content = content.replace(regex, `<div className="relative">
              <AddressAutocomplete 
                placeholder={language === "en" ? "City, region, or address..." : "Ville, région ou adresse..."}
                value={zone}
                onChange={setZone}
              />
            </div>`);

fs.writeFileSync('src/screens/NewProjectScreen.tsx', content);
