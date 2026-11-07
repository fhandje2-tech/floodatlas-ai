import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

content = content.replace(
  'const [search, setSearch] = useState(activeZone || "");',
  'const [search, setSearch] = useState(activeZone || "");\n  const [mapStyle, setMapStyle] = useState<"dark"|"satellite">("dark");'
);

const styleEffect = `
  useEffect(() => {
    if (!map.current) return;
    const darkStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
    const satelliteStyle = {
      version: 8,
      sources: {
        "satellite": {
          type: "raster",
          tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
          tileSize: 256
        }
      },
      layers: [{
        id: "satellite",
        type: "raster",
        source: "satellite",
        minzoom: 0,
        maxzoom: 22
      }]
    };
    
    map.current.setStyle(mapStyle === "satellite" ? satelliteStyle as any : darkStyle);
  }, [mapStyle]);
`;

content = content.replace(
  'const toggleLayer = (key: keyof typeof layers) => {',
  styleEffect + '\n  const toggleLayer = (key: keyof typeof layers) => {'
);

content = content.replace(
  '<button className="flex items-center px-4 py-2 bg-surface shadow-elevated rounded-lg border border-border text-[11px] font-bold text-text-2 hover:text-white uppercase tracking-wider transition-colors">',
  '<button onClick={() => setMapStyle(mapStyle === "dark" ? "satellite" : "dark")} className={`flex items-center px-4 py-2 bg-surface shadow-elevated rounded-lg border border-border text-[11px] font-bold uppercase tracking-wider transition-colors ${mapStyle === "satellite" ? "text-brand-blue" : "text-text-2 hover:text-white"}`}>'
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
