const fs = require('fs');

let file = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');

// Calculate risk score based on zones
if (!file.includes('const calculateAverageRisk')) {
  const func = `
  const calculateAverageRisk = (zones: string[]) => {
    if (zones.length === 0) return 0;
    let total = 0;
    zones.forEach(z => {
      let hash = 0;
      for (let i = 0; i < z.length; i++) hash = z.charCodeAt(i) + ((hash << 5) - hash);
      total += (Math.abs(hash) % 55) + 30; // 30-85 range
    });
    return Math.round(total / zones.length);
  };
  const averageRisk = calculateAverageRisk(zones);
  `;
  file = file.replace(/const name = /, func + '\n  const name = ');
  
  file = file.replace(/<RiskPulse score=\{56\}/, '<RiskPulse score={averageRisk}');
}

// Remove Recent Activity
file = file.replace(/<div className="md:col-span-7 bg-surface border border-border rounded-lg p-6">[\s\S]*?<\/div>\s*<\/div>\s*<div className="md:col-span-5 bg-surface border border-border rounded-lg p-6 flex flex-col">/,
  '<div className="md:col-span-12 bg-surface border border-border rounded-lg p-6 flex flex-col">');

fs.writeFileSync('src/screens/DashboardHome.tsx', file);
