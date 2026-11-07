import { useEffect } from "react";
import { motion, useAnimate } from "motion/react";
import { useNavigate } from "react-router";

export function LaunchScreen() {
  const [scope, animate] = useAnimate();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const sequence = async () => {
      // t=0.00s: Black screen (default bg)
      
      // t=0.35s: Topo lines fade in
      if (isMounted) animate(".topo-lines", { opacity: 0.06 }, { duration: 0.8, delay: 0.35 });
      
      // t=0.80s: Wordmark appears
      if (isMounted) animate(".wordmark", { opacity: 1 }, { duration: 0.4, delay: 0.8 });
      
      // t=1.30s: Wave ripple expands
      if (isMounted) animate(".wave-ripple-1", { r: 180, opacity: [0.4, 0] }, { duration: 0.9, delay: 1.3 });
      if (isMounted) animate(".wave-ripple-2", { r: 180, opacity: [0.4, 0] }, { duration: 0.9, delay: 1.4 });
      if (isMounted) animate(".wave-ripple-3", { r: 180, opacity: [0.4, 0] }, { duration: 0.9, delay: 1.5 });
      
      // t=2.00s: Tagline appears
      if (isMounted) animate(".tagline", { opacity: 1 }, { duration: 0.4, delay: 2.0 });

      // Wait until t=2.60s then crossfade
      await new Promise(resolve => setTimeout(resolve, 2600));
      
      if (isMounted) {
        animate(scope.current, { opacity: 0 }, { duration: 0.3 }).then(() => {
          navigate("/auth");
        });
      }
    };

    sequence();
    
    return () => {
      isMounted = false;
    };
  }, [animate, navigate, scope]);

  return (
    <div ref={scope} className="fixed inset-0 bg-void flex flex-col items-center justify-center overflow-hidden">
      {/* Topographic contour lines (simplified procedural representation) */}
      <svg className="topo-lines absolute inset-0 w-full h-full opacity-0" pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse 
            key={i} 
            cx="50%" 
            cy="50%" 
            rx={`${10 + i * 8}%`} 
            ry={`${10 + i * 5}%`} 
            fill="none" 
            stroke="var(--blue)" 
            strokeWidth="1" 
          />
        ))}
      </svg>

      {/* Wave Ripple */}
      <svg className="absolute inset-0 w-full h-full flex items-center justify-center overflow-visible" pointerEvents="none">
         <circle className="wave-ripple-1 opacity-0" cx="50%" cy="50%" r="0" fill="none" stroke="var(--blue)" strokeWidth="2" />
         <circle className="wave-ripple-2 opacity-0" cx="50%" cy="50%" r="0" fill="none" stroke="var(--blue)" strokeWidth="2" />
         <circle className="wave-ripple-3 opacity-0" cx="50%" cy="50%" r="0" fill="none" stroke="var(--blue)" strokeWidth="2" />
      </svg>

      <div className="relative z-10 flex flex-col items-center">
        <div className="wordmark opacity-0 flex items-start">
          <h1 className="font-display font-bold text-text-1" style={{ fontSize: '30px', letterSpacing: '0.25em' }}>
            FLOODATLAS
          </h1>
          <sup className="text-brand-teal font-bold ml-1" style={{ fontSize: '13px', marginTop: '4px' }}>AI</sup>
        </div>
        
        <p className="tagline opacity-0 font-body text-text-2 mt-4" style={{ fontSize: '13px', letterSpacing: '0.05em' }}>
          Climate intelligence. Decision-ready.
        </p>
      </div>
    </div>
  );
}
