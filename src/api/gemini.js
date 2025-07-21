import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Define available image filenames stored in /public/images/
export const AVAILABLE_IMAGES = [
  'server.png',
  'database.png',
  'user.png',
  'cloud.png',
  'api.png',
  'frontend.png',
  'backend.png',
  'loadbalancer.png',
  'Amazon-Aurora.svg',
  'Amazon-DocumentDB.svg',
  'Amazon-ElastiCache.svg',
  'Amazon-DynamoDB.svg',
  'Amazon-RDS.svg',
  'Amazon-EC2.svg',
  'Amazon-S3.svg',
];

// Create a prompt dynamically including the image options
const createPrompt = (userPrompt) => {
  const imageList = AVAILABLE_IMAGES.map((img) => `- "${img}"`).join('\n');

  return `
You are an assistant that returns React Flow-compatible architecture diagrams in JSON.

The JSON must include:
- nodes: array of objects with { id, data: { label, image (optional) }, position: { x, y } }
- edges: array of objects with { id, source, target }

Use \`data.image\` field to assign an image (optional). Only use the following images:

${imageList}

Add one additional node with the label: "User Prompt: ${userPrompt}"

Return only valid JSON format, without markdown or code block formatting.

Now generate the architecture for:
"${userPrompt}"
`;
};

// Function to call Gemini API and return parsed architecture JSON
export const fetchArchitectureJSON = async (userPrompt) => {
  const prompt = createPrompt(userPrompt);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
    // Remove any markdown formatting
    const cleanJsonString = raw
      .replace(/^```json\s*/, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();
    console.log(JSON.parse(cleanJsonString));
    return JSON.parse(cleanJsonString);
  } catch (err) {
    console.error('Error parsing JSON from Gemini:', err);
    throw err;
  }
};
