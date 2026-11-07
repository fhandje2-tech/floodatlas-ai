import fs from 'fs';
let content = fs.readFileSync('src/screens/NewProjectScreen.tsx', 'utf8');
content = content.replace(
  '<div className="flex-1 h-full bg-void flex items-center justify-center p-6 overflow-y-auto font-body">',
  '<div className="flex-1 h-full bg-void overflow-y-auto p-6 font-body flex flex-col">\n      <div className="m-auto w-full max-w-xl">'
);
content = content.replace(
  'className="max-w-xl w-full bg-surface border border-border rounded-2xl p-8 shadow-2xl"',
  'className="w-full bg-surface border border-border rounded-2xl p-8 shadow-2xl"'
);
content = content.replace(
  '</motion.div>\n    </div>',
  '</motion.div>\n      </div>\n    </div>'
);
fs.writeFileSync('src/screens/NewProjectScreen.tsx', content);
