import fs from 'fs';

let content = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');

// Fix Module Status Strip links
content = content.replace(
  /link: "\/analysis"/g,
  'link: `/project/${projectList[0]?.id || "new"}/analysis`'
);
content = content.replace(
  /link: "\/map"/g,
  'link: `/project/${projectList[1]?.id || projectList[0]?.id || "new"}/map`'
);
content = content.replace(
  /link: "\/scenarios"/g,
  'link: `/project/${projectList[2]?.id || projectList[0]?.id || "new"}/scenarios`'
);
content = content.replace(
  /link: "\/reports"/g,
  'link: `/project/${projectList[0]?.id || "new"}/reports`'
);

// Fix the "Diag" button link for each project
content = content.replace(
  /<Link to="\/analysis" onClick=\{.*?\}><Button/g,
  '<Link to={`/project/${project.id}/analysis`} onClick={() => setCurrentProject(project.id)}><Button'
);

// Fix the "Ajouter un nouveau territoire" button link
content = content.replace(
  /<Link to="\/assistant">/g,
  '<Link to={`/project/${projectList[0]?.id || "new"}/assistant`}>'
);

fs.writeFileSync('src/screens/DashboardHome.tsx', content);
