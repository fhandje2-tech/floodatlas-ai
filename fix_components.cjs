const fs = require('fs');

// 1. ReportGenerator
let rep = fs.readFileSync('src/screens/ReportGenerator.tsx', 'utf8');
if (!rep.includes('const { activeZone } = useAgentStore()')) {
  rep = rep.replace(/const generateReport = \(\) => \{/, 
    'const { activeZone, zones, setActiveZone } = useAgentStore();\n  const currentZone = activeZone || (zones.length > 0 ? zones[0] : "Global");\n  const generateReport = () => {');
}
rep = rep.replace(/<span className="px-2 py-1 bg-brand-blue\/10 border border-brand-blue rounded text-\[12px\] text-brand-blue">Vincennes ✕<\/span>/g,
  '<span className="px-2 py-1 bg-brand-blue/10 border border-brand-blue rounded text-[12px] text-brand-blue flex items-center">{currentZone} <X className="w-3 h-3 ml-1 cursor-pointer" /></span>');
rep = rep.replace(/<span className="px-2 py-1 bg-elevated border border-border rounded text-\[12px\] text-text-2">\+ Add zone<\/span>/g,
  '<button className="px-2 py-1 bg-elevated border border-border rounded text-[12px] text-text-2 hover:bg-surface transition-colors" onClick={() => alert("Add zone modal opened")}>+ Add zone</button>');
rep = rep.replace(/Zone: <strong className="text-slate-800">Vincennes<\/strong>/g, 'Zone: <strong className="text-slate-800">{currentZone}</strong>');
rep = rep.replace(/Analysis of the Vincennes territory/g, 'Analysis of the {currentZone} territory');
fs.writeFileSync('src/screens/ReportGenerator.tsx', rep);

// 2. ScenarioSimulation
let sce = fs.readFileSync('src/screens/ScenarioSimulation.tsx', 'utf8');
if (!sce.includes('const { zones, activeZone, setActiveZone } = useAgentStore();')) {
  sce = sce.replace(/const startSimulation = \(\) => \{/, 
    'const { zones, activeZone, setActiveZone } = useAgentStore();\n  const startSimulation = () => {');
}
sce = sce.replace(/<select className="w-full bg-void border border-border rounded-md px-3 py-2 text-\[13px\] focus:outline-none focus:border-brand-blue">\s*<option>Vincennes<\/option>\s*<option>Bobigny<\/option>\s*<\/select>/,
  `<select className="w-full bg-void border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-brand-blue" value={activeZone} onChange={(e) => setActiveZone(e.target.value)}>
              {zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>`);
fs.writeFileSync('src/screens/ScenarioSimulation.tsx', sce);

// 3. AIAssistant
let aia = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');
if (!aia.includes('const { activeZone, zones } = useAgentStore();')) {
  aia = aia.replace(/const navigate = useNavigate\(\);/, 'const navigate = useNavigate();\n  const { activeZone, zones } = useAgentStore();');
}
aia = aia.replace(/in Vincennes\./g, 'in {activeZone || "the selected zone"}.');
aia = aia.replace(/{"zone":"Vincennes"}/g, '{"zone":"${activeZone || \'Global\'}"}');
aia = aia.replace(/Zone: Vincennes/g, 'Zone: {activeZone || "Global"}');
aia = aia.replace(/<option>All Zones<\/option>\s*<option>Vincennes<\/option>\s*<option>Bobigny<\/option>/,
  '<option>All Zones</option>\n                {zones.map(z => <option key={z}>{z}</option>)}');
aia = aia.replace(/PPRI Val-de-Marne 2024/g, 'Local Hydrological Report ({activeZone || "Global"})');
fs.writeFileSync('src/screens/AIAssistant.tsx', aia);

// 4. TerritoryAnalysis
let ter = fs.readFileSync('src/screens/TerritoryAnalysis.tsx', 'utf8');
if (!ter.includes('criticalInfraList')) {
  const newMap = `{(search.toLowerCase().includes('york') ? [
                { name: "NYU Langone", type: "Hospital", dist: "12m", icon: "🏥" },
                { name: "Stuyvesant High", type: "School", dist: "95m", icon: "🏫" },
                { name: "ConEd Substation", type: "Power", dist: "40m", icon: "⚡" },
                { name: "Fulton St Station", type: "Rail", dist: "150m", icon: "🚆" },
              ] : [
                { name: "Hôpital Bégin", type: "Hospital", dist: "15m", icon: "🏥" },
                { name: "Lycée Berlioz", type: "School", dist: "85m", icon: "🏫" },
                { name: "Substation EST", type: "Power", dist: "110m", icon: "⚡" },
                { name: "RER A Vincennes", type: "Rail", dist: "180m", icon: "🚆" },
              ]).map((infra, i) => (`;
  
  ter = ter.replace(/\{\[\s*\{\s*name:\s*"Hôpital Bégin".*?\}\,\s*\{\s*name:\s*"Lycée Berlioz".*?\}\,\s*\{\s*name:\s*"Substation EST".*?\}\,\s*\{\s*name:\s*"RER A Vincennes".*?\}\,\s*\]\.map\(\(infra\,\s*i\)\s*=>\s*\(/s, newMap);
  
  ter = ter.replace(/I found 1 critical facility \(Hôpital Bégin\)/, 
    'I found 1 critical facility ({search.toLowerCase().includes("york") ? "NYU Langone" : "Hôpital Bégin"})');
    
  fs.writeFileSync('src/screens/TerritoryAnalysis.tsx', ter);
}

