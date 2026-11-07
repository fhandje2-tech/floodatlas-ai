// Service for fetching and calculating real, verified Critical Infrastructures via OpenStreetMap & Geodesic calculations

export type InfraCategory = 'Santé' | 'Éducation' | 'Secours' | 'Énergie' | 'Transport';

export interface CriticalInfraItem {
  id: string;
  osmId?: string;
  name: string;
  category: InfraCategory;
  type: string;
  icon: string;
  color: string;
  address?: string;
  lat: number;
  lng: number;
  dist: string;
  distanceMeters: number;
  riskLevel: 'Critique' | 'Élevé' | 'Modéré' | 'Faible';
  urgent: boolean;
  osmUrl?: string;
}

export interface CategoryStats {
  category: InfraCategory;
  icon: string;
  color: string;
  count: number;
  avgDistanceMeters: number;
  avgDistanceFormatted: string;
  urgentCount: number;
}

export interface InfrastructureAnalysisResult {
  infrastructures: CriticalInfraItem[];
  categoryStats: CategoryStats[];
  totalCount: number;
  overallAvgDistanceMeters: number;
  overallAvgDistanceFormatted: string;
  centerCoordinates: { lat: number; lng: number };
  zoneName: string;
  source: string;
  timestamp: string;
}

// Haversine formula for real geodesic distance in meters
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
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
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function computeCategoryStats(infras: CriticalInfraItem[]): CategoryStats[] {
  const meta: Record<InfraCategory, { icon: string; color: string }> = {
    'Santé': { icon: '🏥', color: '#ef4444' },
    'Éducation': { icon: '🏫', color: '#3b82f6' },
    'Secours': { icon: '🚒', color: '#f97316' },
    'Énergie': { icon: '⚡', color: '#eab308' },
    'Transport': { icon: '🚉', color: '#8b5cf6' },
  };

  const categories: InfraCategory[] = ['Santé', 'Éducation', 'Secours', 'Énergie', 'Transport'];

  return categories.map((cat) => {
    const items = infras.filter((i) => i.category === cat);
    const count = items.length;
    const avgDist = count > 0 
      ? Math.round(items.reduce((sum, item) => sum + item.distanceMeters, 0) / count)
      : 0;
    const urgentCount = items.filter((i) => i.urgent).length;

    return {
      category: cat,
      icon: meta[cat].icon,
      color: meta[cat].color,
      count,
      avgDistanceMeters: avgDist,
      avgDistanceFormatted: count > 0 ? formatDistance(avgDist) : 'N/A',
      urgentCount,
    };
  });
}

// Fetch real infrastructure items with server endpoint or direct fallback
export async function fetchRealInfrastructures(
  zoneName: string,
  providedLat?: number,
  providedLng?: number
): Promise<InfrastructureAnalysisResult> {
  const cleanZone = zoneName || "Grand Londres";
  let centerLat = providedLat;
  let centerLng = providedLng;

  // 1. If coordinates not provided, geocode via Nominatim
  if (centerLat === undefined || centerLng === undefined) {
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanZone)}&limit=1`
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          centerLat = parseFloat(geoData[0].lat);
          centerLng = parseFloat(geoData[0].lon);
        }
      }
    } catch (e) {
      console.warn("Geocoding notice:", e);
    }
  }

  // Fallback defaults if geocode failed (e.g. Paris center)
  const finalLat = centerLat ?? 48.8566;
  const finalLng = centerLng ?? 2.3522;

  // 2. Query our specialized backend API endpoint
  try {
    const apiRes = await fetch(`/api/infrastructures?lat=${finalLat}&lon=${finalLng}&zone=${encodeURIComponent(cleanZone)}`);
    if (apiRes.ok) {
      const result: InfrastructureAnalysisResult = await apiRes.json();
      if (result.infrastructures && result.infrastructures.length > 0) {
        return result;
      }
    }
  } catch (err) {
    console.warn("Backend infra route unavailable, falling back to client OSM query:", err);
  }

  // 3. Resilient client-side OpenStreetMap query (Overpass / Nominatim)
  return await queryClientOpenStreetMap(cleanZone, finalLat, finalLng);
}

// Client-side direct OpenStreetMap query with high reliability
async function queryClientOpenStreetMap(
  zoneName: string,
  lat: number,
  lon: number
): Promise<InfrastructureAnalysisResult> {
  const infras: CriticalInfraItem[] = [];

  // Overpass query with a 2500m radius
  const overpassQuery = `[out:json][timeout:10];
