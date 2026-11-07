const content = `👋 **Bienvenue Utilisateur !**

Votre espace de travail pour **mon territoire** est prêt. En tant que décideur, votre rôle est essentiel pour adapter votre territoire face au dérèglement climatique.

Je suis l'IA de FloodAtlas, votre conseiller stratégique. Je vais vous accompagner pour :
- **Diagnostiquer** les zones vulnérables (inondations, îlots de chaleur)
- **Concevoir** des aménagements "Ville Éponge" (désimperméabilisation, noues)
- **Simuler** l'impact et évaluer les coûts (CAPEX/OPEX)

Par quoi souhaitez-vous que l'on commence ?`;

const textWithoutActionsAndSources = content.replace(/ACTION:[^\n]+/g, '').replace(/\*\*Sources:\*\*[\s\S]*?(?=\n\n|$)/, '').trim();
console.log(textWithoutActionsAndSources);
