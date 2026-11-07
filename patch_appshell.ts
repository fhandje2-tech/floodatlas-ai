import fs from 'fs';
let content = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');

const target = `  useEffect(() => {
    // Only save tool paths (inside project or dashboard)
    if (location.pathname !== '/auth' && location.pathname !== '/onboarding' && location.pathname !== '/') {
      setLastVisitedPath(location.pathname);
    }
  }, [location.pathname, setLastVisitedPath]);`;

content = content.replace(target, '');

fs.writeFileSync('src/components/layout/AppShell.tsx', content);
