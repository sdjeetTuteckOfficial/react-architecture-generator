import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Define available image filenames stored in /public/images/
export const AVAILABLE_IMAGES = [
  'React.png',
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
  'AWS-Step-Functions.svg',
  'AWS-Identity-and-Access-Management.svg',
  'Amazon-Cognito.svg',
  'AWS-Fargate.svg',
  'AWS-Lambda.svg',
  'Amazon-Simple-Email-Service.svg',
  'Amazon-Simple-Notification-Service.svg',
  'Amazon-Elastic-Load-Balancing.svg',
  'Amazon-API-Gateway.svg',
  'Amazon-CloudFront.svg',
];

// Create a prompt dynamically including the image options
const createPrompt = (userPrompt) => {
  const imageList = AVAILABLE_IMAGES.map((img) => `- "${img}"`).join('\n');
  return `You are a system that generates architecture diagrams compatible with React Flow, and your output must be a valid JSON object with the following structure:

nodes: array of node objects. Each node includes:

id: a unique identifier (string)

data: object with:

label: a human-readable name (string)

image (optional): a string from the allowed image list

position: object with { x, y } coordinates

edges: array of edge objects. Each edge includes:

id: a unique identifier (string)

source: the ID of the source node

target: the ID of the target node

Additional constraints:

Use only the following predefined image values for data.image:
${imageList}

Do not include the user's prompt as a node.

Output must be a valid JSON object, with no markdown or text explanations.

Now generate a React Flow-compatible architecture diagram in JSON for this system description:
"${userPrompt}"`;

  //   return `
  // You are an assistant that returns React Flow-compatible architecture diagrams in JSON.

  // The JSON must include:
  // - nodes: array of objects with { id, data: { label, image (optional) }, position: { x, y } }
  // - edges: array of objects with { id, source, target }

  // Use \`data.image\` field to assign an image (optional). Only use the following images:

  // ${imageList}

  // Do **not** include the user prompt itself as a node.

  // Return only valid JSON format, without markdown or code block formatting.

  // Now generate the architecture for:
  // "${userPrompt}"
  // `;
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
