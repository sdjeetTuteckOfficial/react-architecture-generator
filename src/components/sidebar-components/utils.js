export const handleDragStart = (
  event,
  nodeType,
  imageSrc = null,
  imageName = null
) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  if (imageSrc) {
    event.dataTransfer.setData('image/src', imageSrc);
  }
  if (imageName) {
    event.dataTransfer.setData('image/name', imageName);
  }
  event.dataTransfer.effectAllowed = 'move';
};

export const handleLogout = (navigate) => {
  console.log('User logged out!');
  localStorage.clear();
  navigate('/login');
};

export const generateSQLWithGemini = async (databaseType, diagramData) => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  try {
    const prompt = `
      Generate SQL DDL (Data Definition Language) statements for ${databaseType} database based on the following diagram structure:
      
      Nodes: ${JSON.stringify(diagramData.nodes, null, 2)}
      Edges: ${JSON.stringify(diagramData.edges, null, 2)}
      
      Please create:
      1. CREATE TABLE statements for each entity
      2. Primary and foreign key constraints
      3. Appropriate data types for ${databaseType}
      4. Index suggestions where appropriate
      5. Comments explaining the structure
      
      Format the output as clean, executable SQL statements.
    `;

    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No SQL generated';
  } catch (error) {
    console.error('Error generating SQL:', error);
    throw error;
  }
};

export const downloadTextFile = (content, filename) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const getImageName = (filename) => {
  return filename.split('.')[0];
};

export const handleImageError = (e) => {
  e.target.style.display = 'none';
  if (e.target.nextSibling) {
    e.target.nextSibling.style.opacity = '1';
    e.target.nextSibling.style.display = 'flex';
  }
};
