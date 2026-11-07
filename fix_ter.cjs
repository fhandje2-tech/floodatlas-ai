const fs = require('fs');
let file = fs.readFileSync('src/screens/TerritoryAnalysis.tsx', 'utf8');

// Add a function to generate dynamic scores based on location
const genScores = `
  const getDynamicScores = (query: string) => {
    let hash = 0;
    for (let i = 0; i < query.length; i++) hash = query.charCodeAt(i) + ((hash << 5) - hash);
    const base = Math.abs(hash) % 40 + 40; // 40-80
    return {
      overall: base,
      flood: Math.min(100, base + 6),
      infra: Math.max(0, base - 11),
      building: Math.max(0, base - 20),
      damage: Math.min(100, base + 2)
    };
  };
  const scores = getDynamicScores(search || "Default");
`;

if (!file.includes('const getDynamicScores')) {
  file = file.replace(/const \[analysisComplete, setAnalysisComplete\] = useState\(false\);/,
    'const [analysisComplete, setAnalysisComplete] = useState(false);\n' + genScores);
    
  // replace 72 with {scores.overall}
  file = file.replace(/<span className="font-display font-bold text-5xl text-white">72<\/span>/,
    '<span className="font-display font-bold text-5xl text-white">{scores.overall}</span>');
  
  // replace 78, 61, 52, 74 with scores.flood, etc.
  file = file.replace(/<span className="text-\[12px\] font-data font-bold w-6 text-right">78<\/span>/, '<span className="text-[12px] font-data font-bold w-6 text-right">{scores.flood}</span>');
  file = file.replace(/<span className="text-\[12px\] font-data font-bold w-6 text-right">61<\/span>/, '<span className="text-[12px] font-data font-bold w-6 text-right">{scores.infra}</span>');
  file = file.replace(/<span className="text-\[12px\] font-data font-bold w-6 text-right">52<\/span>/, '<span className="text-[12px] font-data font-bold w-6 text-right">{scores.building}</span>');
  file = file.replace(/<span className="text-\[12px\] font-data font-bold w-6 text-right">74<\/span>/, '<span className="text-[12px] font-data font-bold w-6 text-right">{scores.damage}</span>');
  
  // Update the width styles to be dynamic
  file = file.replace(/style=\{\{ width: "78%" \}\}/, 'style={{ width: `${scores.flood}%` }}');
  file = file.replace(/style=\{\{ width: "61%" \}\}/, 'style={{ width: `${scores.infra}%` }}');
  file = file.replace(/style=\{\{ width: "52%" \}\}/, 'style={{ width: `${scores.building}%` }}');
  file = file.replace(/style=\{\{ width: "74%" \}\}/, 'style={{ width: `${scores.damage}%` }}');
}

// Ensure the infra block has different mock data or dynamically generated.
// It already has a small check `search.toLowerCase().includes('york')`.
// Let's replace the whole infra block with a dynamic list generator and a sources block.
file = file.replace(/\{\(search\.toLowerCase\(\)\.includes\('york'\) \? \[.*?\] \: \[.*?\]\)\.map\(\(infra, i\) => \(/s,
`{(() => {
    let list = [
      { name: "Hôpital Bégin", type: "Hospital", dist: "15m", icon: "🏥" },
      { name: "Lycée Berlioz", type: "School", dist: "85m", icon: "🏫" },
      { name: "Substation EST", type: "Power", dist: "110m", icon: "⚡" },
      { name: "RER A Vincennes", type: "Rail", dist: "180m", icon: "🚆" },
    ];
    if (search.toLowerCase().includes('york')) {
      list = [
        { name: "NYU Langone", type: "Hospital", dist: "12m", icon: "🏥" },
        { name: "Stuyvesant High", type: "School", dist: "95m", icon: "🏫" },
        { name: "ConEd Substation", type: "Power", dist: "40m", icon: "⚡" },
        { name: "Fulton St Station", type: "Rail", dist: "150m", icon: "🚆" },
      ];
    } else if (search.toLowerCase().includes('houston')) {
      list = [
        { name: "Texas Medical Center", type: "Hospital", dist: "5m", icon: "🏥" },
        { name: "Bellaire High", type: "School", dist: "1.2km", icon: "🏫" },
        { name: "CenterPoint Substation", type: "Power", dist: "300m", icon: "⚡" },
        { name: "METRORail Red Line", type: "Rail", dist: "400m", icon: "🚆" },
      ];
    } else if (search.trim().length > 0) {
      list = [
        { name: "General Hospital " + search.split(',')[0], type: "Hospital", dist: "45m", icon: "🏥" },
        { name: "Central High School", type: "School", dist: "120m", icon: "🏫" },
        { name: "Main Power Grid", type: "Power", dist: "80m", icon: "⚡" },
        { name: "Central Station", type: "Rail", dist: "200m", icon: "🚆" },
      ];
    }
    return list;
})().map((infra, i) => (`);

// And we add a sources block after Critical infrastructure.
if (!file.includes("Data Sources & References")) {
  file = file.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*\)/s,
    `</div>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-6 mt-6">
                  <h3 className="font-semibold text-[15px] mb-4">Data Sources & References</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5 mr-2 shrink-0" />
                      <div>
                        <p className="text-[13px] text-text-1"><strong>Global Flood Database:</strong> Historical events (2000-2023)</p>
                        <a href="#" className="text-[11px] text-brand-blue hover:underline">View methodology →</a>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5 mr-2 shrink-0" />
                      <div>
                        <p className="text-[13px] text-text-1"><strong>OpenStreetMap & Local Registries:</strong> Critical infrastructure mapping</p>
                        <a href="#" className="text-[11px] text-brand-blue hover:underline">View source data →</a>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5 mr-2 shrink-0" />
                      <div>
                        <p className="text-[13px] text-text-1"><strong>FEMA / Local Authorities:</strong> Flood risk zones and hydrological reports</p>
                        <a href="#" className="text-[11px] text-brand-blue hover:underline">Access official reports →</a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }`
  );
}

fs.writeFileSync('src/screens/TerritoryAnalysis.tsx', file);
