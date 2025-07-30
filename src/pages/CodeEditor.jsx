import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';

// This component assumes Tailwind CSS is configured in your project.

// Helper function to parse the generated markdown into a file structure
const parseGeneratedCode = (markdownText) => {
  const files = [];
  // Regex to match comments like "// src/app.js"
  const fileRegex = /^\/\/ (.+)\n/gm;
  let match;
  let lastIndex = 0;

  while ((match = fileRegex.exec(markdownText)) !== null) {
    const fullPath = match[1].trim();
    const startIndex = match.index + match[0].length;
    let endIndex = markdownText.indexOf('\n// ', startIndex);
    if (endIndex === -1) {
      endIndex = markdownText.length;
    }

    const content = markdownText.substring(startIndex, endIndex).trim();
    const pathParts = fullPath.split('/');
    const fileName = pathParts.pop();
    const fileExtension = fileName.split('.').pop();

    let language = 'javascript';
    if (fileExtension === 'json') {
      language = 'json';
    } else if (fileExtension === 'sql') {
      language = 'sql';
    } else if (fileExtension === 'md') {
      language = 'markdown';
    }

    files.push({
      id: fullPath,
      path: fullPath,
      name: fileName,
      content: content,
      language: language,
    });
    lastIndex = endIndex;
  }
  return files;
};

