const fs = require('fs');
let file = fs.readFileSync('src/stores/agentStore.ts', 'utf8');

const oldMsg = /content: "Hello Fabien! How can I assist you today with your reflections on this new project\? Would you like to start by exploring a plot, estimating a budget, or defining the program\?"/;
const newMsg = `content: "Hello! As your territorial resilience and urban planning assistant, I'm here to help you design Sponge City strategies, evaluate natural expansion zones, and build a climate-resilient PLU. Should we run a vulnerability diagnostic or explore de-sealing opportunities for your territory?"`;

file = file.replace(oldMsg, newMsg);

fs.writeFileSync('src/stores/agentStore.ts', file);
