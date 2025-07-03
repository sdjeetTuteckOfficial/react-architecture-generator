// api/gemini.js
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const createPrompt = (userPrompt) => `
You are an assistant that returns React Flow-compatible architecture diagrams in JSON.

The JSON must include:
- nodes: array of objects with { id, data: { label }, position: { x, y } }
- edges: array of objects with { id, source, target }

Add one additional node with the label: "User Prompt: ${userPrompt}"

Return only JSON format, nothing else.
Now generate the architecture for:
"${userPrompt}"
`;

export const fetchArchitectureJSON = async (userPrompt) => {
  const prompt = createPrompt(userPrompt);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios.post(
    url,
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  try {
    // Remove markdown code block if present
    const cleanJsonString = raw
      .replace(/^```json\s*/, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    return JSON.parse(cleanJsonString);
  } catch (err) {
    console.error('Error parsing JSON from Gemini:', err);
    throw err;
  }
};
