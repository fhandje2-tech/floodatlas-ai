import fs from 'fs';

let content = fs.readFileSync('src/screens/TerritoryAnalysis.tsx', 'utf8');

// Replace the status logic and default state.
// Currently status = "calibration" | "loading" | "results". We have a useEffect that instantly runs it. We should remove that useEffect.

content = content.replace(
  /  useEffect\(\(\) => \{\n    if \(status === "calibration"\) \{\n      runDiagnostic\(\);\n    \}\n  \}, \[status\]\);\n/g,
  ''
);

// We want to render a calibration step instead of empty.
const calibrationUI = `
      {status === "calibration" && (
        <div className="max-w-2xl mx-auto mt-12 bg-surface border border-border rounded-2xl p-8 shadow-elevated">
          <h2 className="text-2xl font-display font-bold text-text-1 mb-2">Paramétrer le Diagnostic</h2>
          <p className="text-text-3 text-[13px] mb-8">Confirmez la zone d'étude et les priorités avant de lancer l'analyse IA.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[12px] font-semibold text-text-2 uppercase tracking-wider mb-2">
                Zone d'étude principale
              </label>
              <input 
                type="text" 
                value={activeZone || ""}
                onChange={(e) => setActiveZone(e.target.value)}
                className="w-full bg-void border border-border rounded-lg px-4 py-3 text-[14px] text-text-1 focus:border-brand-teal outline-none transition-colors"
                placeholder="Ex: Centre-ville, Paris"
              />
            </div>
            
            <div>
              <label className="block text-[12px] font-semibold text-text-2 uppercase tracking-wider mb-3">
                Focus de l'analyse (Optionnel)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Risque inondation (ruissellement)", "Îlots de chaleur urbains", "Désimperméabilisation", "Vulnérabilité des infrastructures"].map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      const newFocus = calibrationData.priorities.includes(f) 
                        ? calibrationData.priorities.filter(p => p !== f)
                        : [...calibrationData.priorities, f];
                      setCalibrationData({...calibrationData, priorities: newFocus});
                    }}
                    className={\`flex items-center p-3 rounded-lg border text-left transition-colors \${calibrationData.priorities.includes(f) ? "bg-brand-teal/10 border-brand-teal text-brand-teal" : "bg-void border-border text-text-1 hover:border-text-3"}\`}
                  >
                    <span className="text-[13px] font-medium">{f}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <Button onClick={runDiagnostic} disabled={!activeZone}>
              Lancer le Diagnostic <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
`;

content = content.replace(
  /      \{status === "loading" && \(/,
  calibrationUI.trim() + '\n      {status === "loading" && ('
);

fs.writeFileSync('src/screens/TerritoryAnalysis.tsx', content);
