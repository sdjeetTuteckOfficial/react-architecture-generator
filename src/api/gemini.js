import axios from 'axios';
import {
  AWS_AVAILABLE_IMAGES,
  AZURE_AVAILABLE_IMAGES,
  local_images,
} from '../constants/images_constants'; // Assuming this path is correct

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Create a prompt dynamically including all image options
const createPrompt = (userPrompt) => {
  // Combine all images into a single array
  const allAvailableImages = [
    ...AWS_AVAILABLE_IMAGES,
    ...AZURE_AVAILABLE_IMAGES,
    ...local_images,
  ];

  const imageList = allAvailableImages.map((img) => `- "${img}"`).join('\n');

  return `
  You are an assistant that returns React Flow-compatible architecture diagrams in JSON.

  The JSON must include:
  - nodes: array of objects with { id, data: { label, image (optional) }, position: { x, y } }
  - edges: array of objects with { id, source, target }

  Use \`data.image\` field to assign an image (optional). Only use the following images:

  ${imageList}

  Do **not** include the user prompt itself as a node.

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
