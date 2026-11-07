import fs from 'fs';

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

// Replace the problematic useEffect and loading state
const oldUseEffectRegex = /useEffect\(\(\) => \{\n\s*let unsubscribe: any;\n\s*const fetchUserData = async \(user: any\) => \{[\s\S]*?return \(\) => \{\n\s*if \(unsubscribe\) unsubscribe\(\);\n\s*\};\n\s*\}, \[\]\);/;

const newUseEffect = `
  const [initError, setInitError] = useState<string | null>(null);

  const checkAuthAndData = () => {
    setLoading(true);
    setInitError(null);
    let unsubscribe: any;
    
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user || !db) {
          setLoading(false);
          return;
        }
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setName(userData.name || user.displayName || "User");
            setRole(userData.role || "Collectivité");
            if (userData.zones && Array.isArray(userData.zones)) {
              setZones(userData.zones);
            }
          } else {
            setName(user.displayName || "User");
          }
          setLoading(false);
        } catch (e) {
          console.error("Error fetching user data", e);
          setInitError("Erreur de connexion aux données. Veuillez réessayer.");
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    return unsubscribe;
  };

  useEffect(() => {
    const unsub = checkAuthAndData();
    return () => {
      if (unsub) unsub();
    };
  }, []);
`;

content = content.replace(oldUseEffectRegex, newUseEffect);

// Replace the loading render
const oldLoadingRegex = /if \(loading\) \{[\s\S]*?\}\n/;
const newLoadingRender = `
  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (initError) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center text-text-1">
        <div className="w-12 h-12 mb-4 text-brand-red"><AlertCircle className="w-full h-full" /></div>
        <p className="mb-4">{initError}</p>
        <Button onClick={() => checkAuthAndData()}>Réessayer</Button>
      </div>
    );
  }
`;

content = content.replace(oldLoadingRegex, newLoadingRender);

// Also need to import AlertCircle if not already imported
if (!content.includes('AlertCircle')) {
  content = content.replace('import { Search', 'import { AlertCircle, Search');
}

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content);
