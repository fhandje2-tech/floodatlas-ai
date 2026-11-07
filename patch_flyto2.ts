import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// Update AddressAutocomplete onSelect to pass result directly and prevent an extra Nominatim call
const regex = /<AddressAutocomplete \s*value=\{search\}\s*onChange=\{setSearch\}\s*onSelect=\{\(addr\) => \{\s*setSearch\(addr\);\s*setActiveZone\(addr\);\s*\}\}/;

const replacement = `<AddressAutocomplete 
                  value={search}
                  onChange={setSearch}
                  onSelect={(addr, result) => {
                    setSearch(addr);
                    setActiveZone(addr);
                    if (result && result.lat && result.lon && map.current) {
                      map.current.flyTo({ center: [parseFloat(result.lon), parseFloat(result.lat)], zoom: 14.5, duration: 2000 });
                    }
                  }}`;

content = content.replace(regex, replacement);

// And we can remove the extra fetch logic from the useEffect since AddressAutocomplete handles it now
// Let's just remove the effect altogether since the map will be positioned correctly on select
const useEffectFlyToRegex = /useEffect\(\(\) => \{\s*if \(activeZone && map\.current && map\.current\.isStyleLoaded\(\)\) \{\s*const fetchCoords = async \(\) => \{[\s\S]*?\}\s*fetchCoords\(\);\s*\}\s*\}, \[activeZone\]\);/;
content = content.replace(useEffectFlyToRegex, "");

// In fact, wait, the user said "il apparait ce message". If I just removed the useEffect, and the search onSelect works, it should be fine. But what if activeZone is set from somewhere else (like Home page)?
// It's better to keep it but handle the case where it's already centered, or rely on AddressAutocomplete mostly. Let's just keep the AddressAutocomplete one, and for activeZone on load, we can add it to the map 'load' event!

// Oh wait, I didn't replace AddressAutocomplete properly because the regex might not match.
// Let's check exactly what the AddressAutocomplete line looks like.
