import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Replace the Alea and Eponge buttons, and rename Diagnostic & IA to Analyser la zone
const regex = /\{\/\* Quick Actions \*\/\}.*?<Button onClick=\{runAnalysis\}/s;

const replacement = `{/* Quick Actions (Removed Alea/Eponge) */}
            
            <Button onClick={runAnalysis} className="bg-brand-amber hover:bg-brand-amber/90 text-void font-bold shadow-lg ml-2">
              <Target className="w-4 h-4 mr-2" /> ANALYSER LA ZONE
            </Button>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Top bar patched");
