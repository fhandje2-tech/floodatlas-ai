import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

if (!content.includes('AddressAutocomplete')) {
  content = content.replace(
    'import { FileBarChart, Check, MapIcon, Sparkles, Waves, Target, UploadCloud } from "lucide-react";',
    'import { FileBarChart, Check, MapIcon, Sparkles, Waves, Target, UploadCloud } from "lucide-react";\nimport { AddressAutocomplete } from "../components/AddressAutocomplete";'
  );
}

const inputRegex = /<input\s+type="text"\s+placeholder={language === "en" \? "Search an address, municipality, or enter custom name\.\.\." : "Rechercher une adresse, commune, ou nom personnalisé\.\.\."}\s+className="w-full bg-void border border-border rounded-md px-4 py-2 text-\[13px\] text-text-1 focus:outline-none focus:border-brand-blue relative z-30"\s+value={search}\s+onChange={handleSearchChange}\s+onKeyDown={\(e\) => {\s+if \(e\.key === 'Enter' && search\.trim\(\)\) {\s+addZone\(search\.trim\(\)\);\s+}\s+}}\s+\/>/g;

const dropdownRegex = /\{suggestions\.length > 0 \? \(\s*<div className="absolute top-11 left-0 right-0 bg-surface border border-border rounded-md shadow-lg max-h-64 overflow-y-auto z-40">\s*\{suggestions\.map\(\(loc, i\) => \(\s*<button\s*key={i}\s*className="w-full text-left px-4 py-2 text-sm text-text-1 hover:bg-elevated transition-colors"\s*onClick={\(\) => {\s*addZone\(loc\);\s*}\}\s*>\s*\{loc\}\s*<\/button>\s*\)\)\}\s*<\/div>\s*\) : search\.length > 2 \? \(\s*<div className="absolute top-11 left-0 right-0 bg-surface border border-border rounded-md shadow-lg p-4 text-center z-40">\s*<div className="w-5 h-5 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-2" \/>\s*<span className="text-xs text-text-3">Recherche\.\.\.<\/span>\s*<\/div>\s*\) : null\}/g;

const replacement = `<AddressAutocomplete 
                placeholder={language === "en" ? "Search an address, municipality, or enter custom name..." : "Rechercher une adresse, commune, ou nom personnalisé..."}
                value={search}
                onChange={setSearch}
                onSelect={(val) => {
                  if (val.trim()) addZone(val.trim());
                }}
              />`;

content = content.replace(inputRegex, replacement);
// Clean up the leftover old dropdown manually if the regex missed it
content = content.replace(/\{suggestions\.length > 0 \? \([\s\S]*?\) : null\}/g, '');

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
