import fs from 'fs';

let content = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');

if (!content.includes('setLastVisitedPath')) {
  content = content.replace(
    'const { setZones, setActiveZone, activeZone, setLanguage, setMessages, role, setCurrentProject, currentProjectId, projects } = useAgentStore();',
    'const { setZones, setActiveZone, activeZone, setLanguage, setMessages, role, setCurrentProject, currentProjectId, projects, setLastVisitedPath } = useAgentStore();'
  );
  
  const useEffectToAdd = `
  useEffect(() => {
    // Only save tool paths (inside project or dashboard)
    if (location.pathname !== '/auth' && location.pathname !== '/onboarding' && location.pathname !== '/') {
      setLastVisitedPath(location.pathname);
    }
  }, [location.pathname, setLastVisitedPath]);
  `;
  
  content = content.replace(
    '  useEffect(() => {',
    useEffectToAdd + '\n  useEffect(() => {'
  );
  
  fs.writeFileSync('src/components/layout/AppShell.tsx', content);
}
