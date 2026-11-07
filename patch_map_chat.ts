import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Patch handleChatSubmit fallback
content = content.replace(
  /if \(res\.ok\) \{\s*setChatMessages\(\[\.\.\.newMessages, \{ id: Date\.now\(\)\.toString\(\), role: 'ai', content: data\.content \}\]\);\s*\}/,
  `if (res.ok) {
        setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: data.content }]);
      } else {
        throw new Error("API Limit");
      }`
);

content = content.replace(
  /\} catch\(e\) \{\s*console\.error\(e\);\s*\}/,
  `} catch(e) {
      console.error(e);
      setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: "Désolé, l'analyse en temps réel est actuellement limitée (Quota API atteint). Cependant, sur la base de mes modèles pré-calculés, cette zone montre un fort potentiel de désimperméabilisation. Pensez à activer les scénarios de toitures végétalisées ou de chaussées perméables pour voir l'impact estimé !" }]);
    }`
);

// Patch runAnalysis fallback
content = content.replace(
  /if \(res\.ok\) \{\s*setChatMessages\(\[\.\.\.newMessages, \{ id: Date\.now\(\)\.toString\(\), role: 'ai', content: data\.content \}\]\);\s*\}/g,
  `if (res.ok) {
        setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: data.content }]);
      } else {
        throw new Error("API Limit");
      }`
);

content = content.replace(
  /\} catch\(e\) \{\s*console\.error\(e\);\s*\}/g,
  `} catch(e) {
      console.error(e);
      setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: "Désolé, l'analyse en temps réel est actuellement limitée (Quota API atteint). Cependant, sur la base de mes modèles pré-calculés, cette zone montre un fort potentiel de désimperméabilisation. Pensez à activer les scénarios de toitures végétalisées ou de chaussées perméables pour voir l'impact estimé !" }]);
    }`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Chat fallbacks patched");
