import React, { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python'; // Added Python grammar
import 'prismjs/themes/prism.css';

// Helper function to parse the generated markdown into a file structure
const parseGeneratedCode = (markdownText) => {
  const files = [];
  const fileRegex = /^(?:\/\/|#)\s*([^\n]+)\n([\s\S]*?)(?=(?:^\/\/|^#|\Z))/gm;
  let match;

  while ((match = fileRegex.exec(markdownText)) !== null) {
    const fullPath = match[1].trim();
    if (fullPath.match(/^\w+\s+\w+/)) continue;
    let content = match[2].trim();
    if (!content) continue;
    content = content.replace(/```(?:javascript|python)?\n|\n```/g, '');
    const pathParts = fullPath.split('/');
    const fileName = pathParts.pop();
    const fileExtension = fileName.split('.').pop();

    let language = 'javascript';
    if (fileExtension === 'json') language = 'json';
    else if (fileExtension === 'sql') language = 'sql';
    else if (fileExtension === 'md') language = 'markdown';
    else if (fileExtension === 'py') language = 'python';

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
  const [language, setLanguage] = useState('nodejs');
  const [webFramework, setWebFramework] = useState('');
  const [orm, setOrm] = useState('');
  const [dbDriver, setDbDriver] = useState('');
  const [validation, setValidation] = useState('');
  const [auth, setAuth] = useState('');
  const [envVars, setEnvVars] = useState('');
  const [reqHandling, setReqHandling] = useState('');
  const [corsLib, setCorsLib] = useState('');
  const [logging, setLogging] = useState('');
  const [fileUploads, setFileUploads] = useState('');
  const [testing, setTesting] = useState('');
  const [apiDocs, setApiDocs] = useState('');
  const [rateLimit, setRateLimit] = useState('');
  const [scheduler, setScheduler] = useState('');
  const [emailing, setEmailing] = useState('');
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

  // Library options filtered by language
  const libraryOptions = {
    webFramework: {
      nodejs: ['express', 'fastify'],
      python: ['django', 'fastapi'],
    },
    orm: {
      nodejs: ['prisma', 'sequelize', 'knex'],
      python: ['sqlalchemy', 'tortoise-orm'],
    },
    dbDriver: {
      nodejs: ['pg', 'mysql2'],
      python: ['psycopg2', 'mysqlclient', 'pymysql'],
    },
    validation: {
      nodejs: ['zod', 'joi', 'yup'],
      python: ['pydantic', 'wtforms'],
    },
    auth: {
      nodejs: ['jsonwebtoken', 'bcrypt'],
      python: ['pyjwt', 'oauthlib'],
    },
    envVars: {
      nodejs: ['dotenv'],
      python: ['python-decouple', 'environs'],
    },
    reqHandling: {
      nodejs: ['express.json', 'body-parser'],
      python: ['fastapi', 'starlette'],
    },
    corsLib: {
      nodejs: ['cors'],
      python: ['fastapi-cors', 'starlette-cors'],
    },
    logging: {
      nodejs: ['morgan', 'winston', 'pino'],
      python: ['python-logging', 'loguru'],
    },
    fileUploads: {
      nodejs: ['multer'],
      python: ['python-multipart', 'fastapi-upload'],
    },
    testing: {
      nodejs: ['jest', 'supertest', 'mocha', 'chai'],
      python: ['pytest', 'unittest'],
    },
    apiDocs: {
      nodejs: ['swagger-jsdoc', 'swagger-ui-express'],
      python: ['fastapi-swagger-ui', 'apispec'],
    },
    rateLimit: {
      nodejs: ['helmet', 'express-rate-limit'],
      python: ['slowapi', 'limits'],
    },
    scheduler: {
      nodejs: ['node-cron', 'agenda'],
      python: ['apscheduler', 'celery'],
    },
    emailing: {
      nodejs: ['nodemailer'],
      python: ['smtplib', 'flask-mail'],
    },
  };

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

    let prompt = `Generate a complete backend application for the following SQL schema in ${language}.
    `;
    if (language === 'nodejs' && webFramework) {
      prompt += `Use ${webFramework} as the web framework`;
      if (orm) prompt += `, ${orm} as the ORM/query builder`;
      if (dbDriver) prompt += `, ${dbDriver} as the database driver`;
      if (validation) prompt += `, ${validation} for validation`;
      if (auth) prompt += `, ${auth} for authentication`;
      if (envVars) prompt += `, ${envVars} for environment variables`;
      if (reqHandling) prompt += `, ${reqHandling} for request handling`;
      if (corsLib) prompt += `, ${corsLib} for CORS`;
      if (logging) prompt += `, ${logging} for logging`;
      if (fileUploads) prompt += `, ${fileUploads} for file uploads`;
      if (testing) prompt += `, ${testing} for testing`;
      if (apiDocs) prompt += `, ${apiDocs} for API documentation`;
      if (rateLimit) prompt += `, ${rateLimit} for rate limiting/security`;
      if (scheduler) prompt += `, ${scheduler} for scheduling`;
      if (emailing) prompt += `, ${emailing} for emailing`;

      prompt += `. Organize the code into a clear folder structure, including:
      - \`package.json\` (project dependencies)
      - \`.env\` (environment variables)
      - \`src/app.js\` (main application setup with API docs and 404 middleware)
      - \`src/config/db.js\` (database connection)
      - \`src/models/usersModel.js\` (model for users table)
      - \`src/models/productsModel.js\` (model for products table)
      - \`src/controllers/usersController.js\` (controller logic for users)
      - \`src/controllers/productsController.js\` (controller logic for products)
      - \`src/routes/usersRoutes.js\` (API routes for users)
      - \`src/routes/productsRoutes.js\` (API routes for products)
      - \`src/swagger.json\` (Swagger configuration, if applicable)

      For each table in the SQL schema, create corresponding model, controller, and route files with standard CRUD operations (create, read, update, delete).
      Use parameterized queries appropriate to the database driver (e.g., ? for mysql2, $1 for pg).
      Include a 404 Not Found middleware and define product and user routes.
      Ensure proper error handling and modularity. Do not include outline comments or descriptions; provide only the actual file contents.
      Return only the code for each file, prefixed with '// ' followed by the file path.
      `;
    } else if (language === 'python' && webFramework) {
      prompt += `Use ${webFramework} as the web framework`;
      if (orm) prompt += `, ${orm} as the ORM/query builder`;
      if (dbDriver) prompt += `, ${dbDriver} as the database driver`;
      if (validation) prompt += `, ${validation} for validation`;
      if (auth) prompt += `, ${auth} for authentication`;
      if (envVars) prompt += `, ${envVars} for environment variables`;
      if (reqHandling) prompt += `, ${reqHandling} for request handling`;
      if (corsLib) prompt += `, ${corsLib} for CORS`;
      if (logging) prompt += `, ${logging} for logging`;
      if (fileUploads) prompt += `, ${fileUploads} for file uploads`;
      if (testing) prompt += `, ${testing} for testing`;
      if (apiDocs) prompt += `, ${apiDocs} for API documentation`;
      if (rateLimit) prompt += `, ${rateLimit} for rate limiting/security`;
      if (scheduler) prompt += `, ${scheduler} for scheduling`;
      if (emailing) prompt += `, ${emailing} for emailing`;

      prompt += `. Organize the code into a ${
        webFramework === 'django'
          ? 'Django project structure'
          : 'FastAPI project structure'
      }, including:
      - \`requirements.txt\` (project dependencies)
      - \`.env\` (environment variables)
      ${
        webFramework === 'django'
          ? '- `manage.py` (Django management script)\n- `project/settings.py` (project settings)\n- `project/urls.py` (URL configuration)\n- `users/models.py` (model for users table)\n- `users/views.py` (views for users)\n- `products/models.py` (model for products table)\n- `products/views.py` (views for products)\n- `users/urls.py` (URL routes for users)\n- `products/urls.py` (URL routes for products)'
          : '- `main.py` (main FastAPI application)\n- `database.py` (database connection)\n- `models/users.py` (model for users table)\n- `models/products.py` (model for products table)\n- `routes/users.py` (API routes for users)\n- `routes/products.py` (API routes for products)'
      }

      For each table in the SQL schema, create corresponding models and ${
        webFramework === 'django' ? 'views' : 'endpoints'
      } with standard CRUD operations.
      Use parameterized queries appropriate to the database driver.
      Include a 404 Not Found handler and define user and product routes.
      Ensure proper error handling and modularity. Do not include outline comments or descriptions; provide only the actual file contents.
      Return only the code for each file, prefixed with '// ' followed by the file path.
      `;
    }

    prompt += `
    SQL Schema:
    \`\`\`sql
    ${sqlQuery}
    \`\`\`
    `;

    if (!webFramework) {
      setError('Please select a web framework.');
      setLoadingBackend(false);
      return;
    }

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
          {/* Configuration Panel */}
          <div>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                isDarkTheme ? 'text-blue-300' : 'text-blue-600'
              }`}
            >
              Configuration
            </h2>
            <div
              className={`border rounded-lg p-4 ${
                isDarkTheme
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <div className='mb-4'>
                <label className='block mb-2'>Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value='nodejs'>Node.js</option>
                  <option value='python'>Python</option>
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Web Framework</label>
                <select
                  value={webFramework}
                  onChange={(e) => setWebFramework(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select a framework</option>
                  {libraryOptions.webFramework[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>ORM/Query Builder</label>
                <select
                  value={orm}
                  onChange={(e) => setOrm(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select an ORM</option>
                  {libraryOptions.orm[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Database Driver</label>
                <select
                  value={dbDriver}
                  onChange={(e) => setDbDriver(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select a driver</option>
                  {libraryOptions.dbDriver[language].map((option) => (
                    <option key={option} value={option}>
                      {option}{' '}
                      {language === 'nodejs' && option === 'pg'
                        ? '(PostgreSQL)'
                        : language === 'nodejs' && option === 'mysql2'
                        ? '(MySQL)'
                        : language === 'python' && option === 'psycopg2'
                        ? '(PostgreSQL)'
                        : '(MySQL)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Validation</label>
                <select
                  value={validation}
                  onChange={(e) => setValidation(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select validation</option>
                  {libraryOptions.validation[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Authentication</label>
                <select
                  value={auth}
                  onChange={(e) => setAuth(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select authentication</option>
                  {libraryOptions.auth[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Environment Variables</label>
                <select
                  value={envVars}
                  onChange={(e) => setEnvVars(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select env vars</option>
                  {libraryOptions.envVars[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Request Handling</label>
                <select
                  value={reqHandling}
                  onChange={(e) => setReqHandling(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select request handling</option>
                  {libraryOptions.reqHandling[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>CORS</label>
                <select
                  value={corsLib}
                  onChange={(e) => setCorsLib(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select CORS</option>
                  {libraryOptions.corsLib[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Logging</label>
                <select
                  value={logging}
                  onChange={(e) => setLogging(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select logging</option>
                  {libraryOptions.logging[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>File Uploads</label>
                <select
                  value={fileUploads}
                  onChange={(e) => setFileUploads(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select file uploads</option>
                  {libraryOptions.fileUploads[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Testing</label>
                <select
                  value={testing}
                  onChange={(e) => setTesting(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select testing</option>
                  {libraryOptions.testing[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>API Docs</label>
                <select
                  value={apiDocs}
                  onChange={(e) => setApiDocs(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select API docs</option>
                  {libraryOptions.apiDocs[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Rate Limiting/Security</label>
                <select
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select rate limit</option>
                  {libraryOptions.rateLimit[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Scheduler</label>
                <select
                  value={scheduler}
                  onChange={(e) => setScheduler(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select scheduler</option>
                  {libraryOptions.scheduler[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block mb-2'>Emailing</label>
                <select
                  value={emailing}
                  onChange={(e) => setEmailing(e.target.value)}
                  className='w-full p-2 rounded bg-gray-200 text-gray-800'
                >
                  <option value=''>Select emailing</option>
                  {libraryOptions.emailing[language].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={generateBackendCode}
                className={`w-full px-4 py-2 mt-4 rounded-lg ${
                  isDarkTheme
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } transition-all duration-300 ${
                  loadingBackend || !sqlQuery.trim() || !webFramework
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={loadingBackend || !sqlQuery.trim() || !webFramework}
              >
                {loadingBackend ? (
                  <span className='flex items-center justify-center'>
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
          </div>

          {/* SQL Query Editor and Generated Code Section */}
          <div className='flex flex-col'>
            <h2
              className={`text-2xl font-semibold mb-4 ${
                isDarkTheme ? 'text-blue-300' : 'text-blue-600'
              }`}
            >
              SQL Schema Input & Generated Code
            </h2>
            <div
              className={`flex-1 border rounded-lg overflow-hidden ${
                isDarkTheme
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              {/* SQL Query Editor */}
              <div className='p-4 border-b'>
                <Editor
                  value={sqlQuery}
                  onValueChange={setSqlQuery}
                  highlight={(code) =>
                    Prism.highlight(code, Prism.languages.sql, 'sql')
                  }
                  padding={16}
                  className={`font-mono text-sm min-h-[200px] ${
                    isDarkTheme
                      ? 'bg-gray-800 text-gray-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  style={{ fontFamily: '"Fira Code", monospace', fontSize: 14 }}
                />
              </div>
              {/* File Tree and Code Editor Area */}
              <div className='flex'>
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
                          (language === 'python'
                            ? Prism.languages.python
                            : Prism.languages.javascript);
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

        <div
          className={`mt-8 text-center text-sm ${
            isDarkTheme ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <p>
            **Security Note:** For production, store your Gemini API key
            securely on a backend server or use serverless functions.
          </p>
          {generatedFiles.some(
            (file) =>
              file.name === 'app.js' ||
              file.name === 'manage.py' ||
              file.name === 'main.py'
          ) && (
            <p className='mt-2'>
              **Run Command:**{' '}
              <code>
                {language === 'nodejs'
                  ? 'npm start'
                  : webFramework === 'django'
                  ? 'python manage.py runserver'
                  : 'uvicorn main:app --reload'}
              </code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
