const fs = require('fs');

let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

file = file.replace(/let personalizedGreeting = `Hello \$\{name\}! I am FloodAtlas AI. How can I help you analyze the territory and infrastructure today\?`;/, 
  'let personalizedGreeting = `Hello ${name}! I am FloodAtlas AI. How can I help you analyze the territory of ${activeZone ? activeZone.split(",")[0] : "your active zone"} today?`;');

file = file.replace(/What shall we look at today\?`;/, 'What shall we look at in ${activeZone ? activeZone.split(",")[0] : "your active zone"} today?`;');
file = file.replace(/Where would you like to start\?`;/, 'What would you like to know about ${activeZone ? activeZone.split(",")[0] : "your active zone"}?`;');
file = file.replace(/regulatory impacts on your developments.`;/, 'regulatory impacts on your developments in ${activeZone ? activeZone.split(",")[0] : "your active zone"}.`;');
file = file.replace(/damage cost estimations.`;/, 'damage cost estimations in ${activeZone ? activeZone.split(",")[0] : "your active zone"}.`;');

fs.writeFileSync('src/screens/AIAssistant.tsx', file);
