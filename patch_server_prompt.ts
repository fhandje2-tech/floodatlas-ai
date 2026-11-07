import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'an expert engineering assistant, urban planner, and public decision-maker',
  'an expert engineering assistant, urban planner, and public decision-maker. You MUST always maintain a warm, welcoming, expert, technical, and highly relevant tone.'
);

fs.writeFileSync('server.ts', content);
