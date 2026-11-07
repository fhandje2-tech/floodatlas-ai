import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, LocateFixed, Compass } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (val: string, result?: any) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
  required?: boolean;
  autoFocus?: boolean;
  showLocationButton?: boolean;
}

const POPULAR_SUGGESTIONS = [
  "Paris, Île-de-France, France",
  "Lyon, Métropole de Lyon, France",
  "Marseille, Bouches-du-Rhône, France",
  "Bordeaux, Gironde, France",
  "Toulouse, Haute-Garonne, France",
  "Nantes, Loire-Atlantique, France",
  "Strasbourg, Bas-Rhin, France",
  "Lille, Nord, France",
  "Genève, Suisse",
  "Bruxelles, Belgique"
];

export function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Ville, métropole ou adresse...",
  className = "",
  inputClassName = "",
  icon,
  onSelect,
  required = false,
  autoFocus = false,
  showLocationButton = true
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== query) {
      setQuery(value || "");
    }
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query.trim().length >= 2) {
        fetchResults(query.trim());
      } else {
        setResults([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchResults = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1`
      );
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setResults(data || []);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (name: string, result?: any) => {
    setQuery(name);
    onChange(name);
    try {
      localStorage.setItem("floodatlas_last_zone", name);
    } catch {}
    if (onSelect) onSelect(name, result);
    setIsOpen(false);
  };

  const handleDetectLocation = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!navigator.geolocation) {
      setLocationNotice("La géolocalisation n'est pas supportée sur cet appareil");
      setTimeout(() => setLocationNotice(null), 3500);
      return;
    }

    setIsLocating(true);
    setLocationNotice("Détection de votre position GPS...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            { headers: { "User-Agent": "FloodAtlas-Territory-Autofill/1.0" } }
          );
          if (!res.ok) throw new Error("Reverse geocoding error");
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || "Ma commune";
          const dept = addr.county || addr.state || addr.department;
          const country = addr.country || "France";
          const formatted = [city, dept, country].filter(Boolean).join(", ");

          handleSelect(formatted, data);
          setLocationNotice(`Position détectée : ${city}`);
          setTimeout(() => setLocationNotice(null), 3000);
        } catch (err) {
          console.error("Location lookup error:", err);
          setLocationNotice("Impossible d'identifier la ville via GPS");
          setTimeout(() => setLocationNotice(null), 3500);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn("Geolocation denied or unavailable:", err.message);
        setIsLocating(false);
        setLocationNotice("Autorisation de localisation refusée ou indisponible");
        setTimeout(() => setLocationNotice(null), 3500);
      },
      { timeout: 9000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const activeItems = results.length > 0 ? results : (!query ? POPULAR_SUGGESTIONS : []);
    if (!isOpen || activeItems.length === 0) {
      if (e.key === "Enter" && onSelect) {
        onSelect(query);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < activeItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < activeItems.length) {
        const item = activeItems[selectedIndex];
        if (typeof item === 'string') {
          handleSelect(item);
        } else {
          handleSelect(item.display_name, item);
        }
      } else if (onSelect) {
        onSelect(query);
      }
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const savedLastZone = (() => {
    try {
      return localStorage.getItem("floodatlas_last_zone");
    } catch {
      return null;
    }
  })();

  const displayList = results.length > 0 
    ? results 
    : (isOpen && !query ? POPULAR_SUGGESTIONS : []);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {icon ? (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center pointer-events-none">
          {icon}
        </div>
      ) : (
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 z-10 pointer-events-none" />
      )}

      <input
        type="text"
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={inputClassName || "w-full bg-void border border-border rounded-lg pl-11 pr-24 py-3 text-[14px] text-text-1 focus:border-brand-teal focus:outline-none transition-colors"}
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 z-10">
        {loading && <Loader2 className="w-4 h-4 text-brand-teal animate-spin" />}

        {showLocationButton && (
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
              isLocating 
                ? "bg-brand-teal/20 text-brand-teal animate-pulse" 
                : "text-text-3 hover:text-brand-teal hover:bg-white/5"
            }`}
            title="Détecter automatiquement ma position actuelle"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">GPS</span>
          </button>
        )}

        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              setResults([]);
            }}
            className="text-text-3 hover:text-text-1 p-1 rounded-md transition-colors"
            title="Effacer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {locationNotice && (
        <div className="absolute -top-7 right-0 text-[11px] text-brand-teal bg-[#121826]/90 border border-brand-teal/30 px-2 py-0.5 rounded shadow z-20">
          {locationNotice}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-[#121826] border border-border rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto backdrop-blur-xl">
          {/* Quick 1-click GPS detection row */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="w-full text-left px-4 py-2.5 bg-brand-teal/10 hover:bg-brand-teal/20 border-b border-border/60 flex items-center space-x-2.5 transition-colors group"
          >
            <LocateFixed className={`w-4 h-4 text-brand-teal shrink-0 ${isLocating ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-semibold text-brand-teal">
                {isLocating ? "Détection GPS en cours..." : "📍 Utiliser ma position actuelle"}
              </span>
              <p className="text-[10px] text-text-3 truncate">
                Remplissage automatique en 1 clic selon votre localisation physique
              </p>
            </div>
          </button>

          {/* Last territory saved row if different from current query */}
          {savedLastZone && savedLastZone !== query && (
            <button
              type="button"
              onClick={() => handleSelect(savedLastZone)}
              className="w-full text-left px-4 py-2 bg-void/40 hover:bg-void/80 border-b border-border/40 flex items-center space-x-2 text-[12px] text-text-2 hover:text-text-1 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-brand-blue shrink-0" />
              <span className="text-text-3 text-[11px]">Dernier territoire :</span>
              <span className="font-medium text-text-1 truncate">{savedLastZone}</span>
            </button>
          )}

          {!query && (
            <div className="px-3.5 py-1.5 bg-void/50 border-b border-border/50 text-[10px] uppercase font-bold text-text-3 tracking-wider">
              Grandes métropoles suggérées
            </div>
          )}

          {displayList.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const isString = typeof item === 'string';
            const displayName = isString ? item : item.display_name;
            const placeType = !isString && item.type ? item.type : (!isString && item.class ? item.class : null);

            return (
              <button
                key={idx}
                type="button"
                className={`w-full text-left px-4 py-2.5 border-b border-border/40 last:border-0 flex items-start transition-colors ${
                  isSelected ? 'bg-brand-teal/15 text-white' : 'hover:bg-void/80 text-text-2 hover:text-text-1'
                }`}
                onClick={() => {
                  if (isString) {
                    handleSelect(item);
                  } else {
                    handleSelect(item.display_name, item);
                  }
                }}
              >
                <MapPin className={`w-4 h-4 mt-0.5 mr-3 shrink-0 ${isSelected ? 'text-brand-teal' : 'text-brand-teal/70'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium leading-snug truncate">
                    {displayName}
                  </div>
                  {placeType && (
                    <div className="text-[11px] text-text-3 capitalize mt-0.5">
                      {placeType}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
