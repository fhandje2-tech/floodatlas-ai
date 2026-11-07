import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

if (!content.includes('import { auth } from "../services/firebase"')) {
  content = content.replace(
    'import { useNavigate } from "react-router";',
    'import { useNavigate } from "react-router";\nimport { auth } from "../services/firebase";'
  );
}

const welcomeLogic = `msg.id === 'welcome' ? (
                    <Markdown remarkPlugins={[remarkGfm]}>{msg.content.replace("Fabien", auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "User")}</Markdown>
                  ) : (
                    <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                  )`;

content = content.replace(
  '<Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>',
  welcomeLogic
);

// We should also display the welcome message if the user opens the panel WITHOUT clicking "ANALYZE AREA".
// Actually, let's make the chat panel toggleable by a button. Let's rename "ANALYZE AREA" to "DIAGNOSTIC & IA"
content = content.replace(
  'ANALYZE AREA',
  'DIAGNOSTIC & IA'
);

content = content.replace(
  'onClick={runAnalysis}',
  'onClick={() => setIsAnalysisOpen(true)}'
);

// We need a separate button to actually run the analysis if it hasn't been run, or they can just type it in the chat.
// But the user specifically wanted the "Analyze Area" button to provide the diagnostic.
// If "DIAGNOSTIC & IA" just opens the panel, we should have a "Lancer l'analyse" button IN the panel if they haven't run it yet!
const analysisButton = `
            {chatMessages.length <= 1 && !analysisLoading && (
              <div className="flex justify-center my-4">
                <Button onClick={runAnalysis} variant="primary" className="shadow-elevated w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Lancer le diagnostic de {activeZone || "la zone"}
                </Button>
              </div>
            )}
`;

content = content.replace(
  '{chatMessages.map(msg => (',
  analysisButton + '\n            {chatMessages.map(msg => ('
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
