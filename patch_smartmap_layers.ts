import fs from 'fs';
let content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const hookToInsert = `
  React.useEffect(() => {
    if (!map.current) return;
    const updateLayers = () => {
      const mapObj = map.current;
      if (!mapObj || !mapObj.isStyleLoaded()) return;

      // Clean up
      ['diag-heat', 'scen-circles'].forEach(l => {
        if (mapObj.getLayer(l)) mapObj.removeLayer(l);
      });
      ['diag-src', 'scen-src'].forEach(s => {
        if (mapObj.getSource(s)) mapObj.removeSource(s);
      });

      const center = mapObj.getCenter();
      if (!center) return;

      const generatePoints = (count: number, radius: number, isGood: boolean) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta) * 0.7;
          features.push({
            type: 'Feature',
            properties: { value: Math.random() * 100, type: isGood ? 'sponge' : 'risk' },
            geometry: { type: 'Point', coordinates: [lng, lat] }
          });
        }
        return { type: 'FeatureCollection', features };
      };

      if (showAnalysisPanel) {
        mapObj.addSource('diag-src', { type: 'geojson', data: generatePoints(300, 0.05, false) as any });
        mapObj.addLayer({
          id: 'diag-heat',
          type: 'heatmap',
          source: 'diag-src',
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'value'], 0, 0, 100, 1],
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.2, 'rgba(33,102,172, 0.5)',
              0.4, 'rgba(103,169,207, 0.7)',
              0.6, 'rgba(253,219,199, 0.8)',
              0.8, 'rgba(239,138,98, 0.9)',
              1, 'rgba(255,50,50, 1)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 15, 15, 40],
            'heatmap-opacity': 0.8
          }
        });
      }

      if (showScenarioPanel) {
        mapObj.addSource('scen-src', { type: 'geojson', data: generatePoints(150, 0.04, true) as any });
        mapObj.addLayer({
          id: 'scen-circles',
          type: 'circle',
          source: 'scen-src',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 12],
            'circle-color': '#14b8a6',
            'circle-opacity': 0.7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      }
    };

    if (map.current.isStyleLoaded()) {
      updateLayers();
    } else {
      map.current.once('styledata', updateLayers);
    }
  }, [showAnalysisPanel, showScenarioPanel]);
`;

// Insert the hook right before `return (`
content = content.replace('  return (', hookToInsert + '\n  return (');

fs.writeFileSync('src/screens/SmartMapping.tsx', content);
