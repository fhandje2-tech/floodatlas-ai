import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

function getPoliteQuotaMessage(lang: string = "fr") {
  const code = (lang || "fr").slice(0, 2).toLowerCase();
  switch (code) {
    case "en":
      return "🌿 Thank you so much for your interest and active engagement with FloodAtlas AI! Within the complimentary Starter Tier, the daily AI analysis quota has currently been reached. We warmly invite you to continue your explorations and scenario simulations a bit later or tomorrow. In the meantime, all your existing maps, GIS layers, and resilience models remain fully accessible and interactive. We look forward to continuing together soon!";
    case "de":
      return "🌿 Vielen Dank für Ihr Interesse und Ihre Arbeit mit FloodAtlas AI! Im Rahmen des kostenfreien Starter-Tiers wurde das tägliche KI-Analyse-Kontingent vorübergehend erreicht. Wir laden Sie herzlich ein, Ihre Simulationen und Analysen etwas später oder morgen fortzusetzen. Alle Ihre bisherigen Karten, GIS-Ebenen und Projekte bleiben uneingeschränkt nutzbar. Wir freuen uns darauf, die Resilienz Ihres Territoriums bald weiter zu stärken!";
    case "ar":
      return "🌿 شكراً جزيلاً لاهتمامكم وتفاعلكم القيم مع FloodAtlas AI! ضمن باقة الوصول المجاني (Starter Tier)، تم الوصول إلى الحد اليومي المتاح لتحليلات الذكاء الاصطناعي في الوقت الحالي. ندعوكم بكل سرور لمواصلة استكشافكم ومحاكاة السيناريوهات في وقت لاحق أو غداً. في هذه الأثناء، تظل جميع خرائطكم وبياناتكم الجغرافية متاحة وتفاعلية بالكامل. نتطلع لمواصلة العمل معكم قريباً!";
    case "fr":
    default:
      return "🌿 Merci beaucoup pour votre intérêt et vos échanges avec FloodAtlas AI ! Dans le cadre de l'offre d'accès gratuit Starter Tier, le quota journalier d'analyses par IA a été atteint pour le moment. Nous vous invitons chaleureusement à poursuivre vos simulations et vos diagnostics un peu plus tard ou dès demain. En attendant, toutes vos cartes, couches géographiques et scénarios existants restent pleinement consultables et interactifs. À très bientôt pour continuer à renforcer la résilience de votre territoire !";
  }
}

