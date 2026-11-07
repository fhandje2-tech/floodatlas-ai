import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Imports
if (!content.includes('import Markdown from "react-markdown"')) {
  content = content.replace(
    'import { AddressAutocomplete } from "../components/AddressAutocomplete";',
    'import { AddressAutocomplete } from "../components/AddressAutocomplete";\nimport Markdown from "react-markdown";\nimport remarkGfm from "remark-gfm";\nimport { Send } from "lucide-react";'
  );
}

// Add state for Analysis Panel
const panelState = `
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const runAnalysis = async () => {
    if (!activeZone) {
      alert("Veuillez d'abord rechercher et sélectionner une zone.");
      return;
    }
    setIsAnalysisOpen(true);
    setAnalysisLoading(true);
    
    // Clear previous chat
    setChatMessages([]);
    
    try {
      const initialPrompt = \`Génère un diagnostic détaillé de résilience territoriale pour \${activeZone}. Analyse les aléas climatiques (ruissellement, inondation) et propose des solutions "Ville Éponge" adaptées. Fournis des sources crédibles.\`;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: initialPrompt }],
          activeZone,
          role,
          selectedLevers: Object.keys(layers).filter(k => (layers as any)[k]),
          resilienceIndex: 45,
          language: useAgentStore.getState().language || "fr"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages([{
          id: Date.now().toString(),
          role: 'ai',
          content: data.content
        }]);
      } else {
        setChatMessages([{ id: 'err', role: 'ai', content: "Erreur lors de l'analyse: " + data.error }]);
      }
    } catch(e: any) {
      setChatMessages([{ id: 'err', role: 'ai', content: "Erreur de connexion." }]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || analysisLoading) return;
    
    const newMessages = [...chatMessages, { id: Date.now().toString(), role: 'user', content: chatInput }];
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
  };
`;

content = content.replace(
  'const toggleLayer = (key: keyof typeof layers) => {',
  panelState + '\n  const toggleLayer = (key: keyof typeof layers) => {'
);

// Replace the ANALYZE AREA button action
content = content.replace(
  'onClick={() => navigate(`/project/${currentProjectId || \'new\'}/reports`)}',
  'onClick={runAnalysis}'
);

// Render Panel
const rightPanel = `
      {isAnalysisOpen && (
        <div className="absolute right-0 top-0 h-full w-[450px] bg-surface/95 backdrop-blur-xl border-l border-border flex flex-col z-20 shadow-2xl animate-in slide-in-from-right">
          <div className="p-4 border-b border-border flex justify-between items-center bg-void/50">
            <div>
              <h2 className="font-display font-bold text-[16px] text-text-1">Diagnostic & IA</h2>
              <p className="text-[12px] text-text-3 font-medium flex items-center">
                <MapIcon className="w-3 h-3 mr-1" /> {activeZone}
              </p>
            </div>
            <button onClick={() => setIsAnalysisOpen(false)} className="p-2 hover:bg-elevated rounded-lg text-text-3 hover:text-text-1 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
            {chatMessages.length === 0 && analysisLoading && (
              <div className="flex flex-col items-center justify-center h-full text-text-3 space-y-4">
                <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[13px] animate-pulse">Génération du diagnostic en cours...</p>
              </div>
            )}
            
            {chatMessages.map(msg => (
              <div key={msg.id} className={\`flex flex-col \${msg.role === 'user' ? 'items-end' : 'items-start'}\`}>
                <div className={\`\${msg.role === 'user' ? 'bg-[#1E2638] text-text-1 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]' : 'w-full'} text-[13px] leading-relaxed markdown-body\`}>
                  {msg.role === 'user' ? msg.content : (
                    <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                  )}
                </div>
              </div>
            ))}
            {analysisLoading && chatMessages.length > 0 && (
               <div className="flex items-center space-x-2 text-text-3 p-2">
                 <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-[12px]">L'IA réfléchit...</span>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-border bg-void/50">
             <form onSubmit={handleChatSubmit} className="relative">
               <input
                 type="text"
                 value={chatInput}
                 onChange={e => setChatInput(e.target.value)}
                 placeholder="Posez une question sur ce diagnostic ou testez un scénario..."
                 className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 text-[13px] text-text-1 focus:border-brand-teal outline-none"
                 disabled={analysisLoading}
               />
               <button 
                 type="submit" 
                 disabled={!chatInput.trim() || analysisLoading}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-teal/20 text-brand-teal rounded-lg hover:bg-brand-teal/30 transition-colors disabled:opacity-50"
               >
                 <Send className="w-4 h-4" />
               </button>
             </form>
             <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase text-text-3 font-bold mr-1 mt-1">Scénarios rapides :</span>
                <button type="button" onClick={() => setChatInput("Simule un scénario de désimperméabilisation maximale")} className="text-[11px] px-2 py-1 bg-elevated hover:bg-border rounded text-brand-teal transition-colors">+ Désimperméabilisation</button>
                <button type="button" onClick={() => setChatInput("Quel serait l'impact d'une crue centennale ?")} className="text-[11px] px-2 py-1 bg-elevated hover:bg-border rounded text-brand-blue transition-colors">+ Crue centennale</button>
             </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  '{/* Zoom Controls (Top Left) */}',
  rightPanel + '\n      {/* Zoom Controls (Top Left) */}'
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
