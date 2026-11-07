import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Use a property isHidden to hide the system-level prompt from the chat UI
content = content.replace(
  `const newMessages = [...chatMessages, { id: Date.now().toString(), role: 'user', content: customPrompt }];`,
  `const newMessages = [...chatMessages, { id: Date.now().toString(), role: 'user', content: customPrompt, isHidden: true }];`
);

// We need to pass isHidden properly so we modify the mapping
content = content.replace(
  `messages: newMessages.map(m => ({ role: m.role, content: m.content })),`,
  `messages: newMessages.map(m => ({ role: m.role, content: m.content })),`
); // this is fine since the API doesn't need to know it's hidden, only the UI

// Now update the UI render loop to ignore hidden messages
const chatRenderRegex = /\{chatMessages\.map\(\(msg, idx\) => \(\s*<div key=\{idx\}/s;
const chatRenderReplacement = `{chatMessages.filter((m: any) => !m.isHidden).map((msg, idx) => (
                <div key={idx}`;
content = content.replace(chatRenderRegex, chatRenderReplacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Chat hidden messages patched");
