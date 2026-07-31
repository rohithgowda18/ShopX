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

  const systemPrompt = `You are an AI assistant for Indian grocery stores.
Understand Kannada, English, Hindi and mixed language.
Extract grocery items.
Correct spelling mistakes.
Normalize local names.
Return ONLY JSON.

Example output
[
  {
    "name":"Rice",
    "quantity":2,
    "unit":"kg"
  },
  {
    "name":"Sugar",
    "quantity":1,
    "unit":"kg"
  }
]`;

  app.post('/api/gemini/parse-list', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text input is required' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const jsonStr = response.text || '[]';
      res.json(JSON.parse(jsonStr));
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: "Parse this handwritten grocery list." },
          { inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } }
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const jsonStr = response.text || '[]';
      res.json(JSON.parse(jsonStr));
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
