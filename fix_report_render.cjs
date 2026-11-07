const fs = require('fs');

let file = fs.readFileSync('src/screens/ReportGenerator.tsx', 'utf8');

const mapPlaceholder = `                {/* Map Placeholder */}
                <div className="mb-10">
                  <h2 className="font-semibold text-lg border-l-2 border-brand-blue pl-3 mb-4">Vulnerability Map</h2>
                  <div className="w-full h-64 bg-slate-100 border border-slate-200 rounded flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                    <span className="text-slate-400 font-mono text-sm relative z-10">[ Mapbox Static Export ]</span>
                  </div>
                </div>`;

const newVisuals = `
                {includeGraphs && (
                  <div className="mb-10 break-inside-avoid">
                    <h2 className="font-semibold text-lg border-l-2 border-brand-teal pl-3 mb-4">Territorial Analysis Results</h2>
                    <p className="text-[14px] text-slate-700 mb-6 font-body">Breakdown of the primary risk drivers affecting {currentZone}.</p>
                    <div className="flex gap-6 items-center bg-slate-50 border border-slate-100 p-6 rounded">
                      <div className="flex-1 space-y-4">
                        {[
                          { label: "Flood Exposure", score: 72, color: "bg-red-500" },
                          { label: "Infrastructure", score: 55, color: "bg-amber-500" },
                          { label: "Building Fragility", score: 48, color: "bg-amber-500" },
                          { label: "Damage Potential", score: 65, color: "bg-red-500" }
                        ].map((bar, i) => (
                          <div key={i} className="flex items-center text-[12px]">
                            <div className="w-32 text-slate-600 font-medium">{bar.label}</div>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full mx-4 overflow-hidden flex">
                              <div className={\`h-full \${bar.color}\`} style={{ width: \`\${bar.score}%\` }} />
                            </div>
                            <div className="w-8 font-data font-bold text-right text-slate-800">{bar.score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {includeMap && (
                  <div className="mb-10 break-inside-avoid">
                    <h2 className="font-semibold text-lg border-l-2 border-brand-blue pl-3 mb-4">Smart Mapping Visuals</h2>
                    <p className="text-[14px] text-slate-700 mb-6 font-body">Static export of the Q100 flood scenario footprint over critical infrastructure.</p>
                    <div className="w-full h-80 bg-slate-100 border border-slate-200 rounded flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-brand-blue/20 blur-2xl rounded-full" />
                      <span className="text-slate-400 font-mono text-sm relative z-10 text-center flex flex-col items-center">
                        <MapIcon className="w-8 h-8 mb-2 opacity-50" />
                        [ High-Resolution Map Export ]
                      </span>
                    </div>
                  </div>
                )}
`;

file = file.replace(mapPlaceholder, newVisuals);

fs.writeFileSync('src/screens/ReportGenerator.tsx', file);
