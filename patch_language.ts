import fs from 'fs';

// 1. Update agentStore.ts createProject to accept language and use it for the welcome message
let storeContent = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

const welcomeMessageGen = `
const generateWelcomeMessage = (lang: string) => {
  const messages: Record<string, string> = {
    fr: "Bonjour ! En tant que conseiller expert en résilience territoriale, je peux analyser vos aléas climatiques (ruissellement, crues) et concevoir des stratégies \\"Ville Éponge\\". Par quoi voulez-vous commencer pour votre territoire ?",
    en: "Hello! As an expert advisor in territorial resilience, I can analyze your climate risks (runoff, floods) and design \\"Sponge City\\" strategies. Where would you like to start for your territory?",
    de: "Hallo! Als Experte für territoriale Resilienz kann ich Ihre Klimarisiken (Abfluss, Überschwemmungen) analysieren und \\"Sponge City\\"-Strategien entwerfen. Womit möchten Sie für Ihr Gebiet beginnen?",
    ar: "مرحباً! بصفتي مستشاراً خبيراً في المرونة الإقليمية، يمكنني تحليل المخاطر المناخية (الجريان السطحي والفيضانات) وتصميم استراتيجيات \\"مدينة الإسفنج\\". من أين تريد أن تبدأ لمنطقتك؟"
  };
  return {
    id: "welcome",
    role: "ai",
    content: messages[lang] || messages.en,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};
`;

storeContent = storeContent.replace('const defaultWelcomeMessage = {', welcomeMessageGen + '\n// const defaultWelcomeMessage = {');
storeContent = storeContent.replace(/id: "welcome"[\s\S]*?timestamp:.*\}\n\};/, '');
storeContent = storeContent.replace('createProject: (name, activeZone) => {', 'createProject: (name, activeZone, lang = "fr") => {');
storeContent = storeContent.replace('messages: [defaultWelcomeMessage]', 'messages: [generateWelcomeMessage(lang)]');

fs.writeFileSync('src/stores/agentStore.ts', storeContent);

// 2. Update OnboardingScreen to pass the language
let obContent = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');
obContent = obContent.replace(
  'const { setZones, createProject } = useAgentStore.getState();',
  'const { setZones, createProject, language } = useAgentStore.getState();'
);
obContent = obContent.replace(
  'createProject(finalZones[0] || "Nouveau Territoire", finalZones[0] || null);',
  'createProject(finalZones[0] || "Nouveau Territoire", finalZones[0] || null, language);'
);
fs.writeFileSync('src/screens/OnboardingScreen.tsx', obContent);
