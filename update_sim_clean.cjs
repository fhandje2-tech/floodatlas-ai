const fs = require('fs');
let file = fs.readFileSync('src/screens/ScenarioSimulation.tsx', 'utf8');

// fix d\'expansion
file = file.replace(/d\\\\'expansion/g, "d'expansion");
// fix d\'eau
file = file.replace(/d\\\\'eau/g, "d'eau");

// fix string literals that got changed by sed
file = file.replace(/const time = "\${i}h";/g, 'const time = `${i}h`;');
file = file.replace(/value=\{-\${customMetrics\.runoff}%\}/g, 'value={`-${customMetrics.runoff}%`}');
file = file.replace(/value=\{-\${customMetrics\.peak}%\}/g, 'value={`-${customMetrics.peak}%`}');
file = file.replace(/value=\{\+\${customMetrics\.infiltration}%\}/g, 'value={`+${customMetrics.infiltration}%`}');

file = file.replace(/value=\{-\${optimalMetrics\.runoff}%\}/g, 'value={`-${optimalMetrics.runoff}%`}');
file = file.replace(/value=\{-\${optimalMetrics\.peak}%\}/g, 'value={`-${optimalMetrics.peak}%`}');
file = file.replace(/value=\{\+\${optimalMetrics\.infiltration}%\}/g, 'value={`+${optimalMetrics.infiltration}%`}');

fs.writeFileSync('src/screens/ScenarioSimulation.tsx', file);
