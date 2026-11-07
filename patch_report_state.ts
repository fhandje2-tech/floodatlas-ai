import fs from 'fs';
let content = fs.readFileSync('src/screens/ReportGenerator.tsx', 'utf8');

// Add states
content = content.replace(
  `const [generated, setGenerated] = useState(false);`,
  `const [generated, setGenerated] = useState(false);
  const [promptContext, setPromptContext] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [financials, setFinancials] = useState({ capex: 0, damages: 0, roi: "" });
  const [pageCount, setPageCount] = useState(3);`
);

// Add textarea binding
content = content.replace(
  `<textarea 
            placeholder="Ex: Utiliser la norme NF EN 752. Limiter le rapport à 10 pages..."
            className="w-full h-24 bg-void border border-border rounded-lg p-3 text-[13px] text-text-1 resize-none focus:border-brand-blue outline-none"
          ></textarea>`,
  `<textarea 
            placeholder="Ex: Utiliser la norme NF EN 752. Limiter le rapport à 10 pages..."
            className="w-full h-24 bg-void border border-border rounded-lg p-3 text-[13px] text-text-1 resize-none focus:border-brand-blue outline-none"
            value={promptContext}
            onChange={e => setPromptContext(e.target.value)}
          ></textarea>`
);

// Modify handleGenerate
const replacementGenerate = `
  const handleGenerate = async () => {
    setGenerating(true);
    
    // Attempt to extract page count from prompt
    const pageMatch = promptContext.match(/(\\d+)\\s*pages?/i);
    const pages = pageMatch ? parseInt(pageMatch[1], 10) : 3;
    setPageCount(pages);

    // Calculate simulated financials based on levers and zone
    const baseDamage = currentZone !== "Territoire Global" ? Math.floor(2000000 + Math.random() * 8000000) : 1500000;
    const baseCapex = selectedLevers.length > 0 ? selectedLevers.length * 450000 : 250000;
    
    setFinancials({
      capex: baseCapex,
      damages: baseDamage,
      roi: ((baseDamage - baseCapex) / baseCapex * 100).toFixed(1) + "%"
    });

    try {
      // Try calling the AI to generate a custom executive summary
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: \`Rédige un résumé exécutif formel pour un rapport de résilience climatique sur la zone "\${currentZone}". Le rapport contiendra \${pages} pages. Intègre ces consignes spécifiques de l'utilisateur : "\${promptContext}". Mets en avant les aspects \${reportType} et justifie un investissement de \${baseCapex}€ pour éviter \${baseDamage}€ de dégâts.\`}],
          activeZone: currentZone,
          role: "Expert en modélisation",
          selectedLevers: [],
          resilienceIndex: 45,
          language: "fr"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.content);
      } else {
        throw new Error("Quota exceeded or error");
      }
    } catch(e) {
      // Fallback if AI fails (quota limits)
      let fb = \`L'analyse approfondie du territoire de \${currentZone} révèle une vulnérabilité critique face aux épisodes de ruissellement intense. \`;
      if (promptContext) fb += \`Conformément à vos directives ("\${promptContext}"), ce document de \${pages} pages détaille la méthodologie. \`;
      fb += \`Le déploiement des stratégies de "Ville Éponge" (Capex estimé à \${(baseCapex/1000000).toFixed(2)} M€) permettrait d'éviter jusqu'à \${(baseDamage/1000000).toFixed(2)} M€ de dommages directs et indirects en cas de crue centennale.\`;
      setAiSummary(fb);
    } finally {
      setGenerating(false);
      setGenerated(true);
    }
  };
`;

content = content.replace(
  /const handleGenerate = \(\) => \{[\s\S]*?\}, 1500\);\n  \};/,
  replacementGenerate
);

fs.writeFileSync('src/screens/ReportGenerator.tsx', content);
console.log("ReportGenerator handleGenerate patched");
