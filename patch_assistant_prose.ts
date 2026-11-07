import fs from 'fs';
let content = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

content = content.replace(
  '<div className="bg-[#1a2133] border border-white/10 rounded-xl p-5 mt-2">',
  '<div className="bg-[#1a2133]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 mt-2 shadow-lg">'
);

content = content.replace(
  '<div className="prose prose-invert prose-sm max-w-none text-[14px] leading-relaxed">',
  '<div className="prose prose-invert max-w-none text-[14.5px] leading-relaxed prose-headings:font-display prose-headings:font-semibold prose-headings:text-brand-teal prose-a:text-brand-blue prose-p:mb-5 prose-li:marker:text-brand-teal">'
);

fs.writeFileSync('src/screens/AIAssistant.tsx', content);