// Component to render a simplified file tree
const FileTree = ({ files, activeFileId, onFileSelect }) => {
  // Organize files into a tree structure
  const tree = {};

  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = tree;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = { ...file, type: 'file' };
      } else {
        if (!current[part]) {
          current[part] = { type: 'directory', children: {} };
        }
        current = current[part].children;
      }
    });
  });

  const renderTree = (node, path = '') => {
    return Object.keys(node)
      .sort()
      .map((key) => {
        const item = node[key];
        const currentPath = path ? `${path}/${key}` : key;

        if (item.type === 'directory') {
          return (
            <div key={currentPath} className='ml-4'>
              <div className='flex items-center text-blue-700 font-semibold mb-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' />
                </svg>
                {key}
              </div>
              {renderTree(item.children, currentPath)}
            </div>
          );
        } else {
          return (
            <div
              key={item.id}
              className={`flex items-center ml-4 py-1 px-2 rounded-md cursor-pointer text-sm transition-colors duration-200
              ${
                activeFileId === item.id
                  ? 'bg-blue-200 text-blue-800 font-medium'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onFileSelect(item.id)}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 mr-1 text-gray-500'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm5 2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1V7a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
              {item.name}
            </div>
          );
        }
      });
  };

  return <div className='p-2'>{renderTree(tree)}</div>;
};

function App() {
  const initialSqlQuery = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0
);`;

  const [sqlQuery, setSqlQuery] = useState(initialSqlQuery);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [activeGeneratedFileId, setActiveGeneratedFileId] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [error, setError] = useState('');

  const activeGeneratedFile = generatedFiles.find(
    (file) => file.id === activeGeneratedFileId
  );
  const currentGeneratedCode = activeGeneratedFile
    ? activeGeneratedFile.content
    : '';
  const currentGeneratedCodeLanguage = activeGeneratedFile
    ? activeGeneratedFile.language
    : 'javascript';

  // IMPORTANT: Replace with your actual Gemini API Key.
  // In a production app, this should be handled server-side for security!
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const generateBackendCode = async () => {
    setError('');
    let prompt = `Generate a complete Node.js Express backend application for the following SQL schema.
    The application should use PostgreSQL with the 'pg' library.
    Organize the code into a clear folder structure, including:
    - \`src/\` (main application logic)
      - \`src/config/db.js\` (for database connection)
      - \`src/models/\` (for database interaction/queries for each table)
      - \`src/controllers/\` (for handling request logic for each resource)
      - \`src/routes/\` (for defining API endpoints for each resource)
      - \`src/app.js\` (main Express application setup)
    - \`package.json\` (basic dependencies)
    - \`.env\` (example environment variables)

    For each table in the SQL schema, create corresponding model, controller, and route files with standard CRUD (Create, Read, Update, Delete) operations.
    Ensure proper error handling and modularity.
    Provide the content for each file within a single markdown block, clearly indicating the file path and its content, prefixed with "// ".

    SQL Schema:
    \`\`\`sql
    ${sqlQuery}
    \`\`\`

    Example Output Format:
    \`\`\`
    // package.json
    {
      "name": "my-backend-app",
      "version": "1.0.0",
      "main": "src/app.js",
      "scripts": {
        "start": "node src/app.js"
      },
      "dependencies": {
        "express": "^4.17.1",
        "pg": "^8.7.1"
      }
    }

    // .env
    # DB_USER=your_username
    # DB_HOST=localhost
    # DB_DATABASE=your_database_name
    # DB_PASSWORD=your_password
    # DB_PORT=5432
    # PORT=3000

    // src/config/db.js
    // Database connection code here

    // src/models/usersModel.js
    // User model CRUD queries here

    // src/controllers/usersController.js
    // User controller logic here

    // src/routes/usersRoutes.js
    // User routes here

    // src/app.js
    // Main app setup here
    \`\`\`
    Return only the code and file structure description, no conversational text.
    `;

    if (!API_KEY) {
      setError(
        'Please provide your Google Gemini API Key in the API_KEY constant.'
      );
      return;
    }

    setLoadingBackend(true);
    setGeneratedFiles([]);
    setActiveGeneratedFileId(null);

    try {
      const chatHistory = [];
      chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API error: ${response.status} ${response.statusText} - ${
            errorData.error?.message || 'Unknown error'
          }`
        );
      }

      const result = await response.json();
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const rawText = result.candidates[0].content.parts[0].text;
        const parsedFiles = parseGeneratedCode(rawText);
        setGeneratedFiles(parsedFiles);
        if (parsedFiles.length > 0) {
          setActiveGeneratedFileId(parsedFiles[0].id);
        }
      } else {
        setError(
          'No content generated. Please try a different query or prompt.'
        );
      }
    } catch (err) {
      console.error('Error generating code:', err);
      setError(`Failed to generate code: ${err.message}`);
    } finally {
      setLoadingBackend(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          const messageBox = document.createElement('div');
          messageBox.textContent = 'Code copied to clipboard!';
          messageBox.className =
            'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
          document.body.appendChild(messageBox);
          setTimeout(() => {
            document.body.removeChild(messageBox);
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            const messageBox = document.createElement('div');
            messageBox.textContent = 'Code copied to clipboard!';
            messageBox.className =
              'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(messageBox);
            setTimeout(() => {
              document.body.removeChild(messageBox);
            }, 2000);
          } catch (copyErr) {
            console.error('Fallback: Oops, unable to copy', copyErr);
            const messageBox = document.createElement('div');
            messageBox.textContent =
              'Failed to copy code. Please copy manually.';
            messageBox.className =
              'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            document.body.appendChild(messageBox);
            setTimeout(() => {
              document.body.removeChild(messageBox);
            }, 3000);
          }
          document.body.removeChild(textArea);
        });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        const messageBox = document.createElement('div');
        messageBox.textContent = 'Code copied to clipboard!';
        messageBox.className =
          'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        document.body.appendChild(messageBox);
        setTimeout(() => {
          document.body.removeChild(messageBox);
        }, 2000);
      } catch (copyErr) {
        console.error('Fallback: Oops, unable to copy', copyErr);
        const messageBox = document.createElement('div');
        messageBox.textContent = 'Failed to copy code. Please copy manually.';
        messageBox.className =
          'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        document.body.appendChild(messageBox);
        setTimeout(() => {
          document.body.removeChild(messageBox);
        }, 3000);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 p-4 font-sans text-gray-800 flex flex-col items-center'>
      <div className='max-w-6xl w-full bg-white shadow-lg rounded-lg p-6'>
        <h1 className='text-3xl font-bold text-center text-blue-700 mb-6'>
          SQL to Backend Code Generator
        </h1>

        {error && (
          <div
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
            role='alert'
          >
            <strong className='font-bold'>Error!</strong>
            <span className='block sm:inline ml-2'>{error}</span>
          </div>
        )}

        <div className='grid grid-cols-1 gap-6'>
          {/* SQL Query Editor (Full Width) */}
          <div>
            <h2 className='text-xl font-semibold text-gray-700 mb-3'>
              Enter Your Full SQL Schema
            </h2>
            <div className='border border-gray-300 rounded-lg overflow-hidden'>
              <Editor
                value={sqlQuery}
                onValueChange={setSqlQuery}
                highlight={(code) =>
                  Prism.highlight(code, Prism.languages.sql, 'sql')
                }
                padding={10}
                className='font-mono text-sm bg-gray-50 rounded-lg min-h-[400px]'
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Generated Backend Code Editor with Folder Structure (Full Width) */}
          <div className='flex flex-col h-[500px]'>
            <h2 className='text-xl font-semibold text-gray-700 mb-3'>
              Generated Backend Code
            </h2>
            <div className='flex flex-1 border border-gray-300 rounded-lg overflow-hidden bg-gray-50'>
              {/* File Tree Sidebar */}
              <div className='w-1/3 bg-gray-100 border-r border-gray-200 p-2 overflow-y-auto'>
                <h3 className='text-lg font-medium text-gray-800 mb-2'>
                  Project Files
                </h3>
                {generatedFiles.length > 0 ? (
                  <FileTree
                    files={generatedFiles}
                    activeFileId={activeGeneratedFileId}
                    onFileSelect={setActiveGeneratedFileId}
                  />
                ) : (
                  <p className='text-gray-500 text-sm'>
                    Generate code to see project structure.
                  </p>
                )}
              </div>

              {/* Code Editor Area */}
              <div className='flex-1 flex flex-col relative'>
                <div className='flex-shrink-0 flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-white z-10'>
                  <span className='text-sm font-medium text-gray-700'>
                    {activeGeneratedFile
                      ? activeGeneratedFile.path
                      : 'Select a file'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentGeneratedCode)}
                    className='px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={!currentGeneratedCode}
                  >
                    Copy File
                  </button>
                </div>
                <div className='flex-1 overflow-auto p-4'>
                  <Editor
                    value={currentGeneratedCode}
                    onValueChange={(code) => {
                      setGeneratedFiles((prevFiles) =>
                        prevFiles.map((file) =>
                          file.id === activeGeneratedFileId
                            ? { ...file, content: code }
                            : file
                        )
                      );
                    }}
                    highlight={(code) => {
                      const grammar =
                        Prism.languages[currentGeneratedCodeLanguage] ||
                        Prism.languages.javascript;
                      return Prism.highlight(
                        code,
                        grammar,
                        currentGeneratedCodeLanguage
                      );
                    }}
                    padding={10}
                    className='font-mono text-sm bg-gray-50 w-full'
                    style={{
                      fontFamily: '"Fira code", "Fira Mono", monospace',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    readOnly={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className='flex justify-center mt-6 mb-8'>
          <button
            onClick={generateBackendCode}
            className={`px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out ${
              loadingBackend ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loadingBackend || !sqlQuery.trim()}
          >
            {loadingBackend ? (
              <span className='flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Generating Backend...
              </span>
            ) : (
              'Generate Backend Code'
            )}
          </button>
        </div>

        <div className='mt-8 text-center text-sm text-gray-600'>
          <p>
            **Important Security Note:** For production applications, avoid
            embedding your Gemini API key directly in client-side code. Instead,
            use a secure backend server or serverless function to make API
            calls.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
