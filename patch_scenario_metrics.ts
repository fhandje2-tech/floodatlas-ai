import fs from 'fs';
let content = fs.readFileSync('src/components/panels/ScenarioPanel.tsx', 'utf8');

const oldCompute = `  const computeMetrics = (levers: string[]) => {
    let runoff = 0;
    let peak = 0;
    let infil = 0;
    let cost = 0;
    
    levers.forEach(lId => {
      const l = LEVERS.find(x => x.id === lId)!;
      runoff += l.runoff;
      peak += l.peak;
      infil += l.infiltration;
      cost += l.cost;
    });

    runoff = Math.min(85, runoff * 0.8);
    peak = Math.min(90, peak * 0.85);
    infil = Math.min(95, infil * 0.9);

    const score = Math.round((runoff + peak + infil) / 3);
    const resilience = Math.min(100, score + 20);

    return { runoff: Math.round(runoff), peak: Math.round(peak), infiltration: Math.round(infil), cost, score, resilience };
  };`;

const newCompute = `  const computeMetrics = (levers: string[]) => {
    let runoff = 0;
    let peak = 0;
    let infil = 0;
    let cost = 0;
    
    // Adjust base calculation depending on activeZone
    const text = (activeZone || "").toLowerCase();
    let isDenseUrban = false;
    let isNature = false;
    if (text.includes("paris") || text.includes("genève") || text.includes("centre") || text.includes("ville")) isDenseUrban = true;
    if (text.includes("bafoussam") || text.includes("forêt") || text.includes("parc")) isNature = true;

    levers.forEach(lId => {
      const l = LEVERS.find(x => x.id === lId)!;
      // In dense urban areas, costs are higher and infiltration is harder to gain
      let r = l.runoff * (isDenseUrban ? 0.7 : (isNature ? 1.2 : 1));
      let p = l.peak * (isDenseUrban ? 0.8 : (isNature ? 1.1 : 1));
      let i = l.infiltration * (isDenseUrban ? 0.6 : (isNature ? 1.5 : 1));
      let c = l.cost * (isDenseUrban ? 1.8 : (isNature ? 0.6 : 1));
      
      runoff += r;
      peak += p;
      infil += i;
      cost += c;
    });

    runoff = Math.min(isDenseUrban ? 60 : 90, runoff);
    peak = Math.min(isDenseUrban ? 65 : 95, peak);
    infil = Math.min(isDenseUrban ? 55 : 98, infil);

    const baseResilience = isDenseUrban ? 15 : (isNature ? 40 : 25);
    const score = Math.round((runoff + peak + infil) / 3);
    const resilience = Math.min(100, Math.round(score + baseResilience));

    return { runoff: Math.round(runoff), peak: Math.round(peak), infiltration: Math.round(infil), cost: Math.round(cost), score, resilience };
  };`;

content = content.replace(oldCompute, newCompute);

const oldOptimalCall = `const optimalMetrics = computeMetrics(OPTIMAL_LEVERS);`;
const newOptimalCall = `const optimalMetrics = computeMetrics(
    (() => {
      const text = (activeZone || "").toLowerCase();
      if (text.includes("paris") || text.includes("genève") || text.includes("centre") || text.includes("ville")) return ['desealing', 'roofs', 'permeable', 'swales'];
      if (text.includes("bafoussam") || text.includes("forêt") || text.includes("parc")) return ['swales', 'basins', 'expansion', 'daylighting'];
      return OPTIMAL_LEVERS;
    })()
  );`;
  
content = content.replace(oldOptimalCall, newOptimalCall);

fs.writeFileSync('src/components/panels/ScenarioPanel.tsx', content);
console.log("Scenario metrics patched");
