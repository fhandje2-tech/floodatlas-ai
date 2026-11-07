import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const leafletMock = `
      {provider === "leaflet" && (
        <div className="absolute inset-0 z-0 bg-[#e5e5e5] flex items-center justify-center">
          <div className="text-center">
            <MapIcon className="w-12 h-12 text-brand-blue mx-auto mb-4 opacity-50" />
            <p className="text-text-2 font-medium">Leaflet Map Provider Active</p>
            <p className="text-text-3 text-sm">OSM Standard Tiles</p>
          </div>
        </div>
      )}
      {provider === "mapbox" && (
        <div className="absolute inset-0 z-0 bg-[#1a1c23] flex items-center justify-center">
          <div className="text-center">
            <MapIcon className="w-12 h-12 text-brand-teal mx-auto mb-4 opacity-50" />
            <p className="text-text-2 font-medium">Mapbox GL Provider Active</p>
            <p className="text-text-3 text-sm">Vector Terrain Tiles</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className={\`absolute inset-0 z-0 \${provider === 'maplibre' ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`} style={{ background: '#090c14' }} />
`;

content = content.replace(
  '<div ref={mapContainer} className="absolute inset-0 z-0" style={{ background: \'#090c14\' }} />',
  leafletMock
);
fs.writeFileSync('src/screens/SmartMapping.tsx', content);
