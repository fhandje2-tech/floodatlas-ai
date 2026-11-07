import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

const updatedStep4 = `
function Step4Tour() {
  const cards = [
    { icon: Target, title: "Diagnostic Territorial", desc: "Analyse experte ciblée (Inondation, Îlots de chaleur, etc.) calibrée pour votre zone.", colSpan: "col-span-1" },
    { icon: MapIcon, title: "Cartographie Multimoteur", desc: "Moteurs MapLibre, Mapbox et Leaflet avec superposition dynamique des aléas.", colSpan: "col-span-1" },
    { icon: Sparkles, title: "Assistant IA Expert", desc: "Stratège urbain multilingue pour concevoir des scénarios Ville Éponge adaptés.", colSpan: "col-span-1" },
    { icon: FileBarChart, title: "Génération de Rapports", desc: "Notes techniques, bilans financiers CAPEX et rapports urbanistiques (PLU).", colSpan: "col-span-1" },
    { icon: Waves, title: "Simulateur & Visuels IA", desc: "Comparez les coûts et générez des rendus visuels réalistes (Imagen 3) de vos projets.", colSpan: "col-span-2 sm:col-span-2 md:col-span-2 mx-auto w-full md:w-3/4" },
  ];

  return (
    <div className="pt-8">
      <h2 className="font-display font-bold text-2xl mb-2 text-center">Votre espace projet est prêt.</h2>
      <p className="text-text-2 text-sm mb-10 text-center">5 modules experts propulsés par l'IA pour bâtir un territoire résilient.</p>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={\`bg-surface border border-border p-5 rounded-xl hover:border-brand-teal transition-colors group \${card.colSpan}\`}
          >
            <card.icon className="w-7 h-7 text-text-3 group-hover:text-brand-teal transition-colors mb-4" />
            <h3 className="text-[14px] font-semibold mb-1 text-text-1 group-hover:text-brand-teal transition-colors">{card.title}</h3>
            <p className="text-[12px] text-text-2 leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
`;

content = content.replace(/function Step4Tour\(\) \{[\s\S]*?\}\s*$/m, updatedStep4);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
