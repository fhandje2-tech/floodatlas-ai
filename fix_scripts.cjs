const fs = require('fs');
let file = fs.readFileSync('package.json', 'utf8');

file = file.replace(/"dev": "vite --port=3000 --host=0.0.0.0",/,
  '"dev": "tsx server.ts",');
  
file = file.replace(/"build": "vite build",/,
  '"build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",\n    "start": "node dist/server.cjs",');

fs.writeFileSync('package.json', file);