(
  node["amenity"="hospital"](around:2500,${lat},${lon});
  way["amenity"="hospital"](around:2500,${lat},${lon});
  node["amenity"="clinic"](around:2500,${lat},${lon});
  node["amenity"="school"](around:2500,${lat},${lon});
  way["amenity"="school"](around:2500,${lat},${lon});
  node["amenity"="university"](around:2500,${lat},${lon});
  node["amenity"="fire_station"](around:2500,${lat},${lon});
  node["amenity"="police"](around:2500,${lat},${lon});
  node["power"="substation"](around:2500,${lat},${lon});
  node["railway"="station"](around:2500,${lat},${lon});
  node["public_transport"="station"](around:2500,${lat},${lon});
);
out center 40;`;

  let usedOverpass = false;

  try {
    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(6000),
    });

    if (overpassRes.ok) {
      const data = await overpassRes.json();
      if (data && data.elements && data.elements.length > 0) {
        usedOverpass = true;

        for (const el of data.elements) {
          const itemLat = el.lat || el.center?.lat;
          const itemLon = el.lon || el.center?.lon;
          if (!itemLat || !itemLon) continue;

          const tags = el.tags || {};
          let category: InfraCategory = 'Énergie';
          let type = "Infrastructure stratégique";
          let icon = "⚡";
          let color = "#eab308";

          if (tags.amenity === 'hospital' || tags.amenity === 'clinic') {
            category = 'Santé';
            type = tags.amenity === 'hospital' ? 'Hôpital / Centre Hospitalier' : 'Clinique / Pôle Médical';
            icon = '🏥';
            color = '#ef4444';
          } else if (tags.amenity === 'school' || tags.amenity === 'university' || tags.amenity === 'college') {
            category = 'Éducation';
            type = tags.amenity === 'university' ? 'Campus Universitaire' : tags.amenity === 'college' ? 'Collège / Lycée' : 'Groupe Scolaire';
            icon = '🏫';
            color = '#3b82f6';
          } else if (tags.amenity === 'fire_station' || tags.amenity === 'police') {
            category = 'Secours';
            type = tags.amenity === 'fire_station' ? "Centre de Secours (Pompiers)" : "Commissariat / Sécurité";
            icon = '🚒';
            color = '#f97316';
          } else if (tags.railway === 'station' || tags.public_transport === 'station') {
            category = 'Transport';
            type = 'Gare / Pôle multimodal';
            icon = '🚉';
            color = '#8b5cf6';
          } else if (tags.power === 'substation') {
            category = 'Énergie';
            type = 'Poste Source Électrique';
            icon = '⚡';
            color = '#eab308';
          }

          const rawName = tags.name || tags['name:fr'] || tags['name:en'] || `${type} (${zoneName.split(',')[0].trim()})`;
          const distanceMeters = calculateHaversineDistance(lat, lon, itemLat, itemLon);
          const urgent = distanceMeters <= 350;

          let riskLevel: 'Critique' | 'Élevé' | 'Modéré' | 'Faible' = 'Faible';
          if (distanceMeters < 250) riskLevel = 'Critique';
          else if (distanceMeters < 600) riskLevel = 'Élevé';
          else if (distanceMeters < 1200) riskLevel = 'Modéré';

          const address = tags['addr:street'] 
            ? `${tags['addr:housenumber'] ? tags['addr:housenumber'] + ' ' : ''}${tags['addr:street']}`
            : tags['addr:city'] || '';

          infras.push({
            id: `osm-${el.id}`,
            osmId: String(el.id),
            name: rawName,
            category,
            type,
            icon,
            color,
            address,
            lat: itemLat,
            lng: itemLon,
            dist: formatDistance(distanceMeters),
            distanceMeters,
            riskLevel,
            urgent,
            osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`
          });
        }
      }
    }
  } catch (overpassErr) {
    console.warn("Direct Overpass query failed or timed out:", overpassErr);
  }

  // 4. Fallback: If Overpass was blocked or timed out, query Nominatim for exact nearby POIs
  if (infras.length === 0) {
    const cityName = zoneName.split(',')[0].trim();
    const poiQueries = [
      { q: `hospital near ${cityName}`, cat: 'Santé' as InfraCategory, type: 'Centre Hospitalier', icon: '🏥', color: '#ef4444' },
      { q: `school near ${cityName}`, cat: 'Éducation' as InfraCategory, type: 'Groupe Scolaire', icon: '🏫', color: '#3b82f6' },
      { q: `fire station near ${cityName}`, cat: 'Secours' as InfraCategory, type: 'Caserne Pompiers', icon: '🚒', color: '#f97316' },
      { q: `substation near ${cityName}`, cat: 'Énergie' as InfraCategory, type: 'Poste Électrique', icon: '⚡', color: '#eab308' },
      { q: `station near ${cityName}`, cat: 'Transport' as InfraCategory, type: 'Gare / Station', icon: '🚉', color: '#8b5cf6' }
    ];

    for (const qDef of poiQueries) {
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(qDef.q)}&limit=3`
        );
        if (nomRes.ok) {
          const results = await nomRes.json();
          for (const item of results) {
            const itemLat = parseFloat(item.lat);
            const itemLon = parseFloat(item.lon);
            const distM = calculateHaversineDistance(lat, lon, itemLat, itemLon);
            const urgent = distM <= 400;

            let riskLevel: 'Critique' | 'Élevé' | 'Modéré' | 'Faible' = 'Faible';
            if (distM < 250) riskLevel = 'Critique';
            else if (distM < 600) riskLevel = 'Élevé';
            else if (distM < 1200) riskLevel = 'Modéré';

            infras.push({
              id: `nom-${item.place_id}`,
              osmId: String(item.osm_id),
              name: item.name || item.display_name.split(',')[0],
              category: qDef.cat,
              type: qDef.type,
              icon: qDef.icon,
              color: qDef.color,
              address: item.display_name.split(',').slice(1, 3).join(',').trim(),
              lat: itemLat,
              lng: itemLon,
              dist: formatDistance(distM),
              distanceMeters: distM,
              riskLevel,
              urgent,
              osmUrl: `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`
            });
          }
        }
      } catch (nomErr) {
        console.warn("Nominatim fallback warning:", nomErr);
      }
    }
  }

  // Sort by proximity
  infras.sort((a, b) => a.distanceMeters - b.distanceMeters);

  const categoryStats = computeCategoryStats(infras);
  const totalCount = infras.length;
  const overallAvg = totalCount > 0 
    ? Math.round(infras.reduce((s, i) => s + i.distanceMeters, 0) / totalCount)
    : 0;

  return {
    infrastructures: infras,
    categoryStats,
    totalCount,
    overallAvgDistanceMeters: overallAvg,
    overallAvgDistanceFormatted: totalCount > 0 ? formatDistance(overallAvg) : 'N/A',
    centerCoordinates: { lat, lng: lon },
    zoneName,
    source: usedOverpass ? 'Données réelles certifiées OpenStreetMap (Overpass API)' : 'Données réelles géocodées OpenStreetMap (Nominatim API)',
    timestamp: new Date().toISOString()
  };
}
