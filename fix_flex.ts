import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Replace PanelGroup with flex container
const target1 = `<PanelGroup id="mapping-group-v3" orientation="horizontal"  className="flex-1 h-full w-full bg-void overflow-hidden relative font-body">
      {/* Left Panels (Analysis / Scenarios) */}
      {(showAnalysisPanel || showScenarioPanel) && (
        <>
          <Panel id="sidebar"  defaultSize={35} minSize={25} maxSize={60} className="h-full z-20 flex flex-col shadow-2xl bg-surface">
            {showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />}
            {showScenarioPanel && <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />}
          </Panel>
          <PanelResizeHandle id="handle" className="w-1.5 bg-border hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
        </>
      )}

      {/* Main Map Panel */}
      <Panel id="map" minSize={30} defaultSize={65} className="relative h-full flex flex-col z-10 overflow-hidden min-w-[300px]">`;

const fixed1 = `<div className="flex-1 flex h-full w-full bg-void overflow-hidden relative font-body">
      {/* Left Panels (Analysis / Scenarios) */}
      {(showAnalysisPanel || showScenarioPanel) && (
        <div className="w-[450px] shrink-0 h-full z-20 flex flex-col shadow-2xl bg-surface border-r border-border overflow-hidden">
          {showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />}
          {showScenarioPanel && <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />}
        </div>
      )}

      {/* Main Map Panel */}
      <div className="flex-1 relative h-full flex flex-col z-10 overflow-hidden min-w-[300px]">`;

content = content.replace(target1, fixed1);

// Replace closing tags
const target2 = `      </Panel>
    </PanelGroup>`;
const fixed2 = `      </div>
    </div>`;

content = content.replace(target2, fixed2);

// Make sure ScenarioPanel width is updated
let scenarioContent = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');
scenarioContent = scenarioContent.replace(/w-\[400px\]/, 'w-[450px]');
fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', scenarioContent);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
