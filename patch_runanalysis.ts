import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /const runAnalysis = async \(\) => \{[\s\S]*?\}\s+catch\(e\) \{[\s\S]*?\}\n  \};/;

const replacement = `const runAnalysis = async () => {
    if (!activeZone) {
      alert("Veuillez d'abord rechercher et sélectionner une zone.");
      return;
    }
    setIsAnalysisOpen(true);
    setAnalysisLoading(true);
    
    // Inject custom prompt dynamically to generate recommendations and an alert but friendly response
    const customPrompt = \`Le client a cliqué sur "Analyser la zone" pour \${activeZone}. Rédige une réponse décontractée, bienveillante mais alertante sur les risques hydrologiques probables de cette zone (ruissellement, imperméabilisation). N'oublie pas de proposer directement des solutions "Ville Éponge" (désimperméabilisation, noues, toitures végétalisées, etc.) adaptées au contexte (urbain vs naturel) pour susciter l'action. Garde un ton d'expert conseiller.\`;
    
    const newMessages = [...chatMessages, { id: Date.now().toString(), role: 'user', content: customPrompt }];
    setChatMessages(newMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          activeZone,
          role,
          selectedLevers: Object.keys(layers).filter(k => (layers as any)[k]),
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
  };`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("runAnalysis patched");
