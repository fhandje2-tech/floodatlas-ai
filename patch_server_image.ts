import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const generateImageEndpoint = `
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { scenario, location, prompt } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const basePrompt = prompt || \`A realistic, high-quality urban planning visualization of \${location} under a '\${scenario}' adaptation scenario. Emphasize sponge city elements like rain gardens, permeable pavements, and urban greenery. Cinematic lighting, architectural rendering style.\`;
      
      // We will use the standard Imagen 3 model via Gemini SDK
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: basePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9'
        }
      });
      
      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("No image generated.");
      }
      
      const base64Image = response.generatedImages[0].image.imageBytes;
      res.json({ image: \`data:image/jpeg;base64,\${base64Image}\` });
    } catch (err: any) {
      console.error("Image Gen Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
`;

content = content.replace(
  'app.listen(PORT, "0.0.0.0", () => {',
  generateImageEndpoint + '\n  app.listen(PORT, "0.0.0.0", () => {'
);

fs.writeFileSync('server.ts', content);
