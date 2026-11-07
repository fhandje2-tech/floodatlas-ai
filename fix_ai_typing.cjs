const fs = require('fs');
let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

if (!file.includes("const [isTyping, setIsTyping] = useState(false);")) {
  file = file.replace(/const \[input, setInput\] = useState\(""\);/,
    'const [input, setInput] = useState("");\n  const [isTyping, setIsTyping] = useState(false);');
}

file = file.replace(/\{isTyping \&\& \(/, '{isTyping && ('); // Just to see if it exists, wait, let's just add it to the UI.
if (!file.includes('isTyping && <div')) {
    file = file.replace(/<div ref=\{messagesEndRef\} \/>/,
      `{isTyping && <div className="text-[12px] text-text-3 italic ml-12">AI is analyzing...</div>}\n          <div ref={messagesEndRef} />`);
}

fs.writeFileSync('src/screens/AIAssistant.tsx', file);
