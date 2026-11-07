import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

// Move the t("welcomeName") and t("setupIn2Min") into Step1Role, because they are inside Step1Role!
// Wait, no, let me check where they are actually located.
