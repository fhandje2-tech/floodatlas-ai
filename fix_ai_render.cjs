const fs = require('fs');

let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

file = file.replace(/const renderContent = \(content: string\) => \{/, 
  'const renderContent = (content: string, msgId?: string) => {\n    if (msgId === "welcome") {\n      const name = auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "User";\n      content = content.replace("Fabien", name);\n    }\n');

file = file.replace(/\{renderContent\(msg.content\)\}/g, '{renderContent(msg.content, msg.id)}');

fs.writeFileSync('src/screens/AIAssistant.tsx', file);
