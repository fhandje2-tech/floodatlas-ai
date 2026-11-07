import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

// Swallow error on data fetch so it doesn't block onboarding
const oldCatch = `        } catch (e) {
          console.error("Error fetching user data", e);
          setInitError("Erreur de connexion aux données. Veuillez réessayer.");
          setLoading(false);
        }`;
const newCatch = `        } catch (e) {
          console.error("Error fetching user data", e);
          // Don't block onboarding if firestore fails
          setLoading(false);
        }`;

content = content.replace(oldCatch, newCatch);

// Also remove the initError state entirely if not needed, or just let it be null.
// Let's just update the catch block.

// Change button text
const oldBtn = '{step === STEPS ? (language === "en" ? "Open my dashboard" : "Ouvrir mon tableau de bord") : (language === "en" ? "Continue" : "Continuer")}';
const newBtn = '{step === STEPS ? (language === "en" ? "Start" : "Commencer") : (language === "en" ? "Continue" : "Continuer")}';
content = content.replace(oldBtn, newBtn);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
