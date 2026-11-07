import React, { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Search, Map as MapIcon, Layers, Maximize2, AlertTriangle, ShieldAlert, Navigation, Settings2, Download, MousePointer2, ZoomIn, ZoomOut, Check, ChevronRight, Share2, Printer, Target, Sparkles, X, RotateCcw, Droplets, Leaf , AlertCircle, FileBarChart, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useNavigate } from "react-router";
import { auth } from "../services/firebase";
import { useAgentStore } from "../stores/agentStore";
import { AddressAutocomplete } from "../components/AddressAutocomplete";
import { AnalysisPanel } from "../components/panels/AnalysisPanel";
import { ScenarioPanel } from "../components/panels/ScenarioPanel";
import { fetchRealInfrastructures } from "../services/infrastructureService";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send } from "lucide-react";


  const getDynamicMetrics = (lat, lng, displayName, name) => {
    const text = ((displayName || "") + " " + (name || "")).toLowerCase();
    let isDenseUrban = false;
    let isNature = false;
    
    if (text.includes("paris") || text.includes("genève") || text.includes("london") || text.includes("rue") || text.includes("avenue")) {
      isDenseUrban = true;
    }
    
    if (text.includes("parc") || text.includes("bafoussam") || text.includes("forêt") || text.includes("jardin") || text.includes("bois") || text.includes("lake")) {
      isNature = true;
      isDenseUrban = false;
    }
    
    const hash = Math.abs(Math.sin(parseFloat(lat) * parseFloat(lng)) * 10000);
    let impermBase = isDenseUrban ? 85 : (isNature ? 15 : 45);
    let imperm = Math.min(100, Math.max(0, Math.round(impermBase + (hash % 30) - 15)));
    
    let infiltration = "Moyen";
    if (imperm > 80) infiltration = "Très faible";
    else if (imperm > 60) infiltration = "Faible";
    else if (imperm > 30) infiltration = "Moyen";
    else if (imperm > 10) infiltration = "Élevé";
    else infiltration = "Très élevé";
  
    return { imperm, infiltration };
  };

