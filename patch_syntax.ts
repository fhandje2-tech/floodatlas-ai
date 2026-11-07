import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(
  `      if (res.ok) {
        setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: data.content }]);
      } else {
        throw new Error("API Limit");
      } else {
        throw new Error("API Limit");
      }`,
  `      if (res.ok) {
        setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: data.content }]);
      } else {
        throw new Error("API Limit");
      }`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Syntax fixed");
