import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const regex = /<AddressAutocomplete[\s\S]*?onSelect=\{\(addr\) => \{\s*setSearch\(addr\);\s*setActiveZone\(addr\);\s*\}\}[\s\S]*?\/>/;

const replacement = `<AddressAutocomplete 
                  value={search}
                  onChange={setSearch}
                  onSelect={(addr, result) => {
                    setSearch(addr);
                    setActiveZone(addr);
                    if (result && result.lat && result.lon && map.current) {
                      map.current.flyTo({ center: [parseFloat(result.lon), parseFloat(result.lat)], zoom: 14.5, duration: 2000 });
                    }
                  }}
                  placeholder="Rechercher une zone..."
               />`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
console.log("FlyTo 3 patched");
