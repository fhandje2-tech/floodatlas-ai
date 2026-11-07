import fs from 'fs';

let content = fs.readFileSync('src/screens/NewProjectScreen.tsx', 'utf8');
content = content.replace(
  'import { Map as MapIcon, ArrowRight, Shield, Target, Plus } from "lucide-react";',
  'import { Map as MapIcon, ArrowRight, Shield, Target, Plus } from "lucide-react";\nimport { AddressAutocomplete } from "../components/AddressAutocomplete";'
);

const oldInput = `<div className="relative">
              <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
              <input 
                type="text" 
                placeholder={language === "en" ? "e.g., Paris, IDF" : "ex: Paris, IDF"}
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-void border border-border rounded-lg pl-10 pr-4 py-3 text-[14px] text-text-1 focus:border-brand-teal outline-none transition-colors"
              />
            </div>`;
            
const newInput = `<div className="relative">
              <MapIcon className="absolute left-3 top-[18px] w-4 h-4 text-text-3 z-10" />
              <AddressAutocomplete 
                placeholder={language === "en" ? "e.g., Paris, IDF" : "ex: Paris, IDF"}
                value={zone}
                onChange={setZone}
              />
            </div>`;

content = content.replace(oldInput, newInput);
fs.writeFileSync('src/screens/NewProjectScreen.tsx', content);
