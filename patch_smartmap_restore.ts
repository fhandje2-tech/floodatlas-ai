import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /return \([\s\S]*?\n    <PanelGroup direction="horizontal"/;
content = content.replace(regex, `return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);
  
  const analyseFeature = () => {
    alert("Running detailed hydrological analysis for this feature...");
  };

  return (
    <PanelGroup direction="horizontal"`);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
