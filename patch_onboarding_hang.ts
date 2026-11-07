import fs from 'fs';
let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

const oldCode = `      if (auth && auth.currentUser && db) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
          await updateDoc(userRef, {
            onboardingComplete: true,
            zones: finalZones
          });
        } catch(e) {
          console.warn("Failed to update onboarding state", e);
        }
      }
      
      // Navigate to the AI Assistant for the new project
      navigate(\`/project/\${projectId}/assistant\`);`;

const newCode = `      // Navigate FIRST so the user doesn't wait for Firestore
      navigate(\`/project/\${projectId}/assistant\`);

      if (auth && auth.currentUser && db) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        updateDoc(userRef, {
          onboardingComplete: true,
          zones: finalZones
        }).catch(e => {
          console.warn("Failed to update onboarding state", e);
        });
      }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
