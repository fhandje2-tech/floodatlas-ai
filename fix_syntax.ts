import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Fix syntax error in SmartMapping around runAnalysis
const regex = /<Target className="w-4 h-4 mr-2" \/> ANALYSER LA ZONE\n            <\/Button> className="bg-brand-amber hover:bg-brand-amber\/90 text-void font-bold">\n              <Sparkles className="w-4 h-4 mr-2" \/> GÉNÉRER LES RECOMMANDATIONS\n            <\/Button>/;

const replacement = `<Target className="w-4 h-4 mr-2" /> ANALYSER LA ZONE
            </Button>`;
            
content = content.replace(regex, replacement);
fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Syntax fixed");
