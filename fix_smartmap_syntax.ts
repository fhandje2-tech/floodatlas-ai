import fs from 'fs';

let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// The block that is currently broken:
const brokenBlock = `
    React.useEffect(() => {
    if (!map.current) return;
    const updateLayers = () => {`;

// Let's replace the broken return at the bottom and move it up.
// First, we find the exact text:
const bottomReturn = `
  return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);`;

if (content.includes(bottomReturn)) {
  content = content.replace(bottomReturn, '');
  
  // Now inject the return back where it belongs, right before React.useEffect
  const fixBlock = `
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!map.current) return;
    const updateLayers = () => {`;
    
  content = content.replace(brokenBlock, fixBlock);
  fs.writeFileSync('src/screens/SmartMapping.tsx', content);
  console.log('Fixed syntax error!');
} else {
  console.log('Could not find bottomReturn block');
}
