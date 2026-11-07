import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

// 1. Add close button if onClose is provided
if (content.includes('import { Waves,')) {
  content = content.replace('import { Waves, Sparkles', 'import { X, Waves, Sparkles');
}

const headerOld = `<div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold font-display mb-1">Stratégies d'Adaptation</h2>`;
const headerNew = `<div className="p-6 border-b border-border relative">
          {onClose && (
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-void rounded-lg text-text-3 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-bold font-display mb-1">Stratégies d'Adaptation</h2>`;

content = content.replace(headerOld, headerNew);

// 2. Update the prompt to use customPrompt instead of basePrompt in the UI (wait, ScenarioPanel calls fetch directly)
// We need to change the fetch call:
const oldFetch = `      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioName, location: activeZone || "urban area" })
      });`;

const newFetch = `      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioName, location: activeZone || "urban area", prompt: customPrompt })
      });`;

content = content.replace(oldFetch, newFetch);

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
