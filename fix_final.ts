import fs from 'fs';

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\} , AlertCircle, FileBarChart \} from "lucide-react";/g, ', AlertCircle, FileBarChart } from "lucide-react";');
  fs.writeFileSync(file, content);
}

fixFile('src/screens/SmartMapping.tsx');
fixFile('src/screens/OnboardingScreen.tsx');

