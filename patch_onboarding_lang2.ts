import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

content = content.replace(
  'Bienvenue sur FloodAtlas AI',
  '{language === "en" ? "Welcome to FloodAtlas AI" : "Bienvenue sur FloodAtlas AI"}'
);

content = content.replace(
  'L\'intelligence climatique pour',
  '{language === "en" ? "Climate intelligence for" : "L\'intelligence climatique pour"}'
);

content = content.replace(
  'Bonjour',
  '{language === "en" ? "Hello" : "Bonjour"}'
);

content = content.replace(
  'Définissez votre territoire',
  '{language === "en" ? "Define your territory" : "Définissez votre territoire"}'
);

content = content.replace(
  'Votre espace projet est prêt.',
  '{language === "en" ? "Your project workspace is ready." : "Votre espace projet est prêt."}'
);

content = content.replace(
  /5 modules experts propulsés par l'IA pour bâtir un territoire résilient\./,
  '{language === "en" ? "5 expert AI-powered modules to build a resilient territory." : "5 modules experts propulsés par l\'IA pour bâtir un territoire résilient."}'
);

content = content.replace(
  '{step === STEPS \? "Open my dashboard" : "Continue"}',
  '{step === STEPS ? (language === "en" ? "Open my dashboard" : "Ouvrir mon tableau de bord") : (language === "en" ? "Continue" : "Continuer")}'
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
