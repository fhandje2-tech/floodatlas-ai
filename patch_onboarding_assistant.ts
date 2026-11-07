import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

content = content.replace(
  '// Navigate to dashboard since the button says "Open my dashboard"\n      navigate("/dashboard");',
  '// Navigate to the AI Assistant for the new project\n      navigate(`/project/${projectId}/assistant`);'
);

content = content.replace(
  'navigate("/dashboard");\n    }\n  };',
  'navigate("/assistant");\n    }\n  };'
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
