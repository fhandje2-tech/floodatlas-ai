import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(
  `activeZone: zoneToUse || activeZone,`,
  `activeZone,`
); // The first one might be in handleChatSubmit if we globally replaced it

// Or let's just rewrite handleChatSubmit's fetch body completely
const handleChatSubmitRegex = /const handleChatSubmit = async \(\e: React\.FormEvent\) => \{[\s\S]*?body: JSON\.stringify\(\{[\s\S]*?\}\)[\s\S]*?\}\);/;

const replacement = `const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || analysisLoading) return;
    
    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: chatInput };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput("");
    setAnalysisLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          activeZone,
          role,
          selectedLevers,
          resilienceIndex: 45,
          language: useAgentStore.getState().language || "fr"
        })
      });`;

content = content.replace(handleChatSubmitRegex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("handleChatSubmit activeZone fixed");
