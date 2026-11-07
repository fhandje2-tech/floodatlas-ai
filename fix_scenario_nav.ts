import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

content = content.replace("navigate('/reports')", "navigate(`/project/${currentProjectId || 'new'}/reports`)");

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
console.log("Navigation patched");
