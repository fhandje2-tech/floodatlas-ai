import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Replace PanelGroup start
content = content.replace(/<PanelGroup[^>]*>/, '<div className="flex flex-1 h-full w-full bg-void overflow-hidden relative font-body">');

// Replace PanelGroup end
content = content.replace(/<\/PanelGroup>/, '</div>');

// Replace Sidebar Panel
content = content.replace(/<Panel id="sidebar"[^>]*>/, '<div className="w-[400px] h-full z-20 flex flex-col shadow-2xl bg-surface border-r border-border shrink-0">');
content = content.replace(/<\/Panel>/, '</div>'); // This might replace the map one too, we need to be careful

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
