const fs = require('fs');

let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

file = file.replace(
  'Image as ImageIcon, Paperclip } from "lucide-react";',
  'Mic, Paperclip } from "lucide-react";'
);

// We need to add the 4 quick requests above the max-w-3xl div.
// And replace the paperclip and image icons.

const oldInputArea = `<div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19] to-transparent pt-12">
          <div className="max-w-3xl mx-auto relative bg-[#131929] border border-white/10 rounded-2xl p-3 shadow-2xl transition-all focus-within:border-brand-blue/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <textarea`;

const quickRequests = `
  const quickRequests = [
    "Run a vulnerability analysis for my territory",
    "Show me the map with flood risk layers",
    "Generate a damage cost report",
    "Simulate an extreme 100-year flood scenario"
  ];
`;

if (!file.includes("quickRequests")) {
  file = file.replace(/export function AIAssistant/, quickRequests + "\nexport function AIAssistant");
}

const newInputArea = `<div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19] to-transparent pt-24 pointer-events-none">
          <div className="max-w-3xl mx-auto flex flex-col pointer-events-auto">
            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {quickRequests.map((req, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setInput(req); }}
                    className="px-3 py-2 bg-[#1E2638]/80 hover:bg-[#1E2638] border border-white/5 rounded-xl text-[12px] text-text-2 hover:text-text-1 transition-colors text-left"
                  >
                    {req}
                  </button>
                ))}
              </div>
            )}
            <div className="relative bg-[#131929] border border-white/10 rounded-2xl p-3 shadow-2xl transition-all focus-within:border-brand-blue/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <textarea`;

file = file.replace(oldInputArea, newInputArea);

const oldButtons = `<div className="flex space-x-1">
                 <button className="p-2 text-text-3 hover:text-text-1 hover:bg-white/5 rounded-full transition-colors tooltip-trigger" title="Attach file or document">
                   <Paperclip className="w-[18px] h-[18px]" />
                 </button>
                 <button className="p-2 text-text-3 hover:text-text-1 hover:bg-white/5 rounded-full transition-colors tooltip-trigger" title="Upload image">
                   <ImageIcon className="w-[18px] h-[18px]" />
                 </button>
              </div>`;

const newButtons = `<div className="flex space-x-1">
                 <button className="p-2 text-text-3 hover:text-text-1 hover:bg-white/5 rounded-full transition-colors tooltip-trigger" title="Attach files, documents or images">
                   <Paperclip className="w-[18px] h-[18px]" />
                 </button>
                 <button className="p-2 text-text-3 hover:text-text-1 hover:bg-white/5 rounded-full transition-colors tooltip-trigger" title="Set request through voice">
                   <Mic className="w-[18px] h-[18px]" />
                 </button>
              </div>`;

file = file.replace(oldButtons, newButtons);

// And we need to add a closing div for max-w-3xl flex flex-col
file = file.replace(/<\/div>\n          <\/div>\n        <\/div>/, '</div>\n            </div>\n          </div>\n        </div>');

fs.writeFileSync('src/screens/AIAssistant.tsx', file);
