import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Replace static loading text with dynamic one
const regex = /<span className="text-\[12px\]">L'IA réfléchit...<\/span>/;
const replacement = `<span className="text-[12px]">
                     {chatMessages.length === 1 ? "FloodAtlas is checking..." : "FloodAtlas analyse..."}
                   </span>`;
content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Loading patched");
