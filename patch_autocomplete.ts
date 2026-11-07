import fs from 'fs';
let content = fs.readFileSync('src/components/AddressAutocomplete.tsx', 'utf8');

// The bug is that we compare query !== value in the debounce. 
// If the parent updates value synchronously, they are always equal.
// We should just debounce on query and only compare if it's different from the *last searched* query.
const newEffect = `
  const [lastSearched, setLastSearched] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query.length > 2 && query !== lastSearched) {
        fetchResults(query);
      } else if (!query) {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, lastSearched]);

  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);
`;

content = content.replace(/  \/\/ Simple debounce inline[\s\S]*?\}, \[value\]\);/, newEffect);

content = content.replace('setIsOpen(false);', 'setLastSearched(r.display_name);\n                setIsOpen(false);');

fs.writeFileSync('src/components/AddressAutocomplete.tsx', content);
