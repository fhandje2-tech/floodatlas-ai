import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

content = content.replace(
  '<h2 className="font-display font-bold text-3xl mb-3">{language === "en" ? `Welcome to FloodAtlas AI, ${name || "User"}.` : `Bienvenue sur FloodAtlas IA, ${name || "Utilisateur"}.`}</h2>',
  '<h2 className="font-display font-bold text-3xl mb-3">{language === "en" ? (name && name !== "User" ? `Welcome to FloodAtlas AI, ${name}.` : "Welcome to FloodAtlas AI.") : (name && name !== "User" && name !== "Utilisateur" ? `Bienvenue sur FloodAtlas IA, ${name}.` : "Bienvenue sur FloodAtlas IA.")}</h2>'
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
