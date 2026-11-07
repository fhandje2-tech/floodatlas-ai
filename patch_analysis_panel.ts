import fs from 'fs';
let content = fs.readFileSync('src/components/panels/AnalysisPanel.tsx', 'utf8');

// Pull diagnosticPriorities from store instead of local calibrationData (or sync them)
content = content.replace(
  `  const { currentProjectId, projects, setActiveZone, setResilienceIndex } = useAgentStore();`,
  `  const { currentProjectId, projects, setActiveZone, setResilienceIndex, diagnosticPriorities, setDiagnosticPriorities } = useAgentStore();`
);

// We need to use diagnosticPriorities in the UI
content = content.replace(
  /onClick=\{\(\) => \{\s*const newFocus = calibrationData\.priorities\.includes\(f\)[\s\S]*?\}\}/,
  `onClick={() => {
                      const current = diagnosticPriorities || [];
                      const newFocus = current.includes(f) 
                        ? current.filter(p => p !== f)
                        : [...current, f];
                      setDiagnosticPriorities(newFocus.length > 0 ? newFocus : ["Risque inondation (ruissellement)"]);
                    }}`
);

content = content.replace(
  /calibrationData\.priorities\.includes\(f\)/g,
  `(diagnosticPriorities || []).includes(f)`
);

fs.writeFileSync('src/components/panels/AnalysisPanel.tsx', content);
console.log("AnalysisPanel patched for priorities");
