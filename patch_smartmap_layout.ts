import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const oldLeftPanel = `{showAnalysisPanel && (
        <>
          <Panel defaultSize={35} minSize={25} maxSize={60} className="h-full z-20 flex flex-col shadow-2xl">
            <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
        </>
      )}`;

const newLeftPanel = `{(showAnalysisPanel || showScenarioPanel) && (
        <>
          <Panel defaultSize={35} minSize={25} maxSize={60} className="h-full z-20 flex flex-col shadow-2xl">
            {showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />}
            {showScenarioPanel && <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />}
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
        </>
      )}`;

content = content.replace(oldLeftPanel, newLeftPanel);

const oldReturnEnd = `</PanelGroup>
      {showScenarioPanel && (
        <div className="absolute inset-0 z-50 bg-void">
          <ScenarioPanel onClose={() => setShowScenarioPanel(false)} />
        </div>
      )}
    </>
  );
}`;

const newReturnEnd = `</PanelGroup>
    </>
  );
}`;

content = content.replace(oldReturnEnd, newReturnEnd);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
