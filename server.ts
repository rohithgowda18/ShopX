import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'placeholder' });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  // Refined Prompt for parsing unstructured/semi-structured voice transcription or images of lists
  const systemPrompt = `You are an expert AI assistant for Namma Angadi (local grocery shopping application for Indian households).
Your task is to parse unstructured grocery lists from speech transcripts (transcribed in English, Hindi, Kannada, or mixed language) or OCR image text, and extract a structured array of grocery items.

Analyze the text and extract items. For each item, you must output:
1. "name": The normalized English name of the product. Match it closely to standard Indian grocery names (e.g. Sona Masoori Rice, Wheat Flour (Atta), Idli Rice, Milk, Onion, Potato, Tomato, Sunflower Oil, Sugar, Salt, Maggi Noodles, Bath Soap).
2. "quantity": A numeric value representing the quantity. Convert fractions/written numbers to decimals (e.g. "half" -> 0.5, "one and a half" -> 1.5, "three" -> 3).
3. "unit": The unit of measurement. It MUST be one of: 'kg', 'g', 'litre', 'ml', 'packet', 'piece', 'dozen', 'box'.

Normalization rules for common Indian terms:
- "akki", "chawal" -> "Sona Masoori Rice" (unless specified otherwise like Basmati)
- "halu", "doodh" -> "Milk"
- "neeru", "paani" -> "Water Bottle"
- "savala", "ullagaddi", "pyaz" -> "Onion"
- "batate", "aaloo" -> "Potato"
- "enne", "tel" -> "Sunflower Oil"
- "sakkare", "cheeni" -> "Sugar"
- "uppu", "namak" -> "Salt"
- "saboonu", "sabun" -> "Bath Soap"
- "bele", "dal" -> "Toor Dal"

If no quantity or unit is specified, use a reasonable default (e.g., quantity: 1, unit: 'piece' or default product unit).
Return ONLY a valid JSON array of objects. Do not include markdown code block syntax (like \`\`\`json).

Example output:
[
  {"name": "Sona Masoori Rice", "quantity": 2, "unit": "kg"},
  {"name": "Milk", "quantity": 1, "unit": "litre"},
  {"name": "Bath Soap", "quantity": 3, "unit": "piece"},
  {"name": "Onion", "quantity": 0.5, "unit": "kg"},
  {"name": "Maggi Noodles", "quantity": 2, "unit": "packet"}
]`;

  app.post('/api/gemini/parse-list', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text input is required' });
      }

      console.log('[DEBUG Server] Raw voice/text input received:', text);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Input list to parse: "${text}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const jsonStr = (response.text || '[]').trim();
      console.log('[DEBUG Server] Gemini raw JSON response:', jsonStr);
      
      const parsed = JSON.parse(jsonStr);
      console.log('[DEBUG Server] Parsed items returned to client:', parsed);
      
      res.json(parsed);
    } catch (error) {
      console.error('Error parsing list:', error);
      res.status(500).json({ error: 'Failed to parse list' });
    }
  });

  app.post('/api/gemini/parse-image', async (req, res) => {
    try {
      const { base64Image, mimeType } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: 'Image is required' });
      }

      console.log('[DEBUG Server] Image parsing request received');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: "Parse all items, quantities, and units from this image (handwritten grocery lists, printed lists, bills/receipts, or WhatsApp screenshots)." },
          { inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } }
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const jsonStr = (response.text || '[]').trim();
      console.log('[DEBUG Server] Gemini raw Image JSON response:', jsonStr);

      const parsed = JSON.parse(jsonStr);
      console.log('[DEBUG Server] Parsed Image items returned to client:', parsed);

      res.json(parsed);
    } catch (error) {
      console.error('Error parsing image:', error);
      res.status(500).json({ error: 'Failed to parse image' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      const altPort = PORT + 1;
      console.log(`Port ${PORT} is busy, retrying on http://localhost:${altPort}...`);
      app.listen(altPort, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${altPort}`);
      });
    } else {
      console.error(err);
    }
  });
}

startServer();
