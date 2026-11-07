const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronRight, Download, MapPin, Maximize, RotateCcw, Search, Sparkles, X, ZoomIn } from "lucide-react";
import { Button } from "../components/ui/Button";
import { agentBus } from "../services/agentBus";
import { useAgentStore } from "../stores/agentStore";
import Map, { NavigationControl, Source, Layer, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export function SmartMapping() {
  const navigate = useNavigate();
  const { activeZone } = useAgentStore();
  const [layersOpen, setLayersOpen] = useState(true);
  const [layers, setLayers] = useState({
    flood10: true,
    flood100: false,
    floodExtreme: false,
    criticalInfra: true,
    vulnerable: false,
    evacuation: false,
    heatmap: false
  });
  const [activeFeature, setActiveFeature] = useState<any>(null);
  
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 14,
    pitch: 60,
    bearing: -20
  });

  const mapRef = useRef(null);

  useEffect(() => {
    if (activeZone) {
      const cleanZone = activeZone.replace(', Custom Zone', '');
      fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(cleanZone)}&limit=1\`, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9' }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setViewState(prev => ({
            ...prev,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
          }));
        }
      })
      .catch(console.warn);
    }
  }, [activeZone]);

  const analyseFeature = () => {
    agentBus.emit('feature:selected', { featureId: 'f1', coordinates: [viewState.latitude, viewState.longitude], type: 'Hospital' });
    navigate('/analysis');
  };

  const handleFeatureClick = (f: any) => {
    setActiveFeature({
      id: "f1",
      name: f.name,
      type: f.type,
      score: 82,
      dist: f.dist
    });
  };

  // GeoJSON for Flood Zones (simulated near center)
  const flood10Data = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[viewState.longitude - 0.005, viewState.latitude + 0.005], [viewState.longitude + 0.005, viewState.latitude + 0.002], [viewState.longitude + 0.002, viewState.latitude - 0.005], [viewState.longitude - 0.003, viewState.latitude - 0.002], [viewState.longitude - 0.005, viewState.latitude + 0.005]]]
      }
    }]
  };

  const flood100Data = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[viewState.longitude - 0.008, viewState.latitude + 0.008], [viewState.longitude + 0.008, viewState.latitude + 0.005], [viewState.longitude + 0.005, viewState.latitude - 0.008], [viewState.longitude - 0.006, viewState.latitude - 0.005], [viewState.longitude - 0.008, viewState.latitude + 0.008]]]
      }
    }]
  };

  const floodExtremeData = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[viewState.longitude - 0.012, viewState.latitude + 0.012], [viewState.longitude + 0.012, viewState.latitude + 0.008], [viewState.longitude + 0.008, viewState.latitude - 0.012], [viewState.longitude - 0.009, viewState.latitude - 0.008], [viewState.longitude - 0.012, viewState.latitude + 0.012]]]
      }
    }]
  };

  const evacuationRoutesData = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [viewState.longitude, viewState.latitude],
          [viewState.longitude + 0.005, viewState.latitude + 0.005],
          [viewState.longitude + 0.01, viewState.latitude + 0.002]
        ]
      }
    }]
  };

  return (
    <div className="relative w-full h-full bg-void">
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          <NavigationControl position="bottom-right" />
          
          {/* 3D Buildings Layer */}
          <Layer
            id="3d-buildings"
            source="carto"
            source-layer="building"
            type="fill-extrusion"
            paint={{
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ['get', 'render_height'],
              'fill-extrusion-base': ['get', 'render_min_height'],
              'fill-extrusion-opacity': 0.6
            }}
          />

          {layers.flood10 && (
            <Source id="flood10" type="geojson" data={flood10Data as any}>
              <Layer id="flood10-fill" type="fill" paint={{ 'fill-color': '#00B8D9', 'fill-opacity': 0.4 }} />
              <Layer id="flood10-line" type="line" paint={{ 'line-color': '#00B8D9', 'line-width': 2 }} />
            </Source>
          )}

          {layers.flood100 && (
            <Source id="flood100" type="geojson" data={flood100Data as any}>
              <Layer id="flood100-fill" type="fill" paint={{ 'fill-color': '#0070BA', 'fill-opacity': 0.3 }} />
              <Layer id="flood100-line" type="line" paint={{ 'line-color': '#0070BA', 'line-width': 2 }} />
            </Source>
          )}

          {layers.floodExtreme && (
            <Source id="floodExtreme" type="geojson" data={floodExtremeData as any}>
              <Layer id="floodExtreme-fill" type="fill" paint={{ 'fill-color': '#003366', 'fill-opacity': 0.2 }} />
              <Layer id="floodExtreme-line" type="line" paint={{ 'line-color': '#003366', 'line-width': 2 }} />
            </Source>
          )}

          {layers.evacuation && (
            <Source id="evac" type="geojson" data={evacuationRoutesData as any}>
              <Layer id="evac-line" type="line" paint={{ 'line-color': '#22C55E', 'line-width': 4, 'line-dasharray': [2, 2] }} />
            </Source>
          )}

          {layers.heatmap && (
            <Source id="heatmapData" type="geojson" data={flood100Data as any}>
              <Layer 
                id="heatmap-layer" 
                type="heatmap" 
                paint={{
                  'heatmap-weight': 1,
                  'heatmap-intensity': 1,
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)',
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                  ],
                  'heatmap-radius': 50
                }} 
              />
            </Source>
          )}

          {layers.criticalInfra && (
            <Marker longitude={viewState.longitude + 0.001} latitude={viewState.latitude - 0.001} onClick={() => handleFeatureClick({name: "Hospital Center", type: "Hospital", dist: "15m"})}>
              <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transform hover:scale-110 transition-transform">
                🏥
              </div>
            </Marker>
          )}

          {layers.vulnerable && (
            <Marker longitude={viewState.longitude - 0.002} latitude={viewState.latitude + 0.003} onClick={() => handleFeatureClick({name: "Residential Block B", type: "Housing", dist: "5m"})}>
              <div className="w-6 h-6 bg-brand-amber rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transform hover:scale-110 transition-transform text-xs">
                🏢
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Floating Left Toolbar */}
      <div className="absolute left-6 top-6 w-11 bg-surface rounded-md shadow-card border border-border flex flex-col items-center py-2 space-y-4 z-10">
        <button className="text-text-2 hover:text-text-1" title="Zoom to zone"><ZoomIn className="w-5 h-5" /></button>
        <button className="text-text-2 hover:text-text-1" title="Measure distance"><MapPin className="w-5 h-5" /></button>
        <button className="text-text-2 hover:text-text-1" title="Draw polygon"><Search className="w-5 h-5" /></button>
        <div className="w-6 h-px bg-border" />
        <button 
          className="text-text-2 hover:text-text-1" 
          title="3D Perspective"
          onClick={() => setViewState(prev => ({...prev, pitch: prev.pitch === 0 ? 60 : 0}))}
        >
          <Maximize className="w-5 h-5" />
        </button>
        <button className="text-text-2 hover:text-text-1" title="Reset view"><RotateCcw className="w-5 h-5" /></button>
      </div>

      {/* Layers Panel Toggle Button */}
      {!layersOpen && (
        <button 
          onClick={() => setLayersOpen(true)}
          className="absolute right-0 top-6 bg-surface border border-border border-r-0 rounded-l-md px-3 py-2 flex items-center shadow-elevated z-10"
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          <span className="text-[13px] font-medium">Layers</span>
        </button>
      )}

      {/* Layer Panel */}
      <div className={\`absolute right-0 top-0 bottom-0 w-[280px] bg-surface shadow-elevated transition-transform duration-300 border-l border-border flex flex-col z-20 \${layersOpen ? "translate-x-0" : "translate-x-full"}\`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <h2 className="font-semibold text-[15px]">Map Layers</h2>
          <button onClick={() => setLayersOpen(false)} className="text-text-3 hover:text-text-1">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-md p-3 mb-2">
            <h3 className="text-[12px] font-bold text-brand-blue flex items-center mb-1">
              <Sparkles className="w-3 h-3 mr-1" /> Smart Options
            </h3>
            <p className="text-[11px] text-text-2 mb-2">Use AI to automatically highlight the most critical areas in your active zones.</p>
            <button 
              className="w-full px-2 py-1.5 bg-brand-blue text-white text-[11px] font-medium rounded hover:bg-brand-blue-dim transition-colors"
              onClick={() => {
                setLayers({ flood10: false, flood100: true, floodExtreme: false, criticalInfra: true, vulnerable: true, evacuation: true, heatmap: true });
                setViewState(prev => ({...prev, pitch: 60, zoom: 15.5}));
              }}
            >
              Auto-select critical layers
            </button>
          </div>

          <div className="space-y-4">
            {[
              { id: "flood10", label: "Flood Zones — 10-year", icon: "🌊" },
              { id: "flood100", label: "Flood Zones — 100-year", icon: "🌊" },
              { id: "floodExtreme", label: "Extreme flood (1000Y+)", icon: "🌊" },
              { id: "criticalInfra", label: "Critical infrastructure", icon: "🏥" },
              { id: "vulnerable", label: "Vulnerable buildings", icon: "🏢" },
              { id: "evacuation", label: "Evacuation routes", icon: "🚗" },
              { id: "heatmap", label: "Vulnerability heatmap", icon: "🌡" }
            ].map((layer) => (
              <label 
                key={layer.id} 
                className="flex items-center justify-between cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setLayers(prev => ({ ...prev, [layer.id]: !prev[layer.id as keyof typeof layers] }));
                }}
              >
                <span className="text-[13px] flex items-center"><span className="mr-2 text-base">{layer.icon}</span>{layer.label}</span>
                <div className={\`w-8 h-4 rounded-full relative transition-colors \${layers[layer.id as keyof typeof layers] ? "bg-brand-blue" : "bg-elevated border border-border"}\`}>
                  <div className={\`absolute top-[1px] w-[14px] h-[14px] bg-white rounded-full transition-transform \${layers[layer.id as keyof typeof layers] ? "left-[17px]" : "left-[1px]"}\`} />
                </div>
              </label>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border space-y-2">
            <span className="text-[12px] text-text-2">Global opacity</span>
            <input type="range" className="w-full" min="0" max="100" defaultValue="100" />
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" fullWidth className="space-x-2" onClick={() => alert("Visible layers exported successfully as GeoJSON.")}>
            <Download className="w-4 h-4" />
            <span>Export visible layers</span>
          </Button>
        </div>
      </div>

      {/* Feature Popup */}
      {activeFeature && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[240px] bg-elevated shadow-elevated rounded-lg border border-border-lit p-4 z-30">
          <button onClick={() => setActiveFeature(null)} className="absolute top-3 right-3 text-text-3 hover:text-text-1">
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="font-semibold text-[15px] mb-1 pr-6">{activeFeature.name}</h3>
          <span className="inline-block px-2 py-0.5 bg-brand-red-dim/20 text-brand-red border border-brand-red/30 rounded text-[10px] mb-4">
            {activeFeature.type}
          </span>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full border-4 border-brand-red flex items-center justify-center">
              <span className="font-data font-bold text-[18px]">{activeFeature.score}</span>
            </div>
            <div>
              <p className="text-[11px] text-text-3 uppercase font-semibold">Dist. to flood zone</p>
              <p className="font-data text-[13px]">{activeFeature.dist}</p>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button onClick={analyseFeature} size="sm" className="flex-1">Analyse</Button>
            <Button variant="secondary" size="sm" className="flex-1">Add to report</Button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 w-[200px] bg-surface/90 backdrop-blur rounded-md border border-border p-3 shadow-card z-10 pointer-events-none">
        <h4 className="text-[11px] font-semibold text-text-2 uppercase mb-2">Legend</h4>
        <div className="space-y-1.5">
          {layers.flood10 && <div className="flex items-center text-[11px]"><div className="w-3 h-3 bg-[#00B8D9] opacity-40 mr-2 border border-[#00B8D9]" /> 10-year flood</div>}
          {layers.flood100 && <div className="flex items-center text-[11px]"><div className="w-3 h-3 bg-[#0070BA] opacity-30 mr-2 border border-[#0070BA]" /> 100-year flood</div>}
          {layers.floodExtreme && <div className="flex items-center text-[11px]"><div className="w-3 h-3 bg-[#003366] opacity-20 mr-2 border border-[#003366]" /> Extreme flood (1000Y+)</div>}
          {layers.criticalInfra && <div className="flex items-center text-[11px]"><div className="w-3 h-3 rounded-full bg-brand-red mr-2" /> Critical Infra</div>}
          {layers.vulnerable && <div className="flex items-center text-[11px]"><div className="w-3 h-3 rounded-full bg-brand-amber mr-2" /> Vulnerable Building</div>}
          {layers.evacuation && <div className="flex items-center text-[11px]"><div className="w-3 h-0.5 bg-green-500 mr-2" /> Evacuation Route</div>}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/screens/SmartMapping.tsx', code);
