import fs from 'fs';

let content = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

content = content.replace(
  `// const defaultWelcomeMessage = {
  id: "welcome",
  role: "ai",
  content: "Bonjour ! En tant que conseiller expert en résilience territoriale, je peux analyser vos aléas climatiques (ruissellement, crues) et concevoir des stratégies \\"Ville Éponge\\". Par quoi voulez-vous commencer pour votre territoire ?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};`,
  ''
);

fs.writeFileSync('src/stores/agentStore.ts', content);
