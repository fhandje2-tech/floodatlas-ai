import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const handleChatSubmit = `
  const handleChatSubmit = async (e: React.FormEvent) => {
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
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: data.content }]);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setAnalysisLoading(false);
    }
  };
`;

content = content.replace('const runAnalysis = async () => {', handleChatSubmit + '\n  const runAnalysis = async () => {');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Chat submit patched");
