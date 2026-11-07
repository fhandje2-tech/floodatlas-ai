import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Inside SmartMapping, listen for expand-panel event to toggle isExpanded
const expandLogic = `
  useEffect(() => {
    const handleExpand = () => setIsExpanded(true);
    window.addEventListener('expand-panel', handleExpand);
    return () => window.removeEventListener('expand-panel', handleExpand);
  }, []);
`;

content = content.replace('const [search, setSearch] = useState(activeZone || "");', expandLogic + '\n  const [search, setSearch] = useState(activeZone || "");');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("Expand event listener added");
