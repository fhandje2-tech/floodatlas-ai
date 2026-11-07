import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const replacement = `const runAnalysis = async () => {
    let zoneToUse = activeZone;
    if (!zoneToUse && search.trim()) {
      zoneToUse = search.trim();
      setActiveZone(zoneToUse);
    }
    if (!zoneToUse) {
      alert("Veuillez d'abord rechercher et sélectionner une zone.");
      return;
    }
    setIsAnalysisOpen(true);
    setAnalysisLoading(true);
    
    // Inject custom prompt dynamically to generate recommendations and an alert but friendly response
    const customPrompt = \`Le client a cliqué sur "Analyser la zone" pour \${zoneToUse}. Rédige une réponse décontractée, bienveillante mais alertante sur les risques hydrologiques probables de cette zone (ruissellement, imperméabilisation). N'oublie pas de proposer directement des solutions "Ville Éponge" (désimperméabilisation, noues, toitures végétalisées, etc.) adaptées au contexte (urbain vs naturel) pour susciter l'action. Garde un ton d'expert conseiller.\`;
`;

content = content.replace(/const runAnalysis = async \(\) => \{[\s\S]*?const customPrompt = `Le client a cliqué sur "Analyser la zone" pour \$\{activeZone\}[\s\S]*?`;/, replacement);

content = content.replace(/activeZone,/g, "zoneToUse || activeZone,");

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("runAnalysis activeZone fallback patched");
