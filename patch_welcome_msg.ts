import fs from 'fs';
let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

const newWelcome = `const generateWelcomeMessage = (lang: string, role?: string, activeZone?: string | null) => {
  const roleText = role ? \` pour un profil \${role}\` : '';
  const zoneText = activeZone ? \` sur le territoire de \${activeZone}\` : '';
  
  const roleTextEn = role ? \` for a \${role} profile\` : '';
  const zoneTextEn = activeZone ? \` in the territory of \${activeZone}\` : '';
  
  const messages: Record<string, string> = {
    fr: \`Bonjour ! En tant que conseiller expert en résilience territoriale, j'ai initialisé votre espace de travail\${zoneText}. Je suis prêt à analyser vos aléas climatiques et à concevoir des stratégies "Ville Éponge" adaptées à vos enjeux stratégiques\${roleText}. Par quoi voulez-vous commencer ?\`,
    en: \`Hello! As an expert advisor in territorial resilience, I have initialized your workspace\${zoneTextEn}. I am ready to analyze your climate risks and design "Sponge City" strategies adapted to your strategic challenges\${roleTextEn}. Where would you like to start?\`,
    de: "Hallo! Als Experte für territoriale Resilienz kann ich Ihre Klimarisiken analysieren und Strategien entwerfen. Womit möchten Sie beginnen?",
    ar: "مرحباً! بصفتي مستشاراً خبيراً في المرونة الإقليمية، يمكنني تحليل المخاطر المناخية. من أين تريد أن تبدأ؟"
  };
  return {
    id: "welcome",
    role: "ai",
    content: messages[lang] || messages.en,
    timestamp: new Date().toISOString()
  };
};`;

content = content.replace(/const generateWelcomeMessage = \(lang: string\) => \{[\s\S]*?\};\n\n/g, newWelcome + '\n\n');

content = content.replace(
  'createProject: (name, activeZone, lang = "fr") => {',
  'createProject: (name, activeZone, lang = "fr") => {\n        const currentRole = get().role;'
);
content = content.replace(
  'messages: [generateWelcomeMessage(lang)],',
  'messages: [generateWelcomeMessage(lang, currentRole, activeZone)],'
);

fs.writeFileSync('src/stores/agentStore.ts', content);
