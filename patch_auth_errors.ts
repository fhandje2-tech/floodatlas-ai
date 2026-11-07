import fs from 'fs';
let content = fs.readFileSync('src/screens/AuthScreen.tsx', 'utf8');

// Add translation strings for the errors
content = content.replace(
  'emailReq: "Please enter your email address.",',
  'emailReq: "Please enter your email address.",\n    errInvalidCred: "Invalid email or password.",\n    errEmailInUse: "Email already registered. Sign in instead?",'
);
content = content.replace(
  'emailReq: "Veuillez entrer votre adresse email.",',
  'emailReq: "Veuillez entrer votre adresse email.",\n    errInvalidCred: "Email ou mot de passe invalide.",\n    errEmailInUse: "Email déjà utilisé. Connectez-vous plutôt ?",'
);
content = content.replace(
  'emailReq: "Bitte geben Sie Ihre E-Mail-Adresse ein.",',
  'emailReq: "Bitte geben Sie Ihre E-Mail-Adresse ein.",\n    errInvalidCred: "Ungültige E-Mail oder Passwort.",\n    errEmailInUse: "E-Mail bereits registriert. Stattdessen anmelden?",'
);
content = content.replace(
  'emailReq: "الرجاء إدخال عنوان البريد الإلكتروني.",',
  'emailReq: "الرجاء إدخال عنوان البريد الإلكتروني.",\n    errInvalidCred: "البريد الإلكتروني أو كلمة المرور غير صالحة.",\n    errEmailInUse: "البريد الإلكتروني مسجل بالفعل. تسجيل الدخول بدلاً من ذلك؟",'
);

// Update mapFirebaseError to use translations and handle auth/invalid-credential
const newMapFirebaseError = `const mapFirebaseError = (errCode: string, fallbackMessage?: string) => {
    const t = translations[language] || translations.en;
    switch (errCode) {
      case "auth/user-not-found": return { field: "email", message: t.errInvalidCred || "Invalid credentials." };
      case "auth/wrong-password": return { field: "password", message: t.errInvalidCred || "Invalid credentials." };
      case "auth/invalid-credential": return { message: t.errInvalidCred || "Invalid email or password." };
      case "auth/email-already-in-use": return { field: "email", message: t.errEmailInUse || "Already registered. Sign in instead?" };
      case "auth/network-request-failed": return { message: "Check your connection and try again." };
      case "auth/unauthorized-domain": return { message: \`Domain not authorized. Please add "\${window.location.hostname}" to Authorized Domains in Firebase Console (Authentication > Settings).\` };
      case "auth/configuration-not-found": return { message: "Sign-in method not enabled in Firebase Console. Please enable Email/Password and Google sign-in." };
      case "auth/operation-not-allowed": return { message: "Sign-in method not enabled in Firebase Console. Please enable Email/Password and Google sign-in." };
      case "auth/popup-closed-by-user": return { message: "Sign-in popup was closed." };
      default: return { message: fallbackMessage || errCode || "An unexpected error occurred." };
    }
  };`;

content = content.replace(
  /const mapFirebaseError = \(errCode: string, fallbackMessage\?: string\) => \{[\s\S]*?default: return \{ message: fallbackMessage \|\| errCode \|\| "An unexpected error occurred\." \};\n    \}\n  \};/g,
  newMapFirebaseError
);

fs.writeFileSync('src/screens/AuthScreen.tsx', content);
