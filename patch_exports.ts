import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');
content = content.replace('import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";', 'import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";');
content = content.replace('direction="horizontal"', 'orientation="horizontal"'); // it might use orientation
fs.writeFileSync('src/screens/SmartMapping.tsx', content);

let appShellContent = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');
appShellContent = appShellContent.replace('import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";', 'import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";');
appShellContent = appShellContent.replace('direction="horizontal"', 'orientation="horizontal"');
fs.writeFileSync('src/components/layout/AppShell.tsx', appShellContent);
