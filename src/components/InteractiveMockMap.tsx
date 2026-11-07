import React, { useState, MouseEvent } from 'react';
import { MapPin, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Pin {
  x: number;
  y: number;
  label: string;
}

export function InteractiveMockMap({ 
  onLocationSelect, 
  mode = 'point' 
}: { 
  onLocationSelect: (loc: string) => void,
  mode?: 'point' | 'area'
}) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

  const handleMapClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lat = 48.85 + ((rect.height / 2 - y) / rect.height) * 0.1;
    const lng = 2.35 + ((x - rect.width / 2) / rect.width) * 0.1;

    setPins([...pins, { x, y, label: `Zone ${pins.length + 1}` }]);
    
    if (mode === 'point') {
      onLocationSelect(`Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } else {
      onLocationSelect(`Drawn Area ${pins.length + 1} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-void border border-border rounded cursor-crosshair group"
      onClick={handleMapClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverPos(null)}
    >
      {/* Abstract Map Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-blue" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Abstract geography lines */}
          <path d="M -100 200 C 100 150, 300 250, 500 100 S 800 150, 1000 50" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-teal/50" />
          <path d="M -100 250 C 150 200, 250 300, 600 150 S 850 200, 1100 100" fill="none" stroke="currentColor" strokeWidth="1" className="text-brand-blue/30" />
        </svg>
      </div>

      {/* Radial Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/5 via-void/50 to-void pointer-events-none" />

      {/* Hover Crosshair / Cursor Indicator */}
      {hoverPos && (
        <div 
          className="absolute pointer-events-none transition-opacity duration-200"
          style={{ left: hoverPos.x, top: hoverPos.y, transform: 'translate(-50%, -50%)' }}
        >
          {mode === 'point' ? (
            <div className="w-8 h-8 border border-brand-teal/50 rounded-full flex items-center justify-center bg-brand-teal/10">
              <div className="w-1 h-1 bg-brand-teal rounded-full" />
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-brand-blue/50 bg-brand-blue/10 flex items-center justify-center">
              <MousePointer2 className="w-4 h-4 text-brand-blue/50" />
            </div>
          )}
        </div>
      )}

      {/* Dropped Pins */}
      <AnimatePresence>
        {pins.map((pin, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="absolute pointer-events-none flex flex-col items-center"
            style={{ left: pin.x, top: pin.y, transform: 'translate(-50%, -100%)' }}
          >
            <div className="bg-surface border border-border px-2 py-1 rounded text-[10px] text-text-1 shadow-lg mb-1 whitespace-nowrap font-medium">
              {pin.label}
            </div>
            {mode === 'point' ? (
              <MapPin className="w-5 h-5 text-brand-teal fill-brand-teal/20" />
            ) : (
              <div className="w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Helper text overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-void/90 border border-border px-3 py-1.5 rounded-full text-[11px] text-text-2 shadow-lg backdrop-blur flex items-center">
          <MousePointer2 className="w-3 h-3 mr-2" />
          Click anywhere to {mode === 'point' ? 'drop a pin' : 'define an area'}
        </div>
      </div>
    </div>
  );
}