function getPoliteErrorMessage(lang: string = "fr") {
  const code = (lang || "fr").slice(0, 2).toLowerCase();
  switch (code) {
    case "en":
      return "🌿 The AI service is momentarily experiencing high demand. Thank you very much for your patience; we kindly invite you to try again in a few moments. Your project data is safely preserved.";
    case "de":
      return "🌿 Der KI-Dienst verzeichnet derzeit eine hohe Auslastung. Wir danken Ihnen herzlich für Ihre Geduld und laden Sie ein, es in wenigen Augenblicken erneut zu versuchen. Ihre Daten bleiben sicher gespeichert.";
    case "ar":
      return "🌿 تشهد خدمة الذكاء الاصطناعي إقبالاً كبيراً في الوقت الحالي. نشكركم جزيلاً على تفهمكم وسعة صدركم، وندعوكم لتجربة إرسال طلبكم بعد لحظات وجيزة. بيانات مشروعكم محفوظة بأمان.";
    case "fr":
    default:
      return "🌿 L'Assistant IA rencontre une forte affluence en ce moment. Nous vous remercions pour votre patience et vous invitons à réitérer votre demande dans quelques instants. Vos données et projets sont précieusement conservés.";
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API route for Gemini chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, activeZone, role, selectedLevers, resilienceIndex, language, attachments } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `Tu es Atlas, l'allié d'intelligence territoriale et de gestion de crise de FloodAtlas. Tu es le co-pilote et conseiller stratégique des décideurs, élus, aménageurs et techniciens face aux risques climatiques et aux inondations.

TON ET POSTURE (ALLIÉ DE CRISE) :
- Agis comme un allié de confiance : calme inébranlable, clarté absolue, rigueur scientifique et posture rassurante.
- Face à l'aléa et aux menaces : sois lucide, objectif et direct sur la réalité des risques (urgence, zones critiques, vulnérabilité des populations et infrastructures).
- Face aux décisions : sois proactif, pragmatique et orienté solutions (aménagements "Ville Éponge", désimperméabilisation, noues végétalisées, rétention, chiffrage CAPEX/OPEX).
- Établis une alliance professionnelle solide avec l'utilisateur.
- Si l'utilisateur fournit des pièces jointes (fichiers GeoJSON, SIG, relevés pluviométriques, photos de terrain ou rapports), analyse-les avec précision, cite-les expressément et intègre leurs données dans ton diagnostic et tes recommandations.
- NE dis JAMAIS "Bonjour", "Hello" ou d'autres salutations génériques au début de tes réponses. Va directement au but de l'analyse.

PERSONNALISATION ET DONNÉES :
- Adapte-toi toujours parfaitement au profil de l'utilisateur (${role || "User"}) et à ses priorités.
- Analyse le territoire (${activeZone || "Unknown"}) avec des données réalistes, actualisées ou des estimations pertinentes basées sur la typologie de la zone.
- Formule des recommandations sur-mesure (pas de générique).

UNIFORMITÉ LINGUISTIQUE (CRITIQUE) :
- Tu DOIS répondre EXCLUSIVEMENT dans cette langue : ${language || "fr"}.
- INTERDICTION ABSOLUE de mélanger deux langues. Si la langue est le français, TOUS les titres, sous-titres et contenus doivent être en français.

FORMATAGE ET SOURCES :
- Aère tes réponses (utilise des paragraphes courts et des sauts de ligne).
- Utilise le Markdown pour structurer tes réponses (titres clairs, listes à puces pour la lisibilité).
- Justifie tes raisonnements scientifiquement et économiquement.
- Termine TOUJOURS ta réponse par une section détaillée de **Sources et Références** citant des autorités réelles (ex: GIEC, CEREMA, Agences de l'Eau, rapports locaux).`;

      let history = messages.map((m: any) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content || '' }]
      }));
      
      const lastMessageObj = history.pop();
      const lastMessage = lastMessageObj ? lastMessageObj.parts[0].text : '';
      
      if (history.length > 0 && history[0].role === 'model') {
        history.unshift({ role: 'user', parts: [{ text: "[System] Début de la session de travail." }] });
      }

      let attachmentPromptText = "";
      const currentParts: any[] = [];

      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        attachmentPromptText += "\n\n[PIÈCES JOINTES REÇUES]\n";
        for (const att of attachments) {
          const sizeKb = att.size ? Math.round(att.size / 1024) : 0;
          attachmentPromptText += `\n📁 Document: "${att.name}" (${att.category || 'fichier'}, ${sizeKb} Ko)\n`;
          if (att.contentExcerpt) {
            attachmentPromptText += `Extrait des données contenues :\n\`\`\`\n${att.contentExcerpt.slice(0, 5000)}\n\`\`\`\n`;
          }
          if (att.base64 && att.mimeType && att.mimeType.startsWith('image/')) {
            currentParts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.base64
              }
            });
          }
        }
        attachmentPromptText += "[FIN DES PIÈCES JOINTES]\n";
      }
      
      const prompt = `[CONTEXT]
Zone: ${activeZone || "Unknown"}
User Role: ${role || "User"}
Resilience Index: ${resilienceIndex || "N/A"}
Selected Levers: ${selectedLevers && selectedLevers.length ? selectedLevers.join(', ') : 'None yet'}
[END CONTEXT]
${attachmentPromptText}
User Query: ${lastMessage || "Analyse ces éléments et formule tes recommandations pour ce territoire."}`;

      currentParts.push({ text: prompt });

      // Resilient multi-tier model strategy: try primary gemini-3.8-flash, fallback to gemini-2.5-flash if high demand / 503
      const modelsToTry = ['gemini-3.8-flash', 'gemini-2.5-flash'];
      let responseText = null;
      let lastErr: any = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [...history, { role: 'user', parts: currentParts }],
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.2
            }
          });
          if (response?.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(`Model ${modelName} hit error (${err?.status || err?.message}), evaluating fallback...`);
        }
      }

      if (!responseText) {
        throw lastErr || new Error("All AI models are temporarily unavailable.");
      }
      
      res.json({ content: responseText });
    } catch (error: any) {
      console.error("AI Error:", error);
      const isQuota = 
        error?.status === 429 || 
        error?.message?.includes("429") || 
        error?.message?.includes("RESOURCE_EXHAUSTED") || 
        error?.message?.includes("quota") ||
        error?.message?.includes("rate limit");
      
      const userLang = req.body?.language || "fr";
      const politeMessage = isQuota 
        ? getPoliteQuotaMessage(userLang) 
        : getPoliteErrorMessage(userLang);

      res.status(isQuota ? 429 : 500).json({ 
        errorType: isQuota ? "quota_exceeded" : "temporary_issue",
        isQuota,
        content: politeMessage,
        error: politeMessage
      });
    }
  });

  // In-memory cache for instant subsequent lookups
  const infraCache = new Map<string, any>();

  // API route for real, verified Critical Infrastructures (OpenStreetMap & Haversine distance)
  app.get("/api/infrastructures", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 51.5074;
      const lon = parseFloat(req.query.lon as string) || -0.1278;
      const zoneName = (req.query.zone as string) || "Zone d'étude";
      const cacheKey = `${zoneName.toLowerCase()}_${lat.toFixed(3)}_${lon.toFixed(3)}`;

      if (infraCache.has(cacheKey)) {
        return res.json(infraCache.get(cacheKey));
      }

      // Haversine formula
      const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
      };

      const formatDist = (m: number) => (m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`);

      const infras: any[] = [];
      let sourceName = 'Données réelles certifiées OpenStreetMap (Nominatim)';
      const cityName = zoneName.split(',')[0].trim();
      const isJapanese = 
        zoneName.toLowerCase().includes('tokyo') || 
        zoneName.toLowerCase().includes('japon') || 
        zoneName.toLowerCase().includes('japan') || 
        (lat > 24 && lat < 46 && lon > 122 && lon < 154);

      // Multilingual keywords for high accuracy worldwide (English, French, and Japanese for Tokyo/Japan)
      const queries = isJapanese ? [
        { q: `病院 ${cityName}`, cat: 'Santé', type: 'Centre Hospitalier', icon: '🏥', color: '#ef4444' },
        { q: `消防署 ${cityName}`, cat: 'Secours', type: 'Caserne Pompiers', icon: '🚒', color: '#f97316' },
        { q: `学校 ${cityName}`, cat: 'Éducation', type: 'Groupe Scolaire', icon: '🏫', color: '#3b82f6' },
        { q: `変電所 ${cityName}`, cat: 'Énergie', type: 'Poste Électrique', icon: '⚡', color: '#eab308' },
        { q: `駅 ${cityName}`, cat: 'Transport', type: 'Gare / Station', icon: '🚉', color: '#8b5cf6' },
        { q: `hospital near ${cityName}`, cat: 'Santé', type: 'Centre Hospitalier', icon: '🏥', color: '#ef4444' }
      ] : [
        { q: `hospital near ${cityName}`, cat: 'Santé', type: 'Centre Hospitalier', icon: '🏥', color: '#ef4444' },
        { q: `school near ${cityName}`, cat: 'Éducation', type: 'Groupe Scolaire', icon: '🏫', color: '#3b82f6' },
        { q: `fire station near ${cityName}`, cat: 'Secours', type: 'Caserne Pompiers', icon: '🚒', color: '#f97316' },
        { q: `substation near ${cityName}`, cat: 'Énergie', type: 'Poste Électrique', icon: '⚡', color: '#eab308' },
        { q: `station near ${cityName}`, cat: 'Transport', type: 'Gare / Station', icon: '🚉', color: '#8b5cf6' }
      ];

      const viewbox = `${(lon - 0.35).toFixed(4)},${(lat + 0.35).toFixed(4)},${(lon + 0.35).toFixed(4)},${(lat - 0.35).toFixed(4)}`;

      // Run queries in parallel
      const results = await Promise.allSettled(
        queries.map(async (itemDef) => {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(itemDef.q)}&viewbox=${viewbox}&limit=6`,
            { 
              headers: { "User-Agent": "FloodAtlas-Territorial-Resilience/1.0" },
              signal: AbortSignal.timeout(4500)
            }
          );
          if (!nomRes.ok) return [];
          const resItems = await nomRes.json();
          return resItems.map((nItem: any) => ({ ...nItem, itemDef }));
        })
      );

      const seenIds = new Set<string>();

      for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          for (const item of result.value) {
            if (seenIds.has(String(item.place_id))) continue;
            seenIds.add(String(item.place_id));

            const iLat = parseFloat(item.lat);
            const iLon = parseFloat(item.lon);
            const distM = haversine(lat, lon, iLat, iLon);
            
            // Allow metropolitan radius for mega-cities like Tokyo (up to 20km)
            if (distM > 20000) continue;

            const urgent = distM <= 600;

            let riskLevel = 'Faible';
            if (distM < 350) riskLevel = 'Critique';
            else if (distM < 800) riskLevel = 'Élevé';
            else if (distM < 1800) riskLevel = 'Modéré';

            infras.push({
              id: `nom-${item.place_id}`,
              osmId: String(item.osm_id),
              name: item.name || item.display_name.split(',')[0],
              category: item.itemDef.cat,
              type: item.itemDef.type,
              icon: item.itemDef.icon,
              color: item.itemDef.color,
              address: item.display_name.split(',').slice(1, 3).join(',').trim(),
              lat: iLat,
              lng: iLon,
              dist: formatDist(distM),
              distanceMeters: distM,
              riskLevel,
              urgent,
              osmUrl: `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`
            });
          }
        }
      }

      // Sort by proximity
      infras.sort((a, b) => a.distanceMeters - b.distanceMeters);

      // Compute stats by category
      const categories = ['Santé', 'Éducation', 'Secours', 'Énergie', 'Transport'];
      const metaMap: Record<string, { icon: string; color: string }> = {
        'Santé': { icon: '🏥', color: '#ef4444' },
        'Éducation': { icon: '🏫', color: '#3b82f6' },
        'Secours': { icon: '🚒', color: '#f97316' },
        'Énergie': { icon: '⚡', color: '#eab308' },
        'Transport': { icon: '🚉', color: '#8b5cf6' },
      };

      const categoryStats = categories.map(cat => {
        const items = infras.filter(i => i.category === cat);
        const count = items.length;
        const avg = count > 0 ? Math.round(items.reduce((s, i) => s + i.distanceMeters, 0) / count) : 0;
        return {
          category: cat,
          icon: metaMap[cat].icon,
          color: metaMap[cat].color,
          count,
          avgDistanceMeters: avg,
          avgDistanceFormatted: count > 0 ? formatDist(avg) : 'N/A',
          urgentCount: items.filter(i => i.urgent).length
        };
      });

      const totalCount = infras.length;
      const overallAvg = totalCount > 0 ? Math.round(infras.reduce((s, i) => s + i.distanceMeters, 0) / totalCount) : 0;

      const payload = {
        infrastructures: infras,
        categoryStats,
        totalCount,
        overallAvgDistanceMeters: overallAvg,
        overallAvgDistanceFormatted: totalCount > 0 ? formatDist(overallAvg) : 'N/A',
        centerCoordinates: { lat, lng: lon },
        zoneName,
        source: sourceName,
        timestamp: new Date().toISOString()
      };

      infraCache.set(cacheKey, payload);
      res.json(payload);
    } catch (error: any) {
      console.error("Infrastructure API Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch infrastructures" });
    }
  });

  // API route for Image Generation with strict OUTDOOR civil engineering enforcement & Topographic Context
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { 
        scenario, 
        location, 
        prompt, 
        selectedLevers = [], 
        reliefProfile = 'moderate_slope', // 'gentle_plain' | 'moderate_slope' | 'steep_hillside' | 'valley_basin' | 'waterfront'
        urbanTypology = 'historical_dense', // 'historical_dense' | 'modern_avenue' | 'eco_district' | 'commercial_parking'
        viewAngle = 'eye' // 'eye' | 'aerial' | 'section'
      } = req.body;

      const cityName = (location || "Territoire d'étude").split(',')[0].trim();
      const rawLocation = location || "Territoire d'étude";

      // Relief descriptive phrases for spatial civil engineering realism
      const reliefDescriptions: Record<string, { en: string; fr: string; slope: string }> = {
        gentle_plain: {
          en: "flat alluvial plain with subtle 1% incline, stormwater infiltration trenches and wide linear rain gardens",
          fr: "Plaine alluviale à faible pente (<1.5%), tranchées d'infiltration et noues larges",
          slope: "1.2% (Ruissellement diffus)"
        },
        moderate_slope: {
          en: "urban street with a distinct 3.5% downhill slope, gravity runoff flowing naturally into stepped terraced roadside bioswales with stone check-dams",
          fr: "Rue en déclivité modérée (3.5%), écoulement gravitaire guidé vers des noues étagées",
          slope: "3.5% (Écoulement gravitaire vers talweg)"
        },
        steep_hillside: {
          en: "steep urban hillside with 6.5% gradient, terraced bioretention steps, cascade swales and permeable retaining surfaces",
          fr: "Coteau à forte pente (6.5%), paliers de rétention étagés et seuils rocheux ralentisseurs",
          slope: "6.5% (Forte déclivité / Ruissellement torrentiel ralenti)"
        },
        valley_basin: {
          en: "topographical low point and natural talweg basin, multifunctional sunken public plaza that safely retains stormwater during cloudbursts",
          fr: "Point bas topographique / Fond de talweg, place creuse multifonctionnelle de rétention",
          slope: "Point bas (Cuvette réceptrice naturelle)"
        },
        waterfront: {
          en: "riverbank and waterfront promenade with daylighted urban creek, softly sloped vegetated banks and overflow meadows",
          fr: "Berges fluviales et cours d'eau réouvert avec talus végétalisés et prairies inondables",
          slope: "Bord d'eau (Zone d'expansion alluviale)"
        }
      };

      const selectedRelief = reliefDescriptions[reliefProfile] || reliefDescriptions.moderate_slope;

      // Urban architectural typology context
      const typologyDescriptions: Record<string, { en: string; fr: string }> = {
        historical_dense: {
          en: "classic European urban architectural streetscape with historical stone facades, ground-floor shops, elegant wrought-iron balconies and mansard roofs",
          fr: "Tissu urbain historique minéral dense (façades pierre de taille, rez-de-chaussée vivants)"
        },
        modern_avenue: {
          en: "wide modern metropolitan avenue with tree-lined pedestrian promenades, mass-timber and contemporary sustainable glass-and-stone architecture",
          fr: "Avenue métropolitaine moderne avec mail piéton et bâti contemporain bas-carbone"
        },
        eco_district: {
          en: "vibrant sustainable eco-district with biosolar green roofs, wooden public benches, bicycle lanes and lush native biodiversity corridors",
          fr: "Éco-quartier résilient à haute biodiversité, toitures végétalisées et mobilités actives"
        },
        commercial_parking: {
          en: "previously mineral commercial asphalt parking completely transformed into permeable honeycomb grass pavers, tree islands and bioretention swales",
          fr: "Ancien parking minéral réaménagé en pavés poreux drainants et îlots d'arbres"
        }
      };

      const selectedTypology = typologyDescriptions[urbanTypology] || typologyDescriptions.historical_dense;

      // View angle camera framing
      const cameraAngles: Record<string, string> = {
        eye: "Ground-level pedestrian eye-level architectural photography, wide-angle lens, realistic human perspective showcasing the tactile texture of porous pavers and lush wetland grasses",
        aerial: "Axonometric high-angle drone photograph looking down on the street and slope, clearly capturing the urban topography, relief gradient, and connected blue-green stormwater network across several city blocks",
        section: "Close-up perspective focusing on the cross-section between the porous sidewalk, the sunken bioretention swale with native plants, and the street runoff inlet curb"
      };

      const selectedAngle = cameraAngles[viewAngle] || cameraAngles.eye;

      let masterPrompt = "";

      // 1. Generate an enriched, photorealistic English architectural prompt using Gemini 3.8 Flash if available
      if (process.env.GEMINI_API_KEY) {
        try {
          const aiPromptGen = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const promptEnricher = await aiPromptGen.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `You are an award-winning landscape architect and urban civil engineer visualizing a real-world Sponge City project in "${rawLocation}".
Write a concise, ultra-detailed text-to-image prompt (in English, max 120 words) for a photorealistic architectural visualization.

Context:
- Location: ${rawLocation}
- Topography / Relief: ${selectedRelief.en}
- Architectural vernacular: ${selectedTypology.en}
- Camera Perspective: ${selectedAngle}
- Interventions: ${Array.isArray(selectedLevers) && selectedLevers.length ? selectedLevers.join(", ") : "bioswales, permeable pavers, rain gardens, green roofs"}
- Weather/Atmosphere: Soft, natural overcast daylight right after a summer rainstorm. Pavements are damp, crystal clear rainwater is gently infiltrating porous pavers and cascading through landscaped bioretention swales.
- CRITICAL CONSTRAINTS: Must be 100% EXTERIOR OUTDOOR PUBLIC STREETSCAPE. ABSOLUTELY NO INDOOR, NO INTERIOR, NO LIVING ROOM, NO FURNITURE, NO COUCH, NO INDOOR CEILING.

Return ONLY the final prompt text with no quotes, no preface.`,
            config: {
              temperature: 0.3
            }
          });

          if (promptEnricher.text && promptEnricher.text.trim().length > 30) {
            masterPrompt = promptEnricher.text.trim();
          }
        } catch (enrichErr) {
          console.warn("Prompt enrichment warning:", enrichErr);
        }
      }

      if (!masterPrompt) {
        masterPrompt = `Photorealistic daylight exterior architectural photography of an authentic sponge city civil engineering transformation in ${rawLocation}.
Street setting: ${selectedTypology.en}, topography featuring ${selectedRelief.en}.
Sustainable drainage: stepped roadside bioswales planted with native wetland iris, rushes and sedges, permeable interlocking porous paving on pedestrian sidewalks, sunken rain gardens absorbing runoff, visible lush green roofs on nearby municipal buildings.
Atmosphere: Soft diffused daylight right after rain, clean reflective puddles in bioretention swale, damp porous pavement texture.
Framing: ${selectedAngle}.
CRITICAL NEGATIVE CONSTRAINTS: STRICTLY OUTDOOR EXTERIOR PUBLIC INFRASTRUCTURE ONLY. NO INDOORS, NO INTERIOR, NO LIVING ROOM, NO FURNITURE, NO SALON, NO SOFA, NO WALLPAPER, NO DOMESTIC ROOMS.`;
      }

      const finalPrompt = prompt && prompt.length > 50 
        ? `${prompt}\n\nTOPOGRAPHY & ARCHITECTURE: Grounded in ${rawLocation} with ${selectedRelief.en}. ${selectedTypology.en}. Framing: ${selectedAngle}.\nSTRICT REQUIREMENT: 100% EXTERIOR OUTDOOR PUBLIC URBAN ARCHITECTURE ONLY. NO INDOORS, NO LIVING ROOM, NO FURNITURE, NO SALON.` 
        : masterPrompt;

      // High-Fidelity Pairings for Before / After (Existing Vulnerable vs Resilient Sponge City)
      // Grounded in authentic local assets to guarantee 100% reliable rendering without broken 404 links
      const contextualPairs: Record<string, { before: string; after: string; label: string }> = {
        moderate_slope: {
          before: "/images/slope_before.jpg", // Vulnerable sloped asphalt road, torrential runoff
          after: "/images/slope_after.jpg", // Stepped bioswales & cascading bioretention
          label: "Déclivité urbaine & Noues étagées"
        },
        steep_hillside: {
          before: "/images/slope_before.jpg", // Steep mineral hillside avenue with runoff
          after: "/images/slope_after.jpg", // Terraced green retention channels
          label: "Coteau étagé & Paliers d'infiltration"
        },
        gentle_plain: {
          before: "/images/urban_before.jpg", // Mineral asphalt street, stagnant runoff
          after: "/images/urban_after.jpg", // Permeable streetscape with rain gardens
          label: "Plaine perméable & Pavés drainants"
        },
        valley_basin: {
          before: "/images/urban_before.jpg", // Concrete basin / grey urban road
          after: "/images/urban_after.jpg", // Multifunctional sunken retention wetlands
          label: "Cuvette basse & Bassin paysager multifonctionnel"
        },
        waterfront: {
          before: "/images/urban_before.jpg", // Concrete canalized embankment
          after: "/images/urban_after.jpg", // Renatured daylighted riverfront with soft green quays
          label: "Berges renaturées & Réouverture du cours d'eau"
        }
      };

      const pair = contextualPairs[reliefProfile] || contextualPairs.moderate_slope;

      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ 
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        // 1. First attempt: Standard Imagen 3 model with rich topographical prompt
        try {
          const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: finalPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9'
            }
          });
          
          if (response.generatedImages && response.generatedImages.length > 0) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            return res.json({ 
              image: `data:image/jpeg;base64,${base64Image}`,
              beforeImage: pair.before,
              prompt: finalPrompt,
              model: 'imagen-3.0-generate-002',
              reliefProfile,
              reliefSlope: selectedRelief.slope,
              reliefDescription: selectedRelief.fr,
              urbanTypology: selectedTypology.fr,
              cityName,
              fallback: false
            });
          }
        } catch (imagenErr: any) {
          console.warn("Imagen 3 generation attempt failed, trying gemini-3.1-flash-lite-image:", imagenErr?.message || imagenErr);
        }

        // 2. Second attempt: gemini-3.1-flash-lite-image
        try {
          const flashImgResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [{ text: finalPrompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: "16:9"
              }
            }
          });
          const candidate = flashImgResponse.candidates?.[0];
          const imagePart = candidate?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
          if (imagePart && imagePart.inlineData) {
            return res.json({
              image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
              beforeImage: pair.before,
              prompt: finalPrompt,
              model: 'gemini-3.1-flash-lite-image',
              reliefProfile,
              reliefSlope: selectedRelief.slope,
              reliefDescription: selectedRelief.fr,
              urbanTypology: selectedTypology.fr,
              cityName,
              fallback: false
            });
          }
        } catch (flashErr: any) {
          console.warn("gemini-3.1-flash-lite-image attempt failed:", flashErr?.message || flashErr);
        }
      }

      // 3. High-Fidelity Topographic & Architectural Fallback with Before/After
      return res.json({
        image: pair.after,
        beforeImage: pair.before,
        prompt: finalPrompt,
        model: 'curated-topographic-sponge-city',
        reliefProfile,
        reliefSlope: selectedRelief.slope,
        reliefDescription: selectedRelief.fr,
        urbanTypology: selectedTypology.fr,
        cityName,
        fallback: true
      });
    } catch (err: any) {
      console.error("Image Gen Global Error:", err);
      return res.json({ 
        image: "/images/urban_after.jpg",
        beforeImage: "/images/urban_before.jpg",
        fallback: true,
        error: err.message 
      });
    }
  });

  // Serve static imagery for 100% reliable local and production before/after rendering
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  app.use('/images', express.static(imagesDir));
  app.use('/src/assets/images', express.static(imagesDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on http://localhost:" + PORT);
  });
}

startServer();
