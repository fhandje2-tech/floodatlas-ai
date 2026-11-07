const fs = require('fs');

let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

const oldQuickRequests = `
  const quickRequests = [
    "Run a vulnerability analysis for my territory",
    "Show me the map with flood risk layers",
    "Generate a damage cost report",
    "Simulate an extreme 100-year flood scenario"
  ];
`;

file = file.replace(oldQuickRequests, '');

const newQuickRequests = `
  const zoneName = activeZone ? activeZone.split(",")[0] : "my territory";
  const quickRequests = [
    \`Run a vulnerability analysis for \${zoneName}\`,
    \`Show me the map with flood risk layers for \${zoneName}\`,
    \`Generate a damage cost report for \${zoneName}\`,
    \`Simulate an extreme 100-year flood scenario for \${zoneName}\`
  ];
`;

file = file.replace(/const \[input, setInput\] = useState\(""\);/, 'const [input, setInput] = useState("");' + newQuickRequests);

fs.writeFileSync('src/screens/AIAssistant.tsx', file);
