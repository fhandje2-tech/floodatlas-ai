import fs from 'fs';

let content = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

const oldWelcome = `    if (msgId === "welcome") {
      const name = auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "Utilisateur";
      const zone = activeZone ? activeZone.split(",")[0] : (language === "en" ? "your territory" : "votre territoire");
      
      let personalizedGreeting = \`Bonjour \${name} ! En tant que conseiller expert en résilience territoriale, je peux analyser vos aléas climatiques (ruissellement, crues) et concevoir des stratégies "Ville Éponge". Par quoi voulez-vous commencer pour \${zone} ?\`;
      
      if (language === "en") {
        personalizedGreeting = \`Hello \${name}! As an expert advisor in territorial resilience, I can analyze your climate risks (runoff, floods) and design "Sponge City" strategies. Where would you like to start for \${zone}?\`;
      } else if (language === "de") {
        personalizedGreeting = \`Hallo \${name}! Als Experte für territoriale Resilienz kann ich Ihre Klimarisiken analysieren und "Sponge City"-Strategien entwerfen. Womit möchten Sie für \${zone} beginnen?\`;
      } else if (language === "ar") {
        personalizedGreeting = \`مرحباً \${name}! بصفتي مستشاراً خبيراً في المرونة الإقليمية، يمكنني تحليل المخاطر المناخية وتصميم استراتيجيات مدينة الإسفنج لمنطقتك. من أين تريد أن تبدأ؟\`;
      }
      
      content = personalizedGreeting;
    }`;

const newWelcome = `    if (msgId === "welcome") {
      const name = auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "Utilisateur";
      const zone = activeZone ? activeZone.split(",")[0] : (language === "en" ? "your territory" : "votre territoire");
      const userRole = role || (language === "en" ? "decision-maker" : "décideur");
      
      let personalizedGreeting = \`👋 **Bienvenue \${name} !**\\n\\nVotre espace de travail pour **\${zone}** est prêt. En tant que \${userRole}, votre rôle est essentiel pour adapter votre territoire face au dérèglement climatique.\\n\\nJe suis l'IA de FloodAtlas, votre conseiller stratégique. Je vais vous accompagner pour :\\n- **Diagnostiquer** les zones vulnérables (inondations, îlots de chaleur)\\n- **Concevoir** des aménagements "Ville Éponge" (désimperméabilisation, noues)\\n- **Simuler** l'impact et évaluer les coûts (CAPEX/OPEX)\\n\\nPar quoi souhaitez-vous que l'on commence ?\`;
      
      if (language === "en") {
        personalizedGreeting = \`👋 **Welcome \${name}!**\\n\\nYour workspace for **\${zone}** is ready. As a \${userRole}, your role is essential in adapting your territory to climate change.\\n\\nI am FloodAtlas AI, your strategic advisor. I will assist you to:\\n- **Diagnose** vulnerable areas (floods, heat islands)\\n- **Design** "Sponge City" layouts (de-sealing, swales)\\n- **Simulate** impact and evaluate costs (CAPEX/OPEX)\\n\\nWhat would you like to start with?\`;
      }
      
      content = personalizedGreeting;
    }`;

content = content.replace(oldWelcome, newWelcome);
fs.writeFileSync('src/screens/AIAssistant.tsx', content);
