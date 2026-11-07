const fs = require('fs');

let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

// 1. Update quick requests
const oldQuickRequests = /const quickRequests = \[\s*`Run a vulnerability analysis for \$\{zoneName\}`,\s*`Show me the map with flood risk layers for \$\{zoneName\}`,\s*`Generate a damage cost report for \$\{zoneName\}`,\s*`Simulate an extreme 100-year flood scenario for \$\{zoneName\}`\s*\];/;

const newQuickRequests = `const quickRequests = [
    \`Propose Sponge City solutions (désimperméabilisation) for \${zoneName}\`,
    \`Simulate extreme flood scenarios and natural expansion zones in \${zoneName}\`,
    \`Evaluate urban resilience and source rainwater management for \${zoneName}\`,
    \`Run a full territorial analysis for \${zoneName}\`
  ];`;

file = file.replace(oldQuickRequests, newQuickRequests);

// 2. Update Welcome Message
const oldWelcome = /let personalizedGreeting = `Hello \$\{name\}! I am FloodAtlas AI\. How can I help you analyze the territory of \$\{activeZone \? activeZone\.split\(\",\"\)\[0\] : \"your active zone\"\} today\?`;[\s\S]*?content = personalizedGreeting;/;

const newWelcome = `let personalizedGreeting = \`Hello \${name}! I am FloodAtlas AI, your territorial resilience and urban planning assistant. How can I help you adapt \${activeZone ? activeZone.split(",")[0] : "your active zone"} to extreme weather events today? I can propose Sponge City strategies, de-sealing plans, or simulate flood scenarios.\`;
      if (role === "Architect") {
        personalizedGreeting = \`Hello \${name}! As your architectural assistant on FloodAtlas, I can help you evaluate flood risks for your plots, design source rainwater management systems, and define safe programming for \${activeZone ? activeZone.split(",")[0] : "your active zone"}. What shall we explore today?\`;
      } else if (role === "Public Official") {
        personalizedGreeting = \`Hello \${name}! I am FloodAtlas AI. I'm ready to assist you with urban planning (PLU/SCOT), territory risk assessment, and Sponge City (désimperméabilisation) strategies for \${activeZone ? activeZone.split(",")[0] : "your active zone"}. Where would you like to start?\`;
      } else if (role === "Real Estate Developer") {
        personalizedGreeting = \`Hello \${name}! I am FloodAtlas AI. Ready to help you assess property resilience, evaluate adaptation costs (green roofs, swales), and understand regulatory impacts on your developments in \${activeZone ? activeZone.split(",")[0] : "your active zone"}.\`;
      } else if (role === "Insurer") {
        personalizedGreeting = \`Hello \${name}! I am FloodAtlas AI. I can assist with portfolio risk analysis, underwriting models, and evaluating the ROI of urban resilience measures in \${activeZone ? activeZone.split(",")[0] : "your active zone"}.\`;
      }
      content = personalizedGreeting;`;

file = file.replace(oldWelcome, newWelcome);

// 3. Update Markdown rendering of ACTIONs to support more flexible parsing
file = file.replace(/const actions = \[\.\.\.content\.matchAll\(\/ACTION:\(\[a-z\]\+\):\(.*?\)\/g\)\];/, 'const actions = [...content.matchAll(/ACTION:([a-z]+):?(.*)/g)];');

fs.writeFileSync('src/screens/AIAssistant.tsx', file);
