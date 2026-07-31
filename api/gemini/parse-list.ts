import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'placeholder' });

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    console.log('[DEBUG Serverless] Raw voice/text input received:', text);

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
    console.log('[DEBUG Serverless] Gemini raw JSON response:', jsonStr);
    
    const parsed = JSON.parse(jsonStr);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error parsing list:', error);
    return res.status(500).json({ error: 'Failed to parse list' });
  }
}
