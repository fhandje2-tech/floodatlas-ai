import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

if (!content.includes('import { AnalysisPanel }')) {
  content = content.replace(
    'import { AddressAutocomplete } from "../components/AddressAutocomplete";',
    'import { AddressAutocomplete } from "../components/AddressAutocomplete";\nimport { AnalysisPanel } from "../components/panels/AnalysisPanel";\nimport { ScenarioPanel } from "../components/panels/ScenarioPanel";'
  );
}

if (!content.includes('const [showAnalysisPanel')) {
  content = content.replace(
    'const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);',
    'const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);\n  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);\n  const [showScenarioPanel, setShowScenarioPanel] = useState(false);'
  );
}

// Add buttons to top-left and render the panels
const targetButtons = '<div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-4 flex flex-col items-center">';
const replacementButtons = `
      <div className="absolute top-6 left-6 z-10 flex flex-col space-y-2">
        <Button onClick={() => { setShowAnalysisPanel(!showAnalysisPanel); setShowScenarioPanel(false); }} variant="primary" className="shadow-elevated bg-surface text-text-1 hover:bg-elevated border border-border">
          <FileBarChart className="w-4 h-4 mr-2" /> Diagnostic
        </Button>
        <Button onClick={() => { setShowScenarioPanel(!showScenarioPanel); setShowAnalysisPanel(false); }} variant="primary" className="shadow-elevated bg-surface text-text-1 hover:bg-elevated border border-border">
          <Layers className="w-4 h-4 mr-2" /> Scénarios
        </Button>
      </div>
      
      {showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} />}
      {showScenarioPanel && <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />}
      
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4 flex flex-col items-center">
`;
content = content.replace(targetButtons, replacementButtons);

// Add to the popup "bulle"
const targetPopup = '<Button onClick={analyseFeature} size="sm" className="w-full justify-center">';
const replacementPopup = `
            <Button onClick={() => setShowAnalysisPanel(true)} size="sm" className="w-full justify-center bg-brand-blue text-white mb-2">
              Diagnostic détaillé <FileBarChart className="w-3 h-3 ml-1.5" />
            </Button>
            <Button onClick={() => setShowScenarioPanel(true)} size="sm" className="w-full justify-center bg-brand-teal text-white mb-2">
              Simuler un aménagement <Sparkles className="w-3 h-3 ml-1.5" />
            </Button>
            <Button onClick={analyseFeature} size="sm" className="w-full justify-center bg-elevated text-text-1 hidden">
`;
content = content.replace(targetPopup, replacementPopup);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
