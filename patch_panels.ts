import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const targetLayout = `<PanelGroup orientation="horizontal" className="flex-1 h-full w-full bg-void overflow-hidden relative font-body flex">
      {/* Left Panels (Analysis / Scenarios) */}
      {(showAnalysisPanel || showScenarioPanel) && (
        <>
          <Panel defaultSize={35} minSize={25} maxSize={60} className="h-full z-20 flex flex-col shadow-2xl">
            {showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />}
            {showScenarioPanel && <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />}
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
        </>
      )}

      {/* Main Map Panel */}
      <Panel className="flex-1 relative h-full flex flex-col z-10 overflow-hidden min-w-[300px]">`;

const fixedLayout = `<PanelGroup autoSaveId="smartmap-panels" orientation="horizontal" className="flex-1 h-full w-full bg-void overflow-hidden relative font-body">
      {/* Left Panels (Analysis / Scenarios) */}
      {(showAnalysisPanel || showScenarioPanel) && (
        <>
          <Panel id="sidebar" order={1} defaultSize={35} minSize={25} maxSize={60} className="h-full z-20 flex flex-col shadow-2xl bg-surface">
            {showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />}
            {showScenarioPanel && <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />}
          </Panel>
          <PanelResizeHandle id="handle" className="w-1.5 bg-border hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
        </>
      )}

      {/* Main Map Panel */}
      <Panel id="map" order={2} className="flex-1 relative h-full flex flex-col z-10 overflow-hidden min-w-[300px]">`;

if (content.includes(targetLayout)) {
  content = content.replace(targetLayout, fixedLayout);
  fs.writeFileSync('src/screens/SmartMapping.tsx', content);
  console.log("Layout fixed!");
} else {
  console.log("Layout block not found.");
}
