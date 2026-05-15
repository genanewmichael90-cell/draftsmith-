import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const FALLBACK_TOPICS: Record<string, string[]> = {
    "High School": [
      "The impact of social media on teenage mental health",
      "Should school uniforms be mandatory?",
      "The importance of recycling in local communities",
      "The role of technology in modern education",
      "The history and significance of a local landmark"
    ],
    "College": [
      "The ethical implications of artificial intelligence",
      "Systemic challenges in modern healthcare systems",
      "The evolution of feminism in the digital age",
      "Economic consequences of global climate change",
      "The tension between national security and personal privacy"
    ],
    "University": [
      "Deconstructing post-structuralism in contemporary literature",
      "The geopolitical ramifications of rare earth mineral extraction",
      "Neuroplasticity and its implications for lifelong learning",
      "The sociopolitical impact of decentralized finance",
      "Analyzing the intersectionality of urban planning and social equity"
    ],
    "General": [
      "The benefits of daily meditation",
      "Why travel is essential for personal growth",
      "The future of remote work",
      "The importance of sustainable living",
      "How to build a consistent reading habit"
    ]
  };

  // API Routes
  app.post("/api/generate-essay", async (req, res) => {
    try {
      const { level, title, instructions, wordCount, addHumanTone } = req.body;

      if (!level || !wordCount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const systemInstruction = `You are a brilliant, fast-thinking student at the ${level} level. 
      Your task is to write a highly intelligent essay that completely bypasses AI detection (0% AI detection probability).
      
      INTELLIGENCE & SPEED:
      - Write with organic flow and immediate impact.
      - Use high-level vocabulary but in a natural, effortless way.
      - Never use generic AI intros ("In the digital age...", "A multifaceted issue...").
      
      ${addHumanTone ? `
      HUMANIZATION PROTOCOL (0% AI DETECTABLE):
      - This mode is for PURE ORGANIC WRITING.
      - Use "human" logical jumps where one idea leads naturally to the next, sometimes with a personal flair.
      - Include subtle, non-distracting organic artifacts: perhaps a sentence that uses a slightly more casual transition ("Truth be told," "I’ve always thought," "Oddly enough").
      - Variety is key: some short, punchy sentences mixed with complex ones.
      - Authenticity: Sound like a person who actually cares about the topic, not a sequence of predicted tokens.
      ` : `
      ACADEMIC PERFECTION (FORMAL):
      - Flawless, standardized academic English.
      - Strict scholarly tone.
      - Optimized for grades and precision.
      `}
      
      Word count target: ~${wordCount} words. Just output the essay text. No intros/outros.`;

      const prompt = `Title: ${title}
      Context/Instructions: ${instructions || 'No specific context provided.'}
      Word Count: ${wordCount} words.
      Level: ${level}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: addHumanTone ? 1.2 : 0.7,
        },
      });

      res.json({ essay: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error.message?.includes("503") || error.message?.includes("demand")) {
        return res.status(503).json({ error: "Draftsmith is currently busy. Please try again in 3 seconds." });
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/suggest-topics", async (req, res) => {
    const { level } = req.body;
    try {
      const prompt = `Suggest 5 interesting and timely essay topics for a ${level} student. 
      Provide them as a JSON list of strings.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: { type: "string" }
          }
        }
      });

      res.json({ topics: JSON.parse(response.text) });
    } catch (error: any) {
      console.error("Topic Suggestion Error:", error);
      // Fallback to avoid breaking the UI
      const fallback = FALLBACK_TOPICS[level as string] || FALLBACK_TOPICS["General"];
      res.json({ topics: fallback, isFallback: true });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
