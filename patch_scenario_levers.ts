import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

// Change _currentLevers logic
content = content.replace(
  'const _currentLevers = selectedLevers && selectedLevers.length > 0 ? selectedLevers : DEFAULT_LEVERS;',
  `const [initialized, setInitialized] = React.useState(false);
  React.useEffect(() => {
    if (!initialized && (!selectedLevers || selectedLevers.length === 0)) {
      setSelectedLevers(DEFAULT_LEVERS);
      setInitialized(true);
    } else {
      setInitialized(true);
    }
  }, [selectedLevers, initialized, setSelectedLevers]);
  const _currentLevers = selectedLevers;`
);

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
