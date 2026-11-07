import fs from 'fs';

let content = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

// The main flex container is already a column: <div className="flex-1 flex flex-col min-w-0 relative h-full">
// We have <div className="flex-1 overflow-y-auto ... pb-64">
// And <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t ...">
// Let's remove "absolute bottom-0 left-0 right-0" and use standard flex.

content = content.replace('pb-64', '');
content = content.replace(
  '<div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19] to-transparent pt-24 pointer-events-none">',
  '<div className="p-6 pt-4 shrink-0">'
);
content = content.replace(
  '<div className="max-w-3xl mx-auto flex flex-col pointer-events-auto">',
  '<div className="max-w-3xl mx-auto flex flex-col">'
);

fs.writeFileSync('src/screens/AIAssistant.tsx', content);
