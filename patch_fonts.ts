import fs from 'fs';
let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace(
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@700&display=swap');",
  "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@500;600;700&display=swap');"
);

content = content.replace(
  '--font-display: "Space Grotesk"',
  '--font-display: "Outfit"'
);

content = content.replace(
  '--font-body: "Inter"',
  '--font-body: "Plus Jakarta Sans"'
);

fs.writeFileSync('src/index.css', content);
