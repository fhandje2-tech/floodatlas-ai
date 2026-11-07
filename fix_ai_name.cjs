const fs = require('fs');

let file = fs.readFileSync('src/screens/AIAssistant.tsx', 'utf8');

if (!file.includes("import { auth } from")) {
  file = file.replace(/import \{ Link, useNavigate \} from "react-router";/, 'import { Link, useNavigate } from "react-router";\nimport { auth } from "../../src/services/firebase";'); // wait, the path to firebase is '../services/firebase'
  file = file.replace(/import \{ auth \} from "\.\.\/\.\.\/src\/services\/firebase";/, 'import { auth } from "../services/firebase";');
}

file = file.replace(/\{msg.content\}/, '{msg.id === "welcome" ? msg.content.replace("Fabien", auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "User") : msg.content}');

fs.writeFileSync('src/screens/AIAssistant.tsx', file);
