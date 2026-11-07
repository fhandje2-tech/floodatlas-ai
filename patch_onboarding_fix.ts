import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

content = content.replace(
  /const finishOnboarding = \(\) => \{[\s\S]*?if \(loading\) \{/m,
  `const finishOnboarding = async () => {
    try {
      const { setZones, createProject, language } = useAgentStore.getState();
      const finalZones = zones.length > 0 ? zones : ["Paris, France"];
      setZones(finalZones);
      
      // Create project for the first zone and navigate to it
      const projectId = createProject(finalZones[0] || "Nouveau Territoire", finalZones[0] || null, language);
      
      if (auth && auth.currentUser && db) {
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
      
      // Navigate to dashboard since the button says "Open my dashboard"
      navigate("/dashboard");
    } catch (err) {
      console.warn("Error finishing onboarding:", err);
      navigate("/dashboard");
    }
  };

  if (loading) {`
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
