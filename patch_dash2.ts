import fs from 'fs';
let content = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');

content = content.replace(/calculateAverageResilience\(zones\)/g, 'calculateAverageResilience(projectList.map(p => p.activeZone || ""))');
content = content.replace(/\{zones\.length \|\| 0\}/g, '{projectList.length || 0}');
content = content.replace(/const avgResilience = calculateAverageResilience\(projectList\.map\(p => p\.activeZone \|\| ""\)\);/, 'const avgResilience = calculateAverageResilience(projectList.map(p => p.activeZone || ""));');

fs.writeFileSync('src/screens/DashboardHome.tsx', content);
