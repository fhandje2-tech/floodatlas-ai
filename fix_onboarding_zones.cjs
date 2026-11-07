const fs = require('fs');

let file = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

file = file.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);'
);

file = file.replace(
  'const handleNext = () => {\n    if (step < STEPS) setStep(step + 1);\n    else finishOnboarding();\n  };',
  `const handleNext = () => {
    if (step === 2 && zones.length === 0) {
      setError("Please specify at least one territory using an address, coordinate, or file upload before continuing.");
      return;
    }
    setError(null);
    if (step < STEPS) setStep(step + 1);
    else finishOnboarding();
  };`
);

file = file.replace(
  '<Button type="button" onClick={handleNext}>',
  `{error && <div className="absolute bottom-20 right-0 text-brand-red text-sm bg-brand-red/10 px-3 py-2 rounded-md">{error}</div>}
            <Button type="button" onClick={handleNext}>`
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', file);
