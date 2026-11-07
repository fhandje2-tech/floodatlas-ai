import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

// The component is named Step4Tour, not Step4Ready
content = content.replace(
  'function Step4Tour({ language }: { language: string }) {',
  'function Step4Tour({ language }: { language: string }) {\n  const { t } = useTranslation("onboarding");'
);

// We need to fix priorityOptions map, it's iterating over objects now, not strings
const fixPriorityOptionsMap = `
        {priorityOptions.map((opt, i) => (
          <div 
            key={i} 
            className={\`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors \${priorities[i] ? "bg-brand-teal/10 border-brand-teal" : "bg-surface border-border hover:border-text-3"}\`}
            onClick={() => {
              const newPriorities = [...priorities];
              newPriorities[i] = !newPriorities[i];
              setPriorities(newPriorities);
            }}
          >
            <div className="flex items-center space-x-3">
               <span className="text-xl">{opt.icon}</span>
               <span className={\`text-[13px] font-medium \${priorities[i] ? "text-brand-teal" : "text-text-1"}\`}>{opt.label}</span>
            </div>
            <div className={\`w-5 h-5 rounded border flex items-center justify-center transition-colors \${priorities[i] ? "bg-brand-teal border-brand-teal" : "border-border"}\`}>
              {priorities[i] && <Check className="w-3 h-3 text-void" />}
            </div>
          </div>
        ))}
`;

content = content.replace(/\{priorityOptions\.map\(\(lbl, i\) => \([\s\S]*?\)\)}\n      <\/div>/, fixPriorityOptionsMap.trim() + '\n      </div>');

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
