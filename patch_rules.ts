import fs from 'fs';

let content = fs.readFileSync('firestore.rules', 'utf8');

// Add messages field constraint
content = content.replace(
  `             (data.keys().hasAll(['resilienceIndex']) ? (data.resilienceIndex is number) : true);`,
  `             (data.keys().hasAll(['resilienceIndex']) ? (data.resilienceIndex is number) : true) &&
             (data.keys().hasAll(['messages']) ? (data.messages is string && data.messages.size() <= 500000) : true);`
);

content = content.replace(
  `             (data.keys().hasAll(['resilienceIndex']) ? (data.resilienceIndex is number) : true);`,
  `             (data.keys().hasAll(['resilienceIndex']) ? (data.resilienceIndex is number) : true) &&
             (data.keys().hasAll(['messages']) ? (data.messages is string && data.messages.size() <= 500000) : true);`
);

content = content.replace(
  `incoming().diff(existing()).affectedKeys().hasOnly(['name', 'zone', 'role', 'context', 'diagnosticPriorities', 'criticalInfrastructures', 'selectedLevers', 'resilienceIndex', 'updatedAt']);`,
  `incoming().diff(existing()).affectedKeys().hasOnly(['name', 'zone', 'role', 'context', 'diagnosticPriorities', 'criticalInfrastructures', 'selectedLevers', 'resilienceIndex', 'messages', 'updatedAt']);`
);

fs.writeFileSync('firestore.rules', content);