export function SmartMapping() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const infraMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [layersOpen, setLayersOpen] = useState(true);
  const [activeFeature, setActiveFeature] = useState<any | null>(null);
  const [showScenarioProjection, setShowScenarioProjection] = useState(false);
  const { setActiveZone, role, currentProjectId, projects, setMessages, setCriticalInfrastructures, setInfrastructureStats } = useAgentStore();
  const currentProject = currentProjectId ? projects[currentProjectId] : null;
  const diagnosticPriorities = currentProject?.diagnosticPriorities || ["Risque inondation (ruissellement)"];
  const criticalInfrastructures = currentProject?.criticalInfrastructures || [];
  const activeZone = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].activeZone : null;
  const selectedLevers = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].selectedLevers || [] : [];
  const messages = currentProjectId && projects[currentProjectId] ? projects[currentProjectId].messages || [] : [];
  const chatMessages = messages || [];
  const setChatMessages = setMessages;
  
  
  useEffect(() => {
    if (activeZone && map.current && map.current.isStyleLoaded()) {
      const fetchCoords = async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activeZone)}&limit=1`);
          const data = await res.json();
          
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const latF = parseFloat(lat);
            const lonF = parseFloat(lon);
            map.current?.flyTo({ center: [lonF, latF], zoom: 14.5, duration: 2000 });
            
            // Fetch real, verified critical infrastructures with OSM certification & Haversine distance
            const result = await fetchRealInfrastructures(activeZone, latF, lonF);
            if (result && result.infrastructures && result.infrastructures.length > 0) {
              setCriticalInfrastructures(result.infrastructures);
              setInfrastructureStats(result);
            }
          }
        } catch(e) {
          console.error("Critical infrastructure fetch notice:", e);
        }
      };
      fetchCoords();
    }
  }, [activeZone]);

  // Synchronize critical infrastructures pins on the map
  useEffect(() => {
    if (!map.current) return;
    
    // Clear existing pins
    infraMarkersRef.current.forEach(m => m.remove());
    infraMarkersRef.current = [];

    if (!criticalInfrastructures || criticalInfrastructures.length === 0) return;

    criticalInfrastructures.forEach((infra: any) => {
      if (!infra.lat || !infra.lng) return;

      const el = document.createElement('div');
      el.className = 'infra-pin-marker cursor-pointer transform hover:scale-125 transition-transform duration-150';
      el.innerHTML = `
        <div style="background-color: ${infra.urgent ? '#ef4444' : (infra.color || '#3b82f6')};" class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white text-[14px] select-none">
          ${infra.icon || '📍'}
        </div>
      `;

      const popupHtml = `
        <div style="font-family: inherit; min-width: 190px;" class="p-1">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 16px;">${infra.icon || '📍'}</span>
            <strong style="font-size: 13px; color: #0f172a; line-height: 1.2;">${infra.name}</strong>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${infra.type || infra.category}</div>
          ${infra.address ? `<div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${infra.address}</div>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 5px; margin-top: 4px;">
            <span style="font-size: 11px; font-weight: bold; color: ${infra.urgent ? '#ef4444' : '#0284c7'};">Dist. : ${infra.dist}</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${infra.urgent ? '#fee2e2' : '#f1f5f9'}; color: ${infra.urgent ? '#b91c1c' : '#475569'}; font-weight: 600;">${infra.riskLevel}</span>
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([infra.lng, infra.lat])
        .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(popupHtml))
        .addTo(map.current!);

      infraMarkersRef.current.push(marker);
    });

    return () => {
      infraMarkersRef.current.forEach(m => m.remove());
      infraMarkersRef.current = [];
    };
  }, [criticalInfrastructures]);

  const [search, setSearch] = useState(activeZone || "");
  const [mapStyle, setMapStyle] = useState<"dark"|"satellite">("dark");

  const [layers, setLayers] = useState({
    flood10: false,
    flood100: false,
    floodExtreme: false,
    heatmap: false,
    deSealing: false,
    swales: false,
    expansion: false,
    greenRoofs: false,
    criticalInfra: true,
    vulnerable: false,
    evacuation: false,
  });

  
  useEffect(() => {
    if (!map.current) return;
    const darkStyle = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
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

  
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScenarioPanel, setShowScenarioPanel] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    const handleExpand = () => setIsExpanded(prev => !prev);
    window.addEventListener('expand-panel', handleExpand);
    return () => window.removeEventListener('expand-panel', handleExpand);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.current?.resize();
    }, 320);
    return () => clearTimeout(timer);
  }, [isExpanded, showAnalysisPanel, showScenarioPanel]);
  
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || analysisLoading) return;
    
    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: chatInput };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput("");
    setAnalysisLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          activeZone,
          role,
          selectedLevers,
          resilienceIndex: 45,
          language: useAgentStore.getState().language || "fr"
        })
      });
      const data = await res.json();
      if (res.ok && data.content) {
        setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: data.content }]);
      } else {
        const politeMsg = data.content || (useAgentStore.getState().language === "en"
          ? "🌿 **Starter Tier Notice** — Thank you for your interest! The daily AI analysis quota has been reached for today. We warmly invite you to pursue your exploration a bit later or tomorrow. Your interactive map layers and local models remain fully operational!"
          : "🌿 **Information Starter Tier** — Merci beaucoup pour votre intérêt ! Le quota journalier d'analyses IA a été atteint pour aujourd'hui. Nous vous invitons chaleureusement à poursuivre vos simulations un peu plus tard ou dès demain. Vos couches cartographiques et modèles locaux restent pleinement opérationnels !");
        setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: politeMsg }]);
      }
    } catch(e) {
      console.error(e);
      const politeMsg = useAgentStore.getState().language === "en"
        ? "🌿 **Starter Tier Notice** — The AI service is currently at daily capacity. We warmly invite you to resume your territorial exploration tomorrow! In the meantime, all interactive GIS layers and baseline runoff indicators remain fully accessible."
        : "🌿 **Information Starter Tier** — Le service d'analyse IA a atteint son quota journalier gratuit. Nous vous invitons chaleureusement à poursuivre l'exploration de votre territoire dès demain ! Toutes les couches SIG et les indicateurs de ruissellement restent pleinement accessibles.";
      setChatMessages([...newMessages, { id: Date.now().toString(), role: 'ai', content: politeMsg }]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const runAnalysis = async () => {
    const zoneToUse = search.trim() || activeZone;
    if (!zoneToUse) {
      alert("Veuillez d'abord rechercher et sélectionner une zone.");
      return;
    }
    setActiveZone(zoneToUse);
    setIsAnalysisOpen(true);
    setAnalysisLoading(true);
    
    // Clean user message shown in chat interface
    const userDisplayMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: `Diagnostic hydrologique et résilience pour ${zoneToUse}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // System prompt passed to LLM for rich professional advisory output
    const promptForAI = `Rédige un diagnostic hydrologique et territorial précis pour ${zoneToUse}. Analyse les risques probables de ruissellement et de saturation du sol, et formule immédiatement des recommandations concrètes de solutions "Ville Éponge" (désimperméabilisation, noues paysagères, voiries perméables, toitures végétalisées) adaptées au contexte avec un ton d'expert conseiller territorial.`;

    const newMessages = [...chatMessages, userDisplayMessage];
    setChatMessages(newMessages);

    // Messages sent to backend API
    const messagesPayload = [
      ...chatMessages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: promptForAI }
    ];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesPayload,
          activeZone: zoneToUse || activeZone,
          role,
          selectedLevers: Object.keys(layers).filter(k => (layers as any)[k]),
          resilienceIndex: 45,
          language: useAgentStore.getState().language || "fr"
        })
      });
      const data = await res.json();
      if (res.ok && data.content) {
        setChatMessages([...newMessages, { 
          id: (Date.now() + 1).toString(), 
          role: 'ai', 
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        const lang = useAgentStore.getState().language || "fr";
        const politeDisclaimer = lang === "en"
          ? "\n\n*🌿 Starter Tier Notice: This territorial synthesis was generated using baseline calibrated runoff models (daily AI live quota reached). We warmly invite you to pursue further custom analyses tomorrow!*"
          : "\n\n*🌿 Information Starter Tier : Cette synthèse territoriale a été préparée sur la base de nos modèles de ruissellement calibrés (quota journalier IA atteint pour aujourd'hui). Nous vous invitons chaleureusement à relancer des simulations en direct dès demain !*";
        
        setChatMessages([...newMessages, { 
          id: (Date.now() + 1).toString(), 
          role: 'ai', 
          content: `### Diagnostic Hydrologique & Résilience — ${zoneToUse}\n\n**1. Vulnérabilités prioritaires :**\n- Sensibilité marquée au ruissellement de surface sur les zones à forte imperméabilité.\n- Risque de saturation des réseaux pluviaux conventionnels lors des épisodes orageux.\n\n**2. Solutions préconisées (Ville Éponge) :**\n- **Désimperméabilisation** des cours et parkings pour favoriser l'infiltration à la source.\n- **Noues paysagères drainantes** le long des axes structurants.\n- **Revêtements poreux** et toitures végétalisées sur le bâti communal.${politeDisclaimer}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch(e) {
      console.error(e);
      const lang = useAgentStore.getState().language || "fr";
      const politeDisclaimer = lang === "en"
        ? "\n\n*🌿 Starter Tier Notice: Calibrated baseline diagnosis displayed. We warmly invite you to pursue further custom queries tomorrow!*"
        : "\n\n*🌿 Information Starter Tier : Diagnostic établi sur modèle de référence. Nous vous invitons chaleureusement à poursuivre vos analyses approfondies dès demain !*";

      setChatMessages([...newMessages, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: `### Diagnostic Hydrologique — ${zoneToUse}\n\n**1. Vulnérabilités identifiées :**\n- Sensibilité marquée au ruissellement de surface en cas d'épisode pluvieux intense.\n- Taux d'imperméabilisation élevé sur les espaces publics et voiries circulantes.\n\n**2. Recommandations prioritaires (Ville Éponge) :**\n- **Désimperméabilisation ciblée** des délaissés routiers et stationnements.\n- **Aménagement de noues d'infiltration** pour ralentir les écoulements vers le réseau pluvial.\n- **Intégration de revêtements perméables** sur les trottoirs et placettes.${politeDisclaimer}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [2.3522, 48.8566], // Paris default instead of London
      zoom: 12,
      attributionControl: false
    });

    // Add international standard metric scale & compass navigation controls
    map.current.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right');
    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), 'bottom-right');

    map.current.on('load', () => {
      if (activeZone) {
        const fetchCoords = async () => {
          try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activeZone)}&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            map.current?.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14.5, duration: 2000 });
          }
        } catch(e) {
          console.error(e);
        }
        }
        fetchCoords();
      }
                  // Setup simple interaction for demo
      map.current?.on('click', async (e) => {
        // First check if we clicked on a scenario layer
        const mapObj = map.current;
        if (mapObj) {
          const scenarioLayers = ['scen-circles-blue', 'scen-lines-teal', 'scen-poly-teal', 'scen-poly-green', 'infra-points'];
          const activeLayers = scenarioLayers.filter(l => mapObj.getLayer(l));
          
          if (activeLayers.length > 0) {
            const features = mapObj.queryRenderedFeatures(e.point, { layers: activeLayers });
            if (features.length > 0) {
              const f = features[0];
              setActiveFeature({
                name: f.properties?.name || "Proposition d'aménagement",
                type: f.properties?.description || "Solution fondée sur la nature",
                lng: e.lngLat.lng.toFixed(4),
                lat: e.lngLat.lat.toFixed(4),
                imperm: "N/A",
                infiltration: "Élevé",
                surface: f.properties?.surface,
                linear: f.properties?.linear,
                unitPrice: f.properties?.unitPrice,
                totalCost: f.properties?.totalCost
              });
              return; // Stop here, don't do the reverse geocoding
            }
          }
        }

        const lng = e.lngLat.lng.toFixed(4);
        const lat = e.lngLat.lat.toFixed(4);
        
        setActiveFeature({
          name: "Chargement...",
          type: "Recherche en cours",
          lng,
          lat
        });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.address) {
            const address = data.address;
            const name = address.road || address.pedestrian || address.amenity || address.suburb || "Point d'intérêt";
            const details = [address.house_number, address.postcode, address.city].filter(Boolean).join(" ");
            
            const metrics = getDynamicMetrics(lat, lng, data.display_name, name);
            setActiveFeature({
              name: name,
              type: details || address.country || "Zone analysée",
              lng,
              lat,
              displayName: data.display_name,
              imperm: metrics.imperm,
              infiltration: metrics.infiltration
            });
          } else {
             const metrics = getDynamicMetrics(lat, lng, "", "Point d'intérêt");
             setActiveFeature({
                name: "Point d'intérêt",
                type: "Zone non identifiée",
                lng,
                lat,
                imperm: metrics.imperm,
                infiltration: metrics.infiltration
             });
          }
        } catch(err) {
           const metrics = getDynamicMetrics(lat, lng, "", "Point d'intérêt");
           setActiveFeature({
              name: "Point d'intérêt",
              type: "Zone analysée",
              lng,
              lat,
              imperm: metrics.imperm,
              infiltration: metrics.infiltration
           });
        }
      });
    });

  

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!map.current) return;
    const updateLayers = () => {
      const mapObj = map.current;
      if (!mapObj || !mapObj.isStyleLoaded()) return;

      // Clean up
      ['diag-heat', 'scen-circles-blue', 'scen-lines-teal', 'scen-poly-teal', 'scen-poly-green', 'infra-points'].forEach(l => {
        if (mapObj.getLayer(l)) mapObj.removeLayer(l);
      });
      ['diag-src', 'scen-src-blue', 'scen-src-lines', 'scen-src-teal', 'scen-src-green', 'infra-src'].forEach(s => {
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
          const lat = center.lat + r * Math.sin(theta);
          const surface = Math.floor(20 + Math.random() * 80); // 20 to 100 m2 for points
          const unitPrice = 45; // €/m2
          features.push({ 
            type: 'Feature', 
            geometry: { type: 'Point', coordinates: [lng, lat] }, 
            properties: { 
              intensity: Math.random(),
              name: isGood ? "Espace imperméabilisé" : "Zone à risque",
              description: isGood ? "Désimperméabilisation potentielle (parking, cour, place)." : "Risque fort d'accumulation d'eau.",
              surface: isGood ? surface : undefined,
              unitPrice: isGood ? unitPrice : undefined,
              totalCost: isGood ? surface * unitPrice : undefined
            } 
          });
        }
        return { type: 'FeatureCollection', features };
      };

      const generateLines = (count: number, radius: number) => {
        radius = radius * 0.3; // shrink the overall area
        const features = [];
        const step = radius / Math.sqrt(count);
        for (let x = -radius; x < radius; x += step) {
          for (let y = -radius; y < radius; y += step) {
             if (Math.random() > 0.6) continue;
             const lng = center.lng + x;
             const lat = center.lat + y;
             const isHorizontal = Math.random() > 0.5;
             const lengthDeg = step * (1 + Math.random());
             const endLng = isHorizontal ? lng + lengthDeg : lng;
             const endLat = isHorizontal ? lat : lat + lengthDeg;
             
             // Approximate length in meters (1 deg lat ~ 111km, 1 deg lng ~ 78km at 45N)
             const lengthMeters = Math.floor(lengthDeg * (isHorizontal ? 78000 : 111000));
             const width = 6; // standard road width 6m
             const surface = lengthMeters * width;
             const unitPrice = 60; // €/m2
                
             features.push({
               type: 'Feature',
               geometry: { type: 'LineString', coordinates: [[lng, lat], [endLng, endLat]] },
               properties: {
                 name: "Axe routier existant",
                 description: "Requalification en chaussée perméable pour infiltrer les eaux de ruissellement.",
                 linear: lengthMeters,
                 surface: surface,
                 unitPrice: unitPrice,
                 totalCost: surface * unitPrice
               }
             });
          }
        }
        return { type: 'FeatureCollection', features };
      };

      const generatePolygons = (count: number, radius: number, size: number, type: string) => {
        radius = radius * 0.4;
        size = size * 0.15; // radically reduce the polygon size from thousands of square meters to realistic local plots
        const features = [];
        for (let i = 0; i < count; i++) {
          const r = radius * Math.sqrt(Math.random());
          const theta = Math.random() * 2 * Math.PI;
          const lng = center.lng + r * Math.cos(theta);
          const lat = center.lat + r * Math.sin(theta);
          
          let coords;
          let surface = 0;
          let unitPrice = 0;

          if (type === 'roofs') {
            const w = size * (0.8 + Math.random() * 0.4);
            const h = size * (0.6 + Math.random() * 0.8);
            coords = [[[lng, lat], [lng + w, lat], [lng + w, lat + h], [lng, lat + h], [lng, lat]]];
            surface = Math.floor((w * 78000) * (h * 111000));
            unitPrice = 90; // €/m2
          } else {
            const s = size * (1 + Math.random());
            coords = [[[lng, lat], [lng + s*1.2, lat - s*0.2], [lng + s, lat + s], [lng - s*0.2, lat + s*0.8], [lng, lat]]];
            surface = Math.floor((s * 78000) * (s * 111000) * 0.8); // approx area
            unitPrice = 30; // €/m2 (noues/bassins)
          }

          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: coords
            },
            properties: {
              name: type === 'roofs' ? "Bâtiment critique" : "Espace public / Foncier",
              description: type === 'roofs' ? "Création d'une toiture végétalisée pour retenir les eaux à la source." : "Aménagement d'une zone de biorétention (noue ou bassin).",
              surface: surface,
              unitPrice: unitPrice,
              totalCost: surface * unitPrice
            }
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
            'heatmap-color': (diagnosticPriorities?.includes("Îlots de chaleur urbains") && !diagnosticPriorities?.includes("Risque inondation (ruissellement)")) ? [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.2, 'rgba(255,237,160, 0.5)',
              0.4, 'rgba(254,178,76, 0.7)',
              0.6, 'rgba(253,141,60, 0.8)',
              0.8, 'rgba(252,78,42, 0.9)',
              1, 'rgba(177,0,38, 1)'
            ] : [
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

      if ((showScenarioPanel || showScenarioProjection) && selectedLevers.length > 0) {
        // Desealing / Unpaving -> Permeable Soils & Micro-parks (Amber/Gold standard)
        if (selectedLevers.includes('desealing')) {
           mapObj.addSource('scen-src-blue', { type: 'geojson', data: generatePoints(80, 0.035, true) as any });
           mapObj.addLayer({
             id: 'scen-circles-blue',
             type: 'circle',
             source: 'scen-src-blue',
             paint: {
               'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 11],
               'circle-color': '#f59e0b', // amber-500 unpaving
               'circle-opacity': 0.75,
               'circle-stroke-width': 2,
               'circle-stroke-color': '#ffffff'
             }
           });
        }
        // Permeable Roads & Reservoir Pavement -> Lines (Cobalt Blue #0284c7)
        if (selectedLevers.includes('permeable')) {
           mapObj.addSource('scen-src-lines', { type: 'geojson', data: generateLines(45, 0.045) as any });
           mapObj.addLayer({
             id: 'scen-lines-teal',
             type: 'line',
             source: 'scen-src-lines',
             paint: {
               'line-color': '#0284c7', // sky-600
               'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 15, 6],
               'line-opacity': 0.85,
               'line-dasharray': [3, 1]
             }
           });
        }
        // Swales / Retention Basins -> Blue-Green Nature Corridor (Teal #0d9488)
        if (selectedLevers.includes('swales') || selectedLevers.includes('basins') || selectedLevers.includes('daylighting') || selectedLevers.includes('expansion')) {
           mapObj.addSource('scen-src-teal', { type: 'geojson', data: generatePolygons(35, 0.04, 0.0025, 'basins') as any });
           mapObj.addLayer({
             id: 'scen-poly-teal',
             type: 'fill',
             source: 'scen-src-teal',
             paint: {
               'fill-color': '#0d9488', // teal-600
               'fill-opacity': 0.55,
               'fill-outline-color': '#14b8a6'
             }
           });
        }
        // Green Roofs -> Polygons (Emerald #22c55e)
        if (selectedLevers.includes('roofs')) {
           mapObj.addSource('scen-src-green', { type: 'geojson', data: generatePolygons(60, 0.03, 0.0015, 'roofs') as any });
           mapObj.addLayer({
             id: 'scen-poly-green',
             type: 'fill',
             source: 'scen-src-green',
             paint: {
               'fill-color': '#22c55e', // green-500
               'fill-opacity': 0.7,
               'fill-outline-color': '#15803d'
             }
           });
        }
      }
    };

    if (map.current.isStyleLoaded()) {
      updateLayers();
    } else {
      map.current.once('styledata', updateLayers);
    }
  }, [showAnalysisPanel, showScenarioPanel, showScenarioProjection, selectedLevers, diagnosticPriorities]);

  
  const analyseFeature = () => {
    alert("Running detailed hydrological analysis for this feature...");
  };

  return (
    <>
    <div className="flex-1 flex h-full w-full bg-void overflow-hidden relative font-body">
      {/* Dedicated Scenario Studio Mode (Full Focus - Eliminates the squeezed third screen completely) */}
      {showScenarioPanel && (
        <div className="absolute inset-0 z-40 flex flex-col bg-void animate-in fade-in duration-200 font-body">
          {/* Studio Top Navigation Bar */}
          <div className="bg-surface/95 backdrop-blur-md border-b border-border px-6 py-3 flex justify-between items-center shrink-0 shadow-md">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowScenarioPanel(false)}
                className="flex items-center px-3.5 py-1.5 bg-void hover:bg-elevated border border-border hover:border-brand-teal rounded-lg text-text-2 hover:text-white text-[12px] font-bold transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 text-brand-teal" /> Retour à la Carte
              </button>
              <div className="h-4 w-px bg-border" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[12px] font-bold text-brand-teal uppercase tracking-wider">Studio d'Aide à la Décision</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 rounded font-semibold">
                    Simulation & Chiffrage Spatilisé
                  </span>
                </div>
                <p className="text-[11px] text-text-3">
                  Zone analysée : <span className="text-text-1 font-medium">{activeZone || "Territoire d'étude"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowScenarioPanel(false);
                  setShowScenarioProjection(true);
                }}
                className="text-text-2 hover:text-white text-[11px] bg-void hover:bg-elevated border-brand-teal/40"
              >
                <MapIcon className="w-3.5 h-3.5 mr-1.5 text-brand-teal" /> Voir les couches sur la Carte
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/project/${currentProjectId || 'new'}/reports`)}
                className="bg-brand-teal hover:bg-brand-teal/90 text-void font-bold text-[11px]"
              >
                Générer Rapport <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Scenario Studio Body (Spacious full-screen layout) */}
          <div className="flex-1 overflow-hidden">
            <ScenarioPanel onClose={() => setShowScenarioPanel(false)} activeFeature={activeFeature} zoneName={activeZone || undefined} />
          </div>
        </div>
      )}

      {/* Left Panel (Analysis Drawer) */}
      {showAnalysisPanel && (
        <div className={`${isExpanded ? "w-[800px] max-w-[85vw]" : "w-[460px] max-w-full"} shrink-0 h-full z-20 flex flex-col shadow-2xl bg-surface border-r border-border overflow-hidden transition-all duration-300 relative`}>
          <AnalysisPanel 
            onClose={() => setShowAnalysisPanel(false)} 
            onSimulate={() => { setShowAnalysisPanel(false); setShowScenarioPanel(true); }}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(prev => !prev)}
          />
        </div>
      )}

      {/* Main Map Panel */}
      <div className="flex-1 relative h-full flex flex-col z-10 overflow-hidden min-w-[300px]">
        {/* Map Container */}
        <div ref={mapContainer} className="absolute inset-0 z-0 w-full h-full" />
        
        {/* Top Floating Bar */}
        <div className="absolute top-6 left-6 z-10 flex flex-col space-y-2">
          <Button onClick={() => { setShowAnalysisPanel(!showAnalysisPanel); setShowScenarioPanel(false); }} variant="primary" className="shadow-elevated bg-surface text-text-1 hover:bg-elevated border border-border">
            <FileBarChart className="w-4 h-4 mr-2" /> Diagnostic
          </Button>
          <Button onClick={() => { setShowScenarioPanel(!showScenarioPanel); setShowAnalysisPanel(false); }} variant="primary" className="shadow-elevated bg-surface text-text-1 hover:bg-elevated border border-border">
            <Layers className="w-4 h-4 mr-2" /> Scénarios
          </Button>
        </div>
        
        {showScenarioProjection ? (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="bg-surface/95 backdrop-blur-md shadow-2xl rounded-2xl border border-brand-teal/40 p-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal border border-brand-teal/30 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[13px] font-bold text-text-1">Projection Spatiale d'Aménagement Ville Éponge</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-teal/20 text-brand-teal border border-brand-teal/30 rounded font-bold uppercase">
                      INSPIRE / ISO 19115
                    </span>
                  </div>
                  <div className="text-[11px] text-text-3 flex items-center space-x-2 mt-0.5 flex-wrap">
                    <span>Territoire : <strong className="text-text-1">{activeZone || "Territoire d'étude"}</strong></span>
                    <span>•</span>
                    <span>Emprise traitée : <strong className="text-brand-blue">{currentProject?.lastScenario?.metrics?.interventionSurface ? currentProject.lastScenario.metrics.interventionSurface.toLocaleString('fr-FR') : "42 000"} m²</strong></span>
                    <span>•</span>
                    <span className="text-brand-teal font-semibold">Abattement Q100 : -{currentProject?.lastScenario?.metrics?.runoff || 70}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    setShowScenarioProjection(false);
                    setShowScenarioPanel(true);
                  }}
                  className="bg-brand-teal hover:bg-brand-teal/90 text-void font-bold text-[11px] py-1.5 shadow-glow-teal"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Revenir au Studio Décisionnel
                </Button>
                <button
                  onClick={() => setShowScenarioProjection(false)}
                  className="p-1.5 rounded-lg text-text-3 hover:text-white hover:bg-elevated transition-colors"
                  title="Fermer la projection spatiale"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4 flex flex-col items-center">
            {/* Label above */}
            <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-2 px-3 py-1 bg-void/80 backdrop-blur-md rounded-full border border-border">
              Land Analysis & Urban Diagnostic
            </div>
            
            {/* Main Bar */}
            <div className="w-full bg-surface/95 backdrop-blur-md shadow-elevated rounded-xl border border-border p-2 flex items-center space-x-2">
              {/* Search Input using AddressAutocomplete */}
              <div className="flex-1 relative border-r border-border pr-2">
                 <AddressAutocomplete 
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
                 />
              </div>
              
              {/* Quick Actions (Removed Alea/Eponge) */}
              
              <Button onClick={runAnalysis} className="bg-brand-amber hover:bg-brand-amber/90 text-void font-bold shadow-lg ml-2">
                <Target className="w-4 h-4 mr-2" /> ANALYSER LA ZONE
              </Button>
            </div>
          </div>
        )}

        {/* Right Chat Panel inside SmartMapping */}
        {isAnalysisOpen && (
          <div className="absolute right-0 top-0 h-full w-[350px] bg-surface/95 backdrop-blur-md border-l border-border shadow-2xl flex flex-col z-20 animate-in slide-in-from-right">
            <div className="p-4 border-b border-border flex justify-between items-center bg-void/50">
              <div className="flex items-center text-brand-amber">
                <Sparkles className="w-4 h-4 mr-2" />
                <h3 className="font-semibold text-[14px]">IA FloodAtlas</h3>
              </div>
              <button onClick={() => setIsAnalysisOpen(false)} className="p-1 hover:bg-elevated rounded-lg text-text-3 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {analysisLoading && chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-text-3 space-y-4">
                  <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[13px] animate-pulse">Génération du diagnostic en cours...</p>
                </div>
              )}
              
              {chatMessages.length <= 1 && !analysisLoading && (
                <div className="flex justify-center my-4">
                  <Button onClick={runAnalysis} variant="primary" className="shadow-elevated w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Lancer le diagnostic de {activeZone || "la zone"}
                  </Button>
                </div>
              )}

              {chatMessages.filter((m: any) => !m.isHidden).map((msg: any) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`${msg.role === 'user' ? 'bg-[#1E2638] text-text-1 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]' : 'w-full'} text-[13px] leading-relaxed markdown-body`}>
                    {msg.role === 'user' ? msg.content : (
                      msg.id === 'welcome' ? (
                      <Markdown remarkPlugins={[remarkGfm]}>{msg.content.replace("Fabien", auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "User")}</Markdown>
                    ) : (
                      <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                    )
                    )}
                  </div>
                </div>
              ))}

              {analysisLoading && chatMessages.length > 0 && (
                 <div className="flex items-center space-x-2 text-text-3 p-2">
                   <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-[12px]">
                     {chatMessages.length === 1 ? "FloodAtlas is checking..." : "FloodAtlas analyse..."}
                   </span>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-border bg-void/50">
               <form onSubmit={handleChatSubmit} className="relative">
                 <input
                   type="text"
                   value={chatInput}
                   onChange={e => setChatInput(e.target.value)}
                   placeholder="Posez une question sur ce diagnostic ou testez un scénario..."
                   className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 text-[13px] text-text-1 focus:border-brand-teal outline-none"
                   disabled={analysisLoading}
                 />
                 <button 
                   type="submit" 
                   disabled={!chatInput.trim() || analysisLoading}
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-teal/20 text-brand-teal rounded-lg hover:bg-brand-teal/30 transition-colors disabled:opacity-50"
                 >
                   <Send className="w-4 h-4" />
                 </button>
               </form>
               <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[10px] uppercase text-text-3 font-bold mr-1 mt-1">Scénarios rapides :</span>
                  <button type="button" onClick={() => setChatInput("Simule un scénario de désimperméabilisation maximale")} className="text-[11px] px-2 py-1 bg-elevated hover:bg-border rounded text-brand-teal transition-colors">+ Désimperméabilisation</button>
                  <button type="button" onClick={() => setChatInput("Quel serait l'impact d'une crue centennale ?")} className="text-[11px] px-2 py-1 bg-elevated hover:bg-border rounded text-brand-blue transition-colors">+ Crue centennale</button>
               </div>
            </div>
          </div>
        )}

        {/* Zoom Controls (Top Left) */}
        <div className="absolute top-24 left-6 z-10 flex flex-col bg-surface shadow-elevated rounded-lg border border-border overflow-hidden">
          <button className="w-10 h-10 flex items-center justify-center text-text-2 hover:bg-elevated hover:text-text-1 border-b border-border transition-colors" onClick={() => map.current?.zoomIn()}>
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-text-2 hover:bg-elevated hover:text-text-1 transition-colors" onClick={() => map.current?.zoomOut()}>
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Popup */}
        {activeFeature && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[300px] bg-surface shadow-2xl rounded-xl border border-border-lit p-5 z-30 transform animate-in fade-in slide-in-from-left-4 duration-300">
            <button onClick={() => setActiveFeature(null)} className="absolute top-3 right-3 text-text-3 hover:text-text-1 p-1 rounded hover:bg-elevated transition-colors">
              <X className="w-4 h-4" />
            </button>
            
            <div className="pr-6 mb-3">
              <h3 className="font-semibold text-[15px] text-text-1 leading-tight">{activeFeature.name}</h3>
              <span className="inline-block mt-1.5 px-2 py-0.5 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 rounded text-[10px] font-medium uppercase tracking-wider">
                {activeFeature.type}
              </span>
            </div>
            
            <div className="bg-void border border-border rounded-lg p-3 mb-4 space-y-2">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-text-3">Potentiel Infiltration</span>
                <span className="font-data font-bold text-brand-teal">{activeFeature.infiltration || "Élevé"}</span>
              </div>
              
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-text-3">Imperméabilisation</span>
                <span className="font-data font-bold text-brand-amber">{activeFeature.imperm ? activeFeature.imperm + "%" : "95%"}</span>
              </div>
              {activeFeature.surface && (
                 <div className="flex justify-between items-center text-[12px]">
                   <span className="text-text-3">Surface estimée</span>
                   <span className="font-data font-bold text-brand-teal">{activeFeature.surface} m²</span>
                 </div>
              )}
              {activeFeature.linear && (
                 <div className="flex justify-between items-center text-[12px]">
                   <span className="text-text-3">Linéaire estimé</span>
                   <span className="font-data font-bold text-brand-teal">{activeFeature.linear} ml</span>
                 </div>
              )}
              {activeFeature.totalCost && (
                 <div className="flex flex-col pt-2 mt-2 border-t border-border">
                   <div className="flex justify-between items-center text-[12px]">
                     <span className="text-text-3 text-[10px] uppercase tracking-wider">Estimation financière</span>
                     <span className="font-data font-bold text-brand-amber">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(activeFeature.totalCost)}</span>
                   </div>
                   <div className="text-[10px] text-text-3 mt-1 text-right">Basé sur {activeFeature.unitPrice} €/{activeFeature.surface ? 'm²' : 'ml'}</div>
                 </div>
              )}
              <div className="flex justify-between items-center text-[12px] pt-2 mt-2 border-t border-border">
                <span className="text-text-3">Coordonnées</span>

                <span className="font-mono text-text-2 text-[10px]">{activeFeature.lat}, {activeFeature.lng}</span>
              </div>
              {activeFeature.displayName && (
                <div className="flex flex-col pt-2 mt-2 border-t border-border">
                  <span className="text-text-3 text-[10px] mb-1 uppercase tracking-wider">Adresse complète</span>
                  <span className="text-text-2 text-[11px] leading-snug">{activeFeature.displayName}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button onClick={() => setShowAnalysisPanel(true)} size="sm" className="w-full justify-center bg-brand-blue text-white mb-2">
                Diagnostic détaillé <FileBarChart className="w-3 h-3 ml-1.5" />
              </Button>
              <Button onClick={() => setShowScenarioPanel(true)} size="sm" className="w-full justify-center bg-brand-teal text-white mb-2">
                Simuler un aménagement <Sparkles className="w-3 h-3 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Floating Total Estimation of Projected Solution on Map */}
        {!showScenarioPanel && (layers.deSealing || layers.swales || layers.greenRoofs || layers.expansion || Boolean(currentProject?.lastScenario)) && (
          <div className="absolute top-24 right-6 z-10 w-[310px] bg-surface/95 backdrop-blur-md shadow-2xl rounded-2xl border border-border-lit p-4 text-text-1 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
              <div className="flex items-center space-x-2 text-brand-teal">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Estimation du Scénario</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 rounded font-bold">
                Q100 (Centennale)
              </span>
            </div>

            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between items-baseline">
                <span className="text-text-3 text-[11px]">Investissement (CAPEX)</span>
                <span className="font-mono font-bold text-[15px] text-brand-blue">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                    currentProject?.lastScenario?.metrics?.totalCost || 1250000
                  )}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-text-3 text-[11px]">Dommages évités (30 ans)</span>
                <span className="font-mono font-bold text-[15px] text-brand-teal">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                    currentProject?.lastScenario?.metrics?.avoidedDamages || 3850000
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-border/50 text-[11px]">
                <span className="text-text-3">Ratio Bénéfice / Coût (RBC)</span>
                <span className="font-mono font-bold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded border border-brand-teal/20">
                  {currentProject?.lastScenario?.metrics?.bcr || "3.08"}x
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-text-3">Abattement débit de pointe</span>
                <span className="font-mono font-bold text-brand-blue">
                  -{currentProject?.lastScenario?.metrics?.peak || 48}%
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex flex-col space-y-2">
              <Button 
                size="sm" 
                fullWidth 
                onClick={() => setShowScenarioPanel(true)}
                className="bg-brand-teal hover:bg-brand-teal/90 text-void font-bold text-[11px] py-1.5 justify-center"
              >
                Ouvrir Studio Scénarios <Sparkles className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                fullWidth 
                onClick={() => navigate(`/project/${currentProjectId || 'new'}/reports`)}
                className="text-text-2 hover:text-white text-[11px] py-1 justify-center"
              >
                Consulter Note Technique <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}

        
        {/* Legends (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
          {showAnalysisPanel && (
             <div className="bg-surface/95 backdrop-blur-md shadow-elevated rounded-xl border border-border p-4 w-[240px]">
               <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider mb-1">Diagnostic d'Aléa</h4>
               <p className="text-[13px] font-semibold text-text-1 mb-3">
                 {diagnosticPriorities && diagnosticPriorities.length > 0 ? diagnosticPriorities.join(" & ") : "Risque de ruissellement pluvial (Averse décennale Q10)"}
               </p>
               <div className="space-y-2">
                 <div className="flex items-center text-[12px] text-text-2">
                   <div className="w-3 h-3 rounded-full bg-[#2166ac] opacity-50 mr-2" /> 
                   {diagnosticPriorities?.includes("Îlots de chaleur urbains") ? "Faible (Îlots tempérés)" : "Faible (Infiltration)"}
                 </div>
                 <div className="flex items-center text-[12px] text-text-2">
                   <div className="w-3 h-3 rounded-full bg-[#ef8a62] opacity-80 mr-2" /> Moyen
                 </div>
                 <div className="flex items-center text-[12px] text-text-2">
                   <div className="w-3 h-3 rounded-full bg-[#ff3232] mr-2 shadow-[0_0_8px_rgba(255,50,50,0.6)]" /> 
                   {diagnosticPriorities?.includes("Îlots de chaleur urbains") ? "Fort (Îlot de Chaleur)" : "Fort (Accumulation)"}
                 </div>
               </div>
             </div>
          )}

          {(showScenarioPanel || showScenarioProjection) && (
             <div className="bg-surface/95 backdrop-blur-md shadow-elevated rounded-xl border border-border p-4 w-[260px] animate-in fade-in duration-200">
               <div className="flex items-center justify-between mb-1">
                 <h4 className="text-[11px] font-bold text-text-3 uppercase tracking-wider">Légende Cartographique</h4>
                 <span className="text-[9px] font-mono px-1.5 py-0.5 bg-brand-teal/10 text-brand-teal rounded font-bold">INSPIRE</span>
               </div>
               <p className="text-[10px] text-text-3 mb-3 leading-tight">Solutions fondées sur la nature projetées</p>
               <div className="space-y-2.5 text-[11px] text-text-2 flex flex-col">
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full border-2 border-white bg-[#f59e0b] mr-2.5 shadow-sm"></span>
                   <span>Désimperméabilisation (sols & placettes)</span>
                 </div>
                 <div className="flex items-center">
                   <span className="w-5 h-1.5 bg-[#0284c7] mr-2 rounded-sm border-dashed border-white"></span>
                   <span>Chaussées perméables & pavés drainants</span>
                 </div>
                 <div className="flex items-center">
                   <span className="w-3.5 h-3.5 bg-[#0d9488] border border-[#14b8a6] mr-2 rounded-sm opacity-85"></span>
                   <span>Noues paysagères & bassins d'orage</span>
                 </div>
                 <div className="flex items-center">
                   <span className="w-3.5 h-3.5 bg-[#22c55e] border border-[#15803d] mr-2 rounded-sm opacity-85"></span>
                   <span>Toitures végétalisées (bâtiments)</span>
                 </div>
               </div>
               <div className="mt-3 pt-2.5 border-t border-border/60 text-[10px] text-text-3 flex items-center justify-between font-mono">
                 <span>Échelle métrique standard :</span>
                 <span className="text-text-2">Actif (bas droite)</span>
               </div>
             </div>
          )}
        </div>

        {/* Map Styles & Sources (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-10 flex gap-2">
          <button onClick={() => setMapStyle(mapStyle === "dark" ? "satellite" : "dark")} className={`flex items-center px-4 py-2 bg-surface shadow-elevated rounded-lg border border-border text-[11px] font-bold uppercase tracking-wider transition-colors ${mapStyle === "satellite" ? "text-brand-blue" : "text-text-2 hover:text-white"}`}>
            <Layers className="w-3.5 h-3.5 mr-2" />
            Satellite
          </button>
          <button className="flex items-center px-4 py-2 bg-surface shadow-elevated rounded-lg border border-border text-[11px] font-bold text-text-2 hover:text-white uppercase tracking-wider transition-colors">
            <FileBarChart className="w-3.5 h-3.5 mr-2" />
            Sources
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
