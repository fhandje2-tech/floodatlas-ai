const fs = require('fs');

let file = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');

if (!file.includes("auth } from")) {
  file = file.replace(/import \{ Link \} from "react-router";/, 'import { Link } from "react-router";\nimport { auth } from "../services/firebase";');
}

file = file.replace(/\{greeting\}, Fabien\./, '{greeting}, {auth?.currentUser?.displayName?.split(" ")[0] || auth?.currentUser?.email?.split("@")[0] || "User"}.');

fs.writeFileSync('src/screens/DashboardHome.tsx', file);
