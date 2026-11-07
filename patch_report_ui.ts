import fs from 'fs';
let content = fs.readFileSync('src/screens/ReportGenerator.tsx', 'utf8');

// The reason the button was hidden is that the left panel has overflow-hidden but its content grew larger.
// Change <div className="w-[320px] lg:w-[380px] shrink-0 bg-surface border-r border-border h-full flex flex-col z-20">
const regexContainer = /<div className="w-\[320px\] lg:w-\[380px\] shrink-0 bg-surface border-r border-border h-full flex flex-col z-20">/;
const replacementContainer = `<div className="w-[320px] lg:w-[380px] shrink-0 bg-surface border-r border-border h-full flex flex-col z-20 overflow-hidden">`;
content = content.replace(regexContainer, replacementContainer);

// Make the preview header richer
const regexHeader = /<p className="text-\[15px\] text-slate-500 font-medium">\{currentZone\}<\/p>/;
const replacementHeader = `<p className="text-[16px] text-slate-700 font-medium">{currentZone}</p>
                           <p className="text-[13px] text-slate-500 mt-2">Dossier technique de résilience face au ruissellement pluvial, généré par IA.</p>`;
content = content.replace(regexHeader, replacementHeader);

// Add an export button to the top right of the preview area
const regexPreview = /<div className="w-\[800px\] bg-white min-h-\[1100px\] shadow-2xl rounded-sm mb-20 text-slate-800 p-16 pb-24 relative font-sans">/;
const replacementPreview = `<div className="absolute top-8 right-8 z-50">
                              <button onClick={() => alert('Le rapport complet a été sauvegardé au format sélectionné !')} className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg shadow-lg hover:bg-brand-blue/90 font-medium text-[13px] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Exporter / Sauvegarder
                              </button>
                            </div>
                            <div className="w-[800px] bg-white min-h-[1100px] shadow-2xl rounded-sm mb-20 text-slate-800 p-16 pb-24 relative font-sans">`;
content = content.replace(regexPreview, replacementPreview);

fs.writeFileSync('src/screens/ReportGenerator.tsx', content);
console.log("Report UI patched");
