# 🌊 FloodAtlas AI

**Plateforme d'intelligence territoriale et d'aide à la décision pour la résilience climatique, la prévention des inondations et le design de Villes Éponges.**

FloodAtlas AI permet aux élus, urbanistes, aménageurs et techniciens de diagnostiquer les vulnérabilités aux ruissellements, de simuler des aménagements fondés sur la nature (noues végétalisées, désimperméabilisation) et de piloter des plans d'adaptation chiffrés.

---

## 🌟 Points Forts & Fonctionnalités

- **🤖 Atlas (Allié de crise & co-pilote IA)** : Assistant stratégique vocal et textuel alimenté par Gemini, capable d'analyser vos fichiers SIG (`.geojson`, `.kml`), vos relevés pluviométriques (`.csv`) et vos rapports techniques (`.pdf`).
- **🗺️ Cartographie SIG Interactive** : Visualisation des zones inondables, cours d'eau, bassins versants et infrastructures critiques (hôpitaux, écoles, casernes, postes électriques via OpenStreetMap Nominatim).
- **💧 Simulateur "Ville Éponge"** : Évaluation de l'impact des leviers d'adaptation (désimperméabilisation de voiries et parkings, toitures végétalisées, noues) sur l'indice de résilience territoriale et chiffrage CAPEX/OPEX.
- **📍 Détection GPS & Autocomplétion intelligente** : Reconnaissance en 1 clic de la position territoriale de l'utilisateur ou recherche libre sur toutes les communes.
- **📊 Générateur de Notes de Synthèse** : Export de rapports d'aide à la décision conformes aux exigences des PLU, PPRN et compétences GEMAPI.
- **🌍 Multi-langues** : Support natif du Français, Anglais, Allemand et Arabe (avec gestion RTL).
- **🌗 Mode Sombre & Lumineux** : Palette douce et contrastée respectant les standards cartographiques.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS, Vite
- **Cartographie** : Mapbox GL JS / OpenStreetMap
- **Intelligence Artificielle** : Google Gen AI SDK (`gemini-3.8-flash`)
- **Backend / Proxy** : Node.js, Express (middlewares Vite)
- **Base de données & Auth** : Firebase Firestore & Firebase Authentication
- **Internationalisation** : i18next & react-i18next
- **Animations & Graphiques** : Lucide React, Motion, Canvas-confetti

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (v18+)
- Clé d'API Google Gemini (Google AI Studio)
- Projet Firebase (Firestore & Auth)

### Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-organisation/floodatlas-ai.git
cd floodatlas-ai
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```
Renseignez vos clés Firebase et votre clé Gemini :
```env
GEMINI_API_KEY=votre_cle_gemini
VITE_FIREBASE_API_KEY=votre_cle_firebase
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

4. Lancez le serveur de développement :
```bash
npm run dev
```
L'application est accessible sur `http://localhost:3000`.

---

## 🔒 Sécurité & Bonnes Pratiques Open Source

- **Protection des clés** : Aucune clé secrète n'est exposée côté client. Les appels Gemini transitent par l'endpoint sécurisé `/api/chat`.
- **Règles Firestore** : Les règles de sécurité (`firestore.rules`) garantissent que chaque utilisateur ne peut modifier que ses propres projets.
- **Quotas bienveillants (Starter Tier)** : Messages courtois multilingues en cas de pic de charge ou de plafond journalier, sans interruption des fonctionnalités cartographiques locales.

---

## 📄 Licence

Ce projet est sous licence [Apache 2.0](LICENSE).
