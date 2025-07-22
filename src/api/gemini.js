// src/api/gemini.js
import axios from 'axios';
import {
  AWS_AVAILABLE_IMAGES,
  AZURE_AVAILABLE_IMAGES,
  local_images,
} from '../constants/images_constants'; // Assuming this path is correct

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Combine all images into a single array for architecture diagrams
const allAvailableImages = [
  ...AWS_AVAILABLE_IMAGES,
  ...AZURE_AVAILABLE_IMAGES,
  ...local_images,
];

const imageList = allAvailableImages.map((img) => `- "${img}"`).join('\n');

// Function to create prompts dynamically based on diagram type
const createPrompt = (userPrompt, diagramType) => {
  if (diagramType === 'architecture') {
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
  } else if (diagramType === 'db_diagram') {
    return `
You are an assistant that returns React Flow-compatible database schema diagrams in JSON.

The JSON must include:
- nodes: array of objects, each representing a database table.
- edges: array of objects, representing relationships between tables.

Each node (table) object must have the following structure:
{
  id: 'unique_table_id_lowercase_snake_case', // e.g., 'users', 'products'
  data: {
    label: 'Table Name', // e.g., 'Users', 'Products'
    fields: [ // Array of column objects
      {
        name: 'column_name', // e.g., 'id', 'username', 'product_id'
        type: 'SQL_TYPE',    // e.g., 'INT', 'VARCHAR(255)', 'TIMESTAMP', 'BOOLEAN', 'TEXT'
        primaryKey: boolean, // true if it's a primary key
        foreignKey: boolean, // true if it's a foreign key
        references: 'referenced_table_id.referenced_column_name' // Required if foreignKey is true, e.g., 'users.id'
      },
      // ... more field objects
    ]
  },
  position: { x: number, y: number } // Coordinates for the node
}

Each edge (relationship) object must have the following structure:
{
  id: 'unique_edge_id', // e.g., 'edge-users-orders'
  source: 'source_table_id',
  target: 'target_table_id',
  type: 'smoothstep', // Recommended for clean lines
  animated: true,    // Recommended for visual clarity
  markerEnd: { type: 'arrowclosed' } // Recommended for direction
}

Ensure that foreign key relationships are correctly represented by both:
1.  Setting \`foreignKey: true\` and \`references: 'table_id.column_name'\` in the field definition of the child table.
2.  Creating an edge from the child table's ID to the parent table's ID.

Do **not** include the user prompt itself as a node.
Return only valid JSON format, without markdown or code block formatting.

Example:
For a prompt like "users and their orders", generate:
[
  {
    "id": "users",
    "data": {
      "label": "Users",
      "fields": [
        { "name": "id", "type": "INT", "primaryKey": true, "foreignKey": false },
        { "name": "username", "type": "VARCHAR(50)", "primaryKey": false, "foreignKey": false, "unique": true },
        { "name": "email", "type": "VARCHAR(100)", "primaryKey": false, "foreignKey": false }
      ]
    },
    "position": { "x": 0, "y": 0 }
  },
  {
    "id": "orders",
    "data": {
      "label": "Orders",
      "fields": [
        { "name": "id", "type": "INT", "primaryKey": true, "foreignKey": false },
        { "name": "user_id", "type": "INT", "primaryKey": false, "foreignKey": true, "references": "users.id" },
        { "name": "order_date", "type": "TIMESTAMP", "primaryKey": false, "foreignKey": false },
        { "name": "total_amount", "type": "DECIMAL(10,2)", "primaryKey": false, "foreignKey": false }
      ]
    },
    "position": { "x": 300, "y": 0 }
  }
]
And edges for the example:
[
  {
    "id": "edge-users-orders",
    "source": "users",
    "target": "orders",
    "type": "smoothstep",
    "animated": true,
    "markerEnd": { "type": "arrowclosed" }
  }
]

Now generate the database schema for:
"${userPrompt}"
`;
  }
  // Default to architecture if an unknown type is provided
  return createPrompt(userPrompt, 'architecture');
};

// Function to call Gemini API and return parsed diagram JSON
export const fetchDiagramJSON = async (userPrompt, diagramType) => {
  const prompt = createPrompt(userPrompt, diagramType);

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
