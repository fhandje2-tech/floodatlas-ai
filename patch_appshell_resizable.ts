import fs from 'fs';
let content = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');

if (!content.includes('react-resizable-panels')) {
  content = content.replace(
    'import { X, Home, Plus, LayoutPanelLeft, Target, Map as MapIcon, FileBarChart, Waves, Sparkles } from "lucide-react";',
    'import { X, Home, Plus, LayoutPanelLeft, Target, Map as MapIcon, FileBarChart, Waves, Sparkles } from "lucide-react";\nimport { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";'
  );

  const oldLayout = `{/* The AI Assistant stays on the left when in Split mode, or takes full width in ChatOnly mode */}
            <div className={\`flex flex-col transition-all duration-300 \${isSplit ? 'w-[400px] border-r border-white/5 bg-[#0e131f] shrink-0' : 'w-full max-w-4xl mx-auto'}\`}>
              <AIAssistant isSplit={isSplit} />
            </div>
            
            {/* The tool views on the right */}
            {isSplit && (
              <div className="flex-1 overflow-hidden relative bg-void flex flex-col">
                <Outlet />
              </div>
            )}`;

  const newLayout = `{isSplit ? (
              <PanelGroup direction="horizontal" className="w-full h-full">
                <Panel defaultSize={30} minSize={20} maxSize={50} className="bg-[#0e131f] flex flex-col relative z-20">
                  <AIAssistant isSplit={true} />
                </Panel>
                <PanelResizeHandle className="w-1.5 bg-white/5 hover:bg-brand-blue/50 active:bg-brand-blue transition-colors cursor-col-resize z-30" />
                <Panel minSize={30} className="relative bg-void flex flex-col z-10 overflow-hidden">
                  <Outlet />
                </Panel>
              </PanelGroup>
            ) : (
              <div className="w-full max-w-4xl mx-auto flex flex-col transition-all duration-300">
                <AIAssistant isSplit={false} />
              </div>
            )}`;

  content = content.replace(oldLayout, newLayout);
  fs.writeFileSync('src/components/layout/AppShell.tsx', content);
}
