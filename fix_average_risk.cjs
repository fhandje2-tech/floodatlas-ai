const fs = require('fs');
let file = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');

if (!file.includes('const calculateAverageRisk')) {
  const func = `
  const calculateAverageRisk = (zones: string[]) => {
    if (!zones || zones.length === 0) return 0;
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
  file = file.replace(/const \[greeting\] = useState/, func + '\n  const [greeting] = useState');
  fs.writeFileSync('src/screens/DashboardHome.tsx', file);
}
