import fs from 'fs';

let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

// Ensure onAuthStateChanged is imported
if (!content.includes('onAuthStateChanged')) {
  content = content.replace(
    'import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";',
    'import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";'
  );
}

const authEffect = `
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!db) {
          navigate("/dashboard");
          return;
        }
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.onboardingComplete) {
              navigate("/dashboard");
            } else {
              useAgentStore.getState().setRole(data.role || "Collectivité");
              navigate("/onboarding");
            }
          } else {
            navigate("/onboarding");
          }
        } catch (err) {
          console.error("Error auto-login:", err);
          navigate("/dashboard");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);
`;

content = content.replace(
  '// Switch role text based on language',
  authEffect + '\n\n  // Switch role text based on language'
);

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
