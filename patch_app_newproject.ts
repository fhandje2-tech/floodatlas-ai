import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!app.includes('NewProjectScreen')) {
  app = app.replace(
    'import { Settings } from "./screens/Settings";',
    'import { Settings } from "./screens/Settings";\nimport { NewProjectScreen } from "./screens/NewProjectScreen";'
  );
}

// Add route
if (!app.includes('path="/new-project"')) {
  app = app.replace(
    '<Route path="/dashboard" element={<DashboardHome />} />',
    '<Route path="/dashboard" element={<DashboardHome />} />\n          <Route path="/new-project" element={<NewProjectScreen />} />'
  );
}

fs.writeFileSync('src/App.tsx', app);

// Update DashboardHome.tsx to use /new-project instead of /onboarding
let dash = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');
dash = dash.replace(/navigate\("\/onboarding"\)/g, 'navigate("/new-project")');
dash = dash.replace(/<Link to="\/onboarding"/g, '<Link to="/new-project"');
fs.writeFileSync('src/screens/DashboardHome.tsx', dash);

// Update AppShell.tsx to use /new-project instead of /onboarding for new projects
let shell = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');
shell = shell.replace(/navigate\("\/onboarding"\)/g, 'navigate("/new-project")');
shell = shell.replace(/<Link to="\/onboarding"/g, '<Link to="/new-project"');
fs.writeFileSync('src/components/layout/AppShell.tsx', shell);

