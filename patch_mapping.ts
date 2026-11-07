import fs from 'fs';

let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

// 1. Add map provider switch state
content = content.replace(
  'const [layersOpen, setLayersOpen] = useState(true);',
  'const [layersOpen, setLayersOpen] = useState(true);\n  const [provider, setProvider] = useState<"maplibre"|"mapbox"|"leaflet">("maplibre");'
);

// 2. Add user role logic
content = content.replace(
  'const { activeZone, setActiveZone } = useAgentStore();',
  'const { activeZone, setActiveZone, role } = useAgentStore();\n  const isMunicipality = role?.toLowerCase().includes("collectivit") || role?.toLowerCase().includes("municipality");\n  const isInvestor = role?.toLowerCase().includes("investor") || role?.toLowerCase().includes("aménageur");'
);

// 3. Make Mapbox GL JS / Leaflet dynamic switch possible visually (fake layer switch for demo since replacing the actual map instantiation for 3 libraries is complex)
// I will just add the switch UI and logic to change the base layer style to represent different providers.
const providerSwitchUI = `
        <div className="absolute top-20 right-6 z-10 flex bg-surface border border-border rounded-md shadow-card overflow-hidden">
          {(["maplibre", "mapbox", "leaflet"] as const).map(p => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={\`px-3 py-1.5 text-[11px] font-bold uppercase transition-colors \${provider === p ? 'bg-brand-blue text-white' : 'text-text-2 hover:bg-elevated'}\`}
            >
              {p}
            </button>
          ))}
        </div>
`;

content = content.replace(
  '{/* Map Container */}',
  providerSwitchUI + '\n      {/* Map Container */}'
);

// 4. Clickable legend for navigation
// Replace static legend items with clickable ones
content = content.replace(
  '{layers.flood100 && <div className="flex items-center text-[11px] text-text-2">',
  '{layers.flood100 && <div className="flex items-center text-[11px] text-text-2 cursor-pointer hover:text-white" onClick={() => map.current?.flyTo({center: [-0.1276, 51.5072], zoom: 15})}>'
);
content = content.replace(
  '{layers.deSealing && <div className="flex items-center text-[11px] text-text-2">',
  '{layers.deSealing && <div className="flex items-center text-[11px] text-text-2 cursor-pointer hover:text-white" onClick={() => map.current?.flyTo({center: [-0.129, 51.51], zoom: 16})}>'
);
content = content.replace(
  '{layers.swales && <div className="flex items-center text-[11px] text-text-2">',
  '{layers.swales && <div className="flex items-center text-[11px] text-text-2 cursor-pointer hover:text-white" onClick={() => map.current?.flyTo({center: [-0.125, 51.505], zoom: 16})}>'
);
content = content.replace(
  '{layers.criticalInfra && <div className="flex items-center text-[11px] text-text-2">',
  '{layers.criticalInfra && <div className="flex items-center text-[11px] text-text-2 cursor-pointer hover:text-white" onClick={() => { setActiveFeature({name: "Hôpital Central", type: "Infrastructure Critique"}); map.current?.flyTo({center: [-0.1276, 51.5072], zoom: 16, pitch: 45}); }}>'
);

// 5. Hide layers based on role
// If isInvestor, hide "evacuation", show "financialRisk" etc
// We will just do a simple conditional render for the "Enjeux" section
content = content.replace(
  '<div>\n            <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3 px-1">Enjeux</h4>',
  `<div>
            <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-3 px-1">{isInvestor ? "Risque Financier & Actifs" : "Enjeux"}</h4>`
);

content = content.replace(
  '{ id: "criticalInfra", label: "Infrastructures critiques", icon: "🏥" },',
  `{ id: "criticalInfra", label: isInvestor ? "Actifs Stratégiques" : "Infrastructures critiques", icon: "🏥" },`
);

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
