import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// The panel rendering part:
// {(showAnalysisPanel || showScenarioPanel) && (
//   <>
//     <Panel defaultSize={35} minSize={25} maxSize={60} className="h-full z-20 flex flex-col shadow-2xl">
//       {showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />}
//       {showScenarioPanel && <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />}
//     </Panel>
//     <PanelResizeHandle className="w-1.5 bg-border hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
//   </>
// )}

const oldPanels = `{(showAnalysisPanel || showScenarioPanel) && (
        <>
          <Panel defaultSize={35} minSize={25} maxSize={60} className="h-full z-20 flex flex-col shadow-2xl">
            {showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />}
            {showScenarioPanel && <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />}
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
        </>
      )}`;

const newPanels = `{showAnalysisPanel && (
        <>
          <Panel defaultSize={35} minSize={25} maxSize={60} className="h-full z-20 flex flex-col shadow-2xl">
            <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
        </>
      )}`;

content = content.replace(oldPanels, newPanels);

// At the very end of the return statement, before </PanelGroup>, actually it should be outside PanelGroup or as absolute inside it. Let's put it at the very end of the component return:
const oldReturnEnd = `</PanelGroup>\n  );\n}`;
const newReturnEnd = `</PanelGroup>\n      {showScenarioPanel && (\n        <div className="absolute inset-0 z-50 bg-void">\n          <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />\n        </div>\n      )}\n    </>\n  );\n}`;

// Wait, the return is `return ( <PanelGroup ... > ... </PanelGroup> );`. To wrap with Fragment:
content = content.replace(/return \(\s*<PanelGroup/, 'return (\n    <>\n    <PanelGroup');
content = content.replace(oldReturnEnd, newReturnEnd);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
