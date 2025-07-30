import React, { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';

// Helper function to parse the generated markdown into a file structure
const parseGeneratedCode = (markdownText) => {
  const files = [];
  const fileRegex = /^(?:\/\/|#)\s*([^\n]+)\n([\s\S]*?)(?=(?:^\/\/|^#|\Z))/gm;
  let match;

  while ((match = fileRegex.exec(markdownText)) !== null) {
    const fullPath = match[1].trim();
    // Skip entries that look like outlines or descriptions
    if (fullPath.match(/^\w+\s+\w+/)) continue;
    let content = match[2].trim();
    if (!content) continue;
    // Filter out Markdown code block markers (e.g., ```javascript or ```)
    content = content.replace(/```(?:javascript)?\n|\n```/g, '');
    const pathParts = fullPath.split('/');
    const fileName = pathParts.pop();
    const fileExtension = fileName.split('.').pop();

    let language = 'javascript';
    if (fileExtension === 'json') language = 'json';
    else if (fileExtension === 'sql') language = 'sql';
    else if (fileExtension === 'md') language = 'markdown';

    files.push({
      id: fullPath,
      path: fullPath,
      name: fileName,
      content: content,
      language: language,
    });
  }

  return files;
};

// Component to render an enhanced file tree with parent files at bottom
const FileTree = ({ files, activeFileId, onFileSelect }) => {
  const tree = {};
  const parentFiles = [];
  const folderFiles = [];

  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = tree;
    if (parts.length === 1) {
      parentFiles.push(file);
    } else {
      folderFiles.push(file);
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
    }
  });

  const renderTree = (node, path = '', depth = 0) => {
    return Object.keys(node)
      .sort()
      .map((key) => {
        const item = node[key];
        const currentPath = path ? `${path}/${key}` : key;

        if (item.type === 'directory') {
          return (
            <div key={currentPath} className={`ml-${depth * 4}`}>
              <div className='flex items-center text-blue-600 font-medium mb-2'>
                <svg
                  className='h-4 w-4 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' />
                </svg>
                {key}
              </div>
              {renderTree(item.children, currentPath, depth + 1)}
            </div>
          );
        } else {
          return (
            <div
              key={item.id}
              className={`ml-${
                depth * 4
              } flex items-center py-1 px-3 rounded-lg cursor-pointer text-sm transition-all duration-300 ${
                activeFileId === item.id
                  ? 'bg-blue-200 text-blue-800'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
              onClick={() => onFileSelect(item.id)}
            >
              <svg
                className='h-4 w-4 mr-2 text-gray-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2h-3.54L9 3H5a2 2 0 00-2 2v14a2 2 0 002 2z' />
              </svg>
              {item.name}
            </div>
          );
        }
      });
  };

  return (
    <div className='p-4 bg-gray-50 rounded-lg'>
      {Object.keys(tree).length > 0 && renderTree(tree)}
      {parentFiles.map((file) => (
        <div
          key={file.id}
          className={`flex items-center py-1 px-3 rounded-lg cursor-pointer text-sm transition-all duration-300 ${
            activeFileId === file.id
              ? 'bg-blue-200 text-blue-800'
              : 'hover:bg-gray-100 text-gray-800'
          }`}
          onClick={() => onFileSelect(file.id)}
        >
          <svg
            className='h-4 w-4 mr-2 text-gray-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path d='M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2h-3.54L9 3H5a2 2 0 00-2 2v14a2 2 0 002 2z' />
          </svg>
          {file.name}
        </div>
      ))}
      {files.length === 0 && (
        <p className='text-gray-500 text-sm'>No files to display.</p>
      )}
    </div>
  );
};

function App() {
  const initialSqlQuery = `CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0
);`;

  const [sqlQuery, setSqlQuery] = useState(initialSqlQuery);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [activeGeneratedFileId, setActiveGeneratedFileId] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [error, setError] = useState('');
  const [streamOutput, setStreamOutput] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const streamRef = useRef(null);

  const activeGeneratedFile = generatedFiles.find(
    (file) => file.id === activeGeneratedFileId
  );
  const currentGeneratedCode = activeGeneratedFile
    ? activeGeneratedFile.content
    : '';
  const currentGeneratedCodeLanguage = activeGeneratedFile
    ? activeGeneratedFile.language
    : 'javascript';

  const simulateEventStream = async (apiResponseText) => {
    setStreamOutput('');
    const chunks = apiResponseText.split('\n').filter((line) => line.trim());
    for (let i = 0; i < chunks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setStreamOutput((prev) => prev + chunks[i] + '\n');
    }
    return apiResponseText;
  };

  const generateBackendCode = async () => {
    setError('');
    setLoadingBackend(true);
    setGeneratedFiles([]);
    setActiveGeneratedFileId(null);
    setStreamOutput('');

    const prompt = `Generate a complete Node.js Express backend application for the following SQL schema.
    The application should support the SQL dialect provided in the schema (e.g., MySQL or PostgreSQL) and include Swagger documentation using swagger-ui-express.
    Use the appropriate database library based on the dialect: 'mysql2' for MySQL (with ? for parameterized queries) or 'pg' for PostgreSQL (with $1, $2 for parameterized queries).
    Organize the code into a clear folder structure, including:
    - \`package.json\` (project dependencies)
    - \`.env\` (environment variables)
    - \`src/app.js\` (main application setup with Swagger at /api-docs and 404 middleware)
    - \`src/config/db.js\` (database connection)
    - \`src/models/usersModel.js\` (CRUD operations for users table)
    - \`src/models/productsModel.js\` (CRUD operations for products table)
    - \`src/controllers/usersController.js\` (controller logic for users)
    - \`src/controllers/productsController.js\` (controller logic for products)
    - \`src/routes/usersRoutes.js\` (API routes for users)
    - \`src/routes/productsRoutes.js\` (API routes for products)
    - \`src/swagger.json\` (Swagger configuration)

    For each table in the SQL schema, create corresponding model, controller, and route files with standard CRUD operations (create, read, update, delete).
    Use parameterized queries appropriate to the dialect (e.g., ? for MySQL, $1 for PostgreSQL).
    Include a 404 Not Found middleware and define product and user routes.
    Ensure proper error handling and modularity. Do not include outline comments or descriptions (e.g., 'Middleware to parse JSON bodies'); provide only the actual file contents.
    Return only the code for each file, prefixed with '// ' followed by the file path.

    SQL Schema:
    \`\`\`sql
    ${sqlQuery}
    \`\`\`
    `;

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      setError(
        'Please provide your Google Gemini API Key in the .env file (VITE_GEMINI_API_KEY).'
      );
      setLoadingBackend(false);
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API error: ${response.status} - ${
            errorData.error?.message || 'Unknown error'
          }`
        );
      }

      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const rawText = result.candidates[0].content.parts[0].text;
        await simulateEventStream(rawText);
        const parsedFiles = parseGeneratedCode(rawText);
        if (parsedFiles.length === 0) {
          setError('No files generated from API response.');
        } else {
          setGeneratedFiles(parsedFiles);
          if (parsedFiles.length > 0) {
            setActiveGeneratedFileId(parsedFiles[0].id);
          }
        }
      } else {
        setError('No content generated.');
      }
    } catch (err) {
      setError(`Failed to generate code: ${err.message}.`);
    } finally {
      setLoadingBackend(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        const messageBox = document.createElement('div');
        messageBox.textContent = 'Code copied to clipboard!';
        messageBox.className = `fixed bottom-4 right-4 bg-${
          isDarkTheme ? 'green-600' : 'green-500'
        } text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in`;
        document.body.appendChild(messageBox);
        setTimeout(() => document.body.removeChild(messageBox), 2000);
      })
      .catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        const messageBox = document.createElement('div');
        messageBox.textContent = 'Code copied to clipboard!';
        messageBox.className = `fixed bottom-4 right-4 bg-${
          isDarkTheme ? 'green-600' : 'green-500'
        } text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in`;
        document.body.appendChild(messageBox);
        setTimeout(() => document.body.removeChild(messageBox), 2000);
      });
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-6 ${
        isDarkTheme ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'
      }`}
    >
      <div className='w-full max-w-7xl rounded-xl shadow-2xl p-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1
            className={`text-4xl font-bold text-center ${
              isDarkTheme ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            AI-Powered Backend Generator
          </h1>
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`px-4 py-2 rounded-lg ${
              isDarkTheme
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Toggle Theme
          </button>
        </div>

        {error && (
          <div
            className={`px-6 py-4 rounded-lg mb-6 ${
              isDarkTheme
                ? 'bg-red-900/50 border border-red-700 text-red-300 animate-pulse'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            <strong className='font-bold'>Error!</strong>
            <span className='ml-2'>{error}</span>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* SQL Query Editor */}
          <div>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                isDarkTheme ? 'text-blue-300' : 'text-blue-600'
              }`}
            >
              SQL Schema Input
            </h2>
            <div
              className={`border rounded-lg overflow-hidden ${
                isDarkTheme
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <Editor
                value={sqlQuery}
                onValueChange={setSqlQuery}
                highlight={(code) =>
                  Prism.highlight(code, Prism.languages.sql, 'sql')
                }
                padding={16}
                className={`font-mono text-sm min-h-[400px] ${
                  isDarkTheme
                    ? 'bg-gray-800 text-gray-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
                style={{ fontFamily: '"Fira Code", monospace', fontSize: 14 }}
              />
            </div>
          </div>

          {/* Generated Code Section */}
          <div className='flex flex-col'>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                isDarkTheme ? 'text-blue-300' : 'text-blue-600'
              }`}
            >
              Generated Backend Code
            </h2>
            <div
              className={`flex flex-1 border rounded-lg overflow-hidden ${
                isDarkTheme
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              {/* File Tree Sidebar */}
              <div
                className={`w-1/3 ${
                  isDarkTheme
                    ? 'bg-gray-850 border-r border-gray-700'
                    : 'bg-white border-r border-gray-300'
                } overflow-y-auto`}
              >
                <h3
                  className={`text-lg font-medium p-4 border-b ${
                    isDarkTheme
                      ? 'text-gray-300 border-gray-700'
                      : 'text-gray-700 border-gray-300'
                  }`}
                >
                  Project Structure
                </h3>
                {generatedFiles.length > 0 ? (
                  <FileTree
                    files={generatedFiles}
                    activeFileId={activeGeneratedFileId}
                    onFileSelect={setActiveGeneratedFileId}
                  />
                ) : (
                  <p
                    className={`text-sm p-4 ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Generate code to view project structure.
                  </p>
                )}
              </div>

              {/* Code Editor Area */}
              <div className='flex-1 flex flex-col'>
                <div
                  className={`flex items-center justify-between ${
                    isDarkTheme
                      ? 'bg-gray-850 border-b border-gray-700'
                      : 'bg-white border-b border-gray-300'
                  } px-4 py-3`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {activeGeneratedFile
                      ? activeGeneratedFile.path
                      : 'Select a file'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentGeneratedCode)}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkTheme
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={!currentGeneratedCode}
                  >
                    Copy Code
                  </button>
                </div>
                <div className='flex-1 overflow-auto p-4'>
                  <Editor
                    value={currentGeneratedCode}
                    onValueChange={(code) =>
                      setGeneratedFiles((prevFiles) =>
                        prevFiles.map((file) =>
                          file.id === activeGeneratedFileId
                            ? { ...file, content: code }
                            : file
                        )
                      )
                    }
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
                    padding={16}
                    className={`font-mono text-sm w-full ${
                      isDarkTheme
                        ? 'bg-gray-800 text-gray-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={{
                      fontFamily: '"Fira Code", monospace',
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streaming Output */}
        {loadingBackend && (
          <div
            className={`mt-6 rounded-lg p-6 ${
              isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            <h3
              className={`text-lg font-medium mb-4 ${
                isDarkTheme ? 'text-blue-300' : 'text-blue-600'
              }`}
            >
              Generation Progress
            </h3>
            <pre
              className={`text-sm font-mono p-4 rounded-lg max-h-48 overflow-y-auto ${
                isDarkTheme
                  ? 'bg-gray-900 text-gray-300'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {streamOutput || 'Initializing code generation...'}
            </pre>
          </div>
        )}

        {/* Generate Button */}
        <div className='flex justify-center mt-8'>
          <button
            onClick={generateBackendCode}
            className={`px-8 py-4 rounded-lg shadow-lg ${
              isDarkTheme
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-all duration-300 ${
              loadingBackend || !sqlQuery.trim()
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={loadingBackend || !sqlQuery.trim()}
          >
            {loadingBackend ? (
              <span className='flex items-center'>
                <svg
                  className='animate-spin mr-3 h-5 w-5 text-white'
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
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Backend Code'
            )}
          </button>
        </div>

        <div
          className={`mt-8 text-center text-sm ${
            isDarkTheme ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <p>
            **Security Note:** For production, store your Gemini API key
            securely on a backend server or use serverless functions.
          </p>
          {generatedFiles.some((file) => file.name === 'app.js') && (
            <p className='mt-2'>
              **Swagger URL:**{' '}
              <a
                href='http://localhost:3000/api-docs'
                target='_blank'
                rel='noopener noreferrer'
                className={`underline ${
                  isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                http://localhost:3000/api-docs
              </a>
              <br />
              **Terminal Command:** <code>npm start</code> or{' '}
              <code>node src/app.js</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
