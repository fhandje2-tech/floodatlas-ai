const fs = require('fs');
let file = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// 2D/3D Toggle
file = file.replace(/<button \n\s*className="text-text-2 hover:text-text-1" \n\s*title="3D Perspective"\n\s*onClick=\{\(\) => setViewState\(prev => \(\{\.\.\.prev, pitch: prev\.pitch === 0 \? 60 : 0\}\)\)\}\n\s*>\n\s*<Maximize className="w-5 h-5" \/>\n\s*<\/button>/,
`<button 
  className="text-text-2 hover:text-text-1 flex flex-col items-center justify-center font-bold text-[10px]" 
  title="Toggle 2D/3D"
  onClick={() => setViewState(prev => ({...prev, pitch: prev.pitch === 0 ? 60 : 0}))}
>
  {viewState.pitch === 0 ? '3D' : '2D'}
</button>`);

// Add chat input at the bottom of map layers
const chatHtml = `
          <div className="pt-4 border-t border-border mt-auto">
            <span className="text-[12px] font-bold text-brand-blue flex items-center mb-2">
              <Sparkles className="w-3 h-3 mr-1" /> Refine with AI
            </span>
            <div className="relative">
              <input type="text" placeholder="e.g. Show most at-risk schools" className="w-full bg-elevated border border-border rounded text-[11px] px-2 py-1.5 focus:border-brand-blue outline-none text-text-1" />
              <button className="absolute right-1 top-1 bg-brand-blue text-white rounded p-0.5" onClick={() => alert("AI is updating layers based on prompt...")}>
                <Search className="w-3 h-3" />
              </button>
            </div>
          </div>
`;
if(!file.includes("Refine with AI")) {
    file = file.replace(/<span className="text-\[12px\] text-text-2">Global opacity<\/span>/,
      chatHtml + '\n<span className="text-[12px] text-text-2 mt-4 block">Global opacity</span>');
}

// Rename export button
file = file.replace(/<span>Export visible layers<\/span>/, '<span>Export Cartography & Screen Capture</span>');

fs.writeFileSync('src/screens/SmartMapping.tsx', file);
