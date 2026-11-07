import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// replace flex-1 on map panel
content = content.replace(/<Panel id="map"  className="flex-1 relative /g, '<Panel id="map" minSize={30} defaultSize={65} className="relative ');
content = content.replace(/<Panel id="map" className="flex-1 relative /g, '<Panel id="map" minSize={30} defaultSize={65} className="relative ');

// give PanelGroup an id to reset state
content = content.replace(/<PanelGroup  orientation="horizontal" /g, '<PanelGroup id="mapping-group-v3" orientation="horizontal" autoSaveId="map-panels-v3" ');
content = content.replace(/<PanelGroup orientation="horizontal" /g, '<PanelGroup id="mapping-group-v3" orientation="horizontal" autoSaveId="map-panels-v3" ');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
