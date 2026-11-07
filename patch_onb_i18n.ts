import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

// Step 1
content = content.replace(
  /<h2 className="font-display font-bold text-3xl mb-3">Welcome to FloodAtlas AI, \{name \|\| auth\?\.currentUser\?\.displayName\?\.split\(" "\)\[0\] \|\| auth\?\.currentUser\?\.email\?\.split\("@"\)\[0\] \|\| "User"\}\.<\/h2>/,
  '<h2 className="font-display font-bold text-3xl mb-3">{language === "en" ? `Welcome to FloodAtlas AI, ${name || "User"}.` : `Bienvenue sur FloodAtlas IA, ${name || "Utilisateur"}.`}</h2>'
);
content = content.replace(
  '<p className="text-text-2 mb-10">Let\'s set up your workspace in 2 minutes.</p>',
  '<p className="text-text-2 mb-10">{language === "en" ? "Let\'s set up your workspace in 2 minutes." : "Configurons votre espace de travail en 2 minutes."}</p>'
);
content = content.replace(
  '<p className="text-sm font-medium mb-3">We set up your profile as <span className="text-brand-blue">{role || "Municipality"}</span>.</p>',
  '<p className="text-sm font-medium mb-3">{language === "en" ? "We set up your profile as " : "Nous avons configuré votre profil comme "}<span className="text-brand-blue">{role || (language === "en" ? "Municipality" : "Collectivité")}</span>.</p>'
);
content = content.replace(
  'Your workspace includes: territory risk mapping, automated reports for elected officials, and scenario simulations for urban planning decisions.',
  '{language === "en" ? "Your workspace includes: territory risk mapping, automated reports for elected officials, and scenario simulations for urban planning decisions." : "Votre espace de travail inclut : cartographie des risques, rapports automatisés pour les élus, et simulation de scénarios d\'aménagement."}'
);

// Step 2
content = content.replace(
  '<h2 className="font-display font-bold text-2xl mb-2">Where do you work?</h2>',
  '<h2 className="font-display font-bold text-2xl mb-2">{language === "en" ? "Where do you work?" : "Sur quelle zone travaillez-vous ?"}</h2>'
);
content = content.replace(
  '<p className="text-text-2 text-sm mb-8">Add up to 5 zones. We\'ll pre-load risk data for each.</p>',
  '<p className="text-text-2 text-sm mb-8">{language === "en" ? "Add up to 5 zones. We\'ll pre-load risk data for each." : "Ajoutez jusqu\'à 5 zones. Nous pré-chargerons les données de risque pour chacune."}</p>'
);
content = content.replace(
  /Search address/g,
  '{language === "en" ? "Search address" : "Rechercher une adresse"}'
);
content = content.replace(
  /Upload file/g,
  '{language === "en" ? "Upload file" : "Importer un fichier"}'
);
content = content.replace(
  'placeholder="Search an address, municipality, or enter custom name..."',
  'placeholder={language === "en" ? "Search an address, municipality, or enter custom name..." : "Rechercher une adresse, commune, ou nom personnalisé..."}'
);
content = content.replace(
  '<p className="text-[13px] text-text-3">Type a location to search, or press Enter to add a custom zone.</p>',
  '<p className="text-[13px] text-text-3">{language === "en" ? "Type a location to search, or press Enter to add a custom zone." : "Tapez un lieu pour rechercher, ou Entrée pour ajouter une zone personnalisée."}</p>'
);
content = content.replace(
  '<p className="text-sm text-text-2 mb-1">Drag and drop your GeoJSON or SHP file here</p>',
  '<p className="text-sm text-text-2 mb-1">{language === "en" ? "Drag and drop your GeoJSON or SHP file here" : "Glissez-déposez votre fichier GeoJSON ou SHP ici"}</p>'
);
content = content.replace(
  '<p className="text-xs text-text-3 mb-4">Maximum file size 50MB</p>',
  '<p className="text-xs text-text-3 mb-4">{language === "en" ? "Maximum file size 50MB" : "Taille maximum 50Mo"}</p>'
);
content = content.replace(
  /Browse Files/g,
  '{language === "en" ? "Browse Files" : "Parcourir les fichiers"}'
);
content = content.replace(
  '<span className="text-[12px] text-text-3 italic">No zones selected yet.</span>',
  '<span className="text-[12px] text-text-3 italic">{language === "en" ? "No zones selected yet." : "Aucune zone sélectionnée."}</span>'
);


// Step 3
content = content.replace(
  '<h2 className="font-display font-bold text-2xl mb-2">Quelles sont vos priorités territoriales ?</h2>',
  '<h2 className="font-display font-bold text-2xl mb-2">{language === "en" ? "What are your territorial priorities?" : "Quelles sont vos priorités territoriales ?"}</h2>'
);
content = content.replace(
  '<p className="text-text-2 text-sm mb-8">Ces choix personnaliseront les recommandations "Ville Éponge" de l\'IA FloodAtlas.</p>',
  '<p className="text-text-2 text-sm mb-8">{language === "en" ? "These choices will customize FloodAtlas AI\'s Sponge City recommendations." : "Ces choix personnaliseront les recommandations Ville Éponge de l\'IA."}</p>'
);
content = content.replace(
  /const priorityOptions = \[\n\s*"Réduction du risque inondation & ruissellement",\n\s*"Adaptation au changement climatique \(îlots de chaleur, biodiversité\)",\n\s*"Désimperméabilisation et reverdissement urbain",\n\s*"Qualité de vie et usages citoyens \(parcs, mobilités douces\)"\n\s*\];/,
  `const priorityOptions = language === "en" ? [
    "Flood & Runoff Risk Reduction",
    "Climate Change Adaptation (heat islands, biodiversity)",
    "De-sealing & Urban Greening",
    "Quality of Life & Citizens (parks, soft mobility)"
  ] : [
    "Réduction du risque inondation & ruissellement",
    "Adaptation au changement climatique (îlots de chaleur, biodiversité)",
    "Désimperméabilisation et reverdissement urbain",
    "Qualité de vie et usages citoyens (parcs, mobilités douces)"
  ];`
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
