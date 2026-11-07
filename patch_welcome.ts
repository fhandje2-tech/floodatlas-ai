import fs from 'fs';

let content = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

const oldRender = `  const renderContent = (content: string, msgId?: string) => {
    if (msgId === "welcome") {
      const name = auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "Utilisateur";
      const zone = activeZone ? activeZone.split(",")[0] : (language === "en" ? "your territory" : "votre territoire");
      
      let personalizedGreeting = \`Bonjour \${name} ! En tant que conseiller expert en résilience territoriale, je peux analyser vos aléas climatiques (ruissellement, crues) et concevoir des stratégies "Ville Éponge". Par quoi voulez-vous commencer pour \${zone} ?\`;
      
      if (language === "en") personalizedGreeting = \`Hello \${name}! As an expert advisor in territorial resilience, I can analyze your climate risks (runoff, floods) and design "Sponge City" strategies. Where would you like to start for \${zone}?\`;
      
      content = personalizedGreeting;
    }`;

// Wait, the previous replacement might not be exact. Let's just do a regex replace for the whole `if (msgId === "welcome")` block.
// Or just let's check what's actually inside AIAssistant.tsx first.
