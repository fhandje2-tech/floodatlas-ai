import fs from 'fs';
let content = fs.readFileSync('src/components/panels/AnalysisPanel.tsx', 'utf8');
content = content.replace(
  'export function AnalysisPanel({ onClose }: { onClose?: () => void }) {',
  'export function AnalysisPanel({ onClose, onSimulate }: { onClose?: () => void, onSimulate?: () => void }) {'
);
content = content.replace(
  '<Button onClick={() => navigate(\'/scenarios\')} className="mt-4 w-full" variant="primary">',
  '<Button onClick={() => { if(onSimulate) onSimulate(); else navigate(\'/scenarios\'); }} className="mt-4 w-full" variant="primary">'
);
fs.writeFileSync('src/components/panels/AnalysisPanel.tsx', content);

let smartmap = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');
smartmap = smartmap.replace(
  '{showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} />}',
  '{showAnalysisPanel && <AnalysisPanel onClose={() => setShowAnalysisPanel(false)} onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }} />}'
);
fs.writeFileSync('src/screens/SmartMapping.tsx', smartmap);
