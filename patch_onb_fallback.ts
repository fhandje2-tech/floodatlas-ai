import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');
content = content.replace('navigate("/assistant");', 'navigate("/dashboard");');
fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
