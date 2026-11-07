const fs = require('fs');
let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

const clientCode = `
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages as any);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, activeZone })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch response");
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse] as any);
    } catch (err: any) {
      console.error(err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Error: " + err.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg] as any);
    } finally {
      setIsTyping(false);
    }
  };
`;

file = file.replace(/const handleSubmit = \(e\?: React\.FormEvent\) => \{[\s\S]*?\}, 1000\);\n  \};/, clientCode);
fs.writeFileSync('src/screens/AIAssistant.tsx', file);
