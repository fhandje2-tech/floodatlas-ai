import fs from 'fs';

let shell = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');

shell = shell.replace(
  "const isDashboard = location.pathname === '/dashboard';",
  "const isDashboard = location.pathname === '/dashboard';\n  const isNewProject = location.pathname === '/new-project';"
);

shell = shell.replace(
  "const isSplit = !isDashboard && !isSettings && !isChatOnly;",
  "const isSplit = !isDashboard && !isSettings && !isNewProject && !isChatOnly;"
);

shell = shell.replace(
  "{isDashboard || isSettings ? (",
  "{isDashboard || isSettings || isNewProject ? ("
);

fs.writeFileSync('src/components/layout/AppShell.tsx', shell);
