import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

const loadingUiRegex = /if \(loading\) \{[\s\S]*?if \(initError\) \{[\s\S]*?\}\n/g;

const newLoading = `
  if (loading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center font-body">
        <div className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-2 text-sm">{language === "en" ? "Preparing your workspace..." : "Préparation de votre espace..."}</p>
      </div>
    );
  }
`;

content = content.replace(loadingUiRegex, newLoading);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
