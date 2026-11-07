const fs = require('fs');

let file = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

file = file.replace(/navigate\("\/dashboard"\)/g, 'navigate("/assistant")');

fs.writeFileSync('src/screens/OnboardingScreen.tsx', file);
