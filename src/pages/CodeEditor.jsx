import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Copy,
  Download,
  Settings,
  Play,
  Search,
  X,
} from 'lucide-react';

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
    content = content.replace(
      /```(?:javascript|python|json|sql|markdown)?\n|\n```/g,
      ''
    );
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

// VS Code-like file tree component
const FileTree = ({ files, activeFileId, onFileSelect, onCopyPath }) => {
  const [expandedDirs, setExpandedDirs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const toggleDirectory = (path) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconStyle = 'w-3 h-3 mr-2';

    switch (ext) {
      case 'js':
        return (
          <div
            className={`${iconStyle} bg-yellow-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-black`}
          >
            JS
          </div>
        );
      case 'py':
        return (
          <div
            className={`${iconStyle} bg-blue-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            PY
          </div>
        );
      case 'json':
        return (
          <div
            className={`${iconStyle} bg-orange-400 rounded-sm flex items-center justify-center text-[10px] font-bold text-black`}
          >
            {}
          </div>
        );
      case 'sql':
        return (
          <div
            className={`${iconStyle} bg-purple-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            SQL
          </div>
        );
      case 'md':
        return (
          <div
            className={`${iconStyle} bg-gray-400 rounded-sm flex items-center justify-center text-[10px] font-bold text-black`}
          >
            MD
          </div>
        );
      case 'env':
        return (
          <div
            className={`${iconStyle} bg-green-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            .ENV
          </div>
        );
      default:
        return <File className={iconStyle} />;
    }
  };

  const renderTree = (node, path = '', depth = 0) => {
    const filteredEntries = Object.entries(node)
      .filter(([key, item]) => {
        if (item.type === 'file') {
          return key.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => {
        const aIsDir = a[1].type === 'directory';
        const bIsDir = b[1].type === 'directory';
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a[0].localeCompare(b[0]);
      });

    return filteredEntries.map(([key, item]) => {
      const currentPath = path ? `${path}/${key}` : key;
      const paddingLeft = `${depth * 16 + 8}px`;

      if (item.type === 'directory') {
        const isExpanded = expandedDirs[currentPath] !== false;
        return (
          <div key={currentPath}>
            <div
              className='flex items-center h-6 px-2 text-xs cursor-pointer hover:bg-gray-700/50 text-gray-300'
              style={{ paddingLeft }}
              onClick={() => toggleDirectory(currentPath)}
            >
              {isExpanded ? (
                <ChevronDown className='w-3 h-3 mr-1 text-gray-400' />
              ) : (
                <ChevronRight className='w-3 h-3 mr-1 text-gray-400' />
              )}
              {isExpanded ? (
                <FolderOpen className='w-3 h-3 mr-1 text-blue-400' />
              ) : (
                <Folder className='w-3 h-3 mr-1 text-blue-400' />
              )}
              <span className='truncate'>{key}</span>
            </div>
            {isExpanded && renderTree(item.children, currentPath, depth + 1)}
          </div>
        );
      } else {
        return (
          <div
            key={item.id}
            className={`flex items-center h-6 px-2 text-xs cursor-pointer hover:bg-gray-700/50 ${
              activeFileId === item.id
                ? 'bg-blue-600/50 text-white'
                : 'text-gray-300'
            }`}
            style={{ paddingLeft }}
            onClick={() => onFileSelect(item.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              onCopyPath(item.path);
            }}
          >
            {getFileIcon(item.name)}
            <span className='truncate'>{item.name}</span>
          </div>
        );
      }
    });
  };

  useEffect(() => {
    setExpandedDirs({}); // Auto-expand all directories by default
  }, [files]);

  return (
    <div className='flex flex-col h-full bg-gray-800'>
      <div className='p-2 border-b border-gray-700'>
        <div className='relative'>
          <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search files...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-8 pr-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500'
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {files.length > 0 ? (
          renderTree(tree)
        ) : (
          <p className='text-xs p-2 text-gray-400 font-mono text-center'>
            No files to display
          </p>
        )}
      </div>
    </div>
  );
};

// Configuration modal component
const ConfigModal = ({
  language,
  setLanguage,
  webFramework,
  setWebFramework,
  orm,
  setOrm,
  dbDriver,
  setDbDriver,
  validation,
  setValidation,
  auth,
  setAuth,
  envVars,
  setEnvVars,
  reqHandling,
  setReqHandling,
  corsLib,
  setCorsLib,
  logging,
  setLogging,
  fileUploads,
  setFileUploads,
  testing,
  setTesting,
  apiDocs,
  setApiDocs,
  rateLimit,
  setRateLimit,
  scheduler,
  setScheduler,
  emailing,
  setEmailing,
  onGenerate,
  isLoading,
  onClose,
}) => {
  const libraryOptions = {
    language: [
      {
        value: 'nodejs',
        label: 'JavaScript (Node.js)',
        tooltip: 'Backend development with Node.js',
      },
      {
        value: 'python',
        label: 'Python',
        tooltip: 'Backend development with Python',
      },
    ],
    webFramework: {
      nodejs: [
        {
          value: 'express',
          label: 'Express',
          tooltip: 'Lightweight and flexible Node.js web framework',
        },
        {
          value: 'fastify',
          label: 'Fastify',
          tooltip: 'High-performance Node.js framework with low overhead',
        },
      ],
      python: [
        {
          value: 'django',
          label: 'Django',
          tooltip: 'High-level Python web framework with batteries included',
        },
        {
          value: 'fastapi',
          label: 'FastAPI',
          tooltip: 'Modern, fast Python web framework for APIs',
        },
      ],
    },
    orm: {
      nodejs: [
        {
          value: 'prisma',
          label: 'Prisma',
          tooltip: 'Modern ORM with type-safe database access',
        },
        {
          value: 'sequelize',
          label: 'Sequelize',
          tooltip: 'Promise-based ORM for Node.js',
        },
        {
          value: 'knex',
          label: 'Knex',
          tooltip: 'SQL query builder for Node.js',
        },
      ],
      python: [
        {
          value: 'sqlalchemy',
          label: 'SQLAlchemy',
          tooltip: 'Python SQL toolkit and ORM',
        },
        {
          value: 'tortoise-orm',
          label: 'Tortoise ORM',
          tooltip: 'Async ORM for Python',
        },
      ],
    },
    dbDriver: {
      nodejs: [
        {
          value: 'pg',
          label: 'pg (PostgreSQL)',
          tooltip: 'PostgreSQL client for Node.js',
        },
        {
          value: 'mysql2',
          label: 'mysql2 (MySQL)',
          tooltip: 'Fast MySQL client for Node.js',
        },
      ],
      python: [
        {
          value: 'psycopg2',
          label: 'psycopg2 (PostgreSQL)',
          tooltip: 'PostgreSQL adapter for Python',
        },
        {
          value: 'mysqlclient',
          label: 'mysqlclient (MySQL)',
          tooltip: 'MySQL client for Python',
        },
        {
          value: 'pymysql',
          label: 'pymysql (MySQL)',
          tooltip: 'Pure-Python MySQL client',
        },
      ],
    },
    validation: {
      nodejs: [
        {
          value: 'zod',
          label: 'Zod',
          tooltip: 'TypeScript-first schema validation',
        },
        {
          value: 'joi',
          label: 'Joi',
          tooltip: 'Object schema validation for JavaScript',
        },
        {
          value: 'yup',
          label: 'Yup',
          tooltip: 'Schema builder for value parsing and validation',
        },
      ],
      python: [
        {
          value: 'pydantic',
          label: 'Pydantic',
          tooltip: 'Data validation using Python type hints',
        },
        {
          value: 'wtforms',
          label: 'WTForms',
          tooltip: 'Form validation for Python',
        },
      ],
    },
    auth: {
      nodejs: [
        {
          value: 'jsonwebtoken',
          label: 'jsonwebtoken',
          tooltip: 'JWT-based authentication for Node.js',
        },
        {
          value: 'bcrypt',
          label: 'bcrypt',
          tooltip: 'Password hashing for Node.js',
        },
      ],
      python: [
        {
          value: 'pyjwt',
          label: 'PyJWT',
          tooltip: 'JWT implementation for Python',
        },
        {
          value: 'oauthlib',
          label: 'OAuthLib',
          tooltip: 'OAuth implementation for Python',
        },
      ],
    },
    envVars: {
      nodejs: [
        {
          value: 'dotenv',
          label: 'dotenv',
          tooltip: 'Loads environment variables from .env file',
        },
      ],
      python: [
        {
          value: 'python-decouple',
          label: 'python-decouple',
          tooltip: 'Separates settings from code',
        },
        {
          value: 'environs',
          label: 'environs',
          tooltip: 'Environment variable parsing for Python',
        },
      ],
    },
    reqHandling: {
      nodejs: [
        {
          value: 'express.json',
          label: 'express.json',
          tooltip: 'Built-in Express JSON parser',
        },
        {
          value: 'body-parser',
          label: 'body-parser',
          tooltip: 'Node.js body parsing middleware',
        },
      ],
      python: [
        {
          value: 'fastapi',
          label: 'FastAPI',
          tooltip: 'Built-in request handling for FastAPI',
        },
        {
          value: 'starlette',
          label: 'Starlette',
          tooltip: 'ASGI framework for request handling',
        },
      ],
    },
    corsLib: {
      nodejs: [
        {
          value: 'cors',
          label: 'cors',
          tooltip: 'CORS middleware for Express',
        },
      ],
      python: [
        {
          value: 'fastapi-cors',
          label: 'fastapi-cors',
          tooltip: 'CORS support for FastAPI',
        },
        {
          value: 'starlette-cors',
          label: 'starlette-cors',
          tooltip: 'CORS support for Starlette',
        },
      ],
    },
    logging: {
      nodejs: [
        {
          value: 'morgan',
          label: 'morgan',
          tooltip: 'HTTP request logger for Node.js',
        },
        {
          value: 'winston',
          label: 'winston',
          tooltip: 'Versatile logging library for Node.js',
        },
        {
          value: 'pino',
          label: 'pino',
          tooltip: 'Fast and low-overhead logger for Node.js',
        },
      ],
      python: [
        {
          value: 'python-logging',
          label: 'python-logging',
          tooltip: 'Built-in Python logging module',
        },
        {
          value: 'loguru',
          label: 'loguru',
          tooltip: 'Simplified logging for Python',
        },
      ],
    },
    fileUploads: {
      nodejs: [
        {
          value: 'multer',
          label: 'multer',
          tooltip: 'File upload middleware for Express',
        },
      ],
      python: [
        {
          value: 'python-multipart',
          label: 'python-multipart',
          tooltip: 'File upload handling for Python',
        },
        {
          value: 'fastapi-upload',
          label: 'fastapi-upload',
          tooltip: 'File uploads for FastAPI',
        },
      ],
    },
    testing: {
      nodejs: [
        {
          value: 'jest',
          label: 'Jest',
          tooltip: 'JavaScript testing framework',
        },
        {
          value: 'supertest',
          label: 'Supertest',
          tooltip: 'HTTP assertions for Node.js',
        },
        {
          value: 'mocha',
          label: 'Mocha',
          tooltip: 'Flexible JavaScript test framework',
        },
        {
          value: 'chai',
          label: 'Chai',
          tooltip: 'Assertion library for Node.js',
        },
      ],
      python: [
        {
          value: 'pytest',
          label: 'pytest',
          tooltip: 'Python testing framework',
        },
        {
          value: 'unittest',
          label: 'unittest',
          tooltip: 'Built-in Python testing framework',
        },
      ],
    },
    apiDocs: {
      nodejs: [
        {
          value: 'swagger-jsdoc',
          label: 'swagger-jsdoc',
          tooltip: 'Swagger documentation for Node.js',
        },
        {
          value: 'swagger-ui-express',
          label: 'swagger-ui-express',
          tooltip: 'Swagger UI for Express',
        },
      ],
      python: [
        {
          value: 'fastapi-swagger-ui',
          label: 'fastapi-swagger-ui',
          tooltip: 'Swagger UI for FastAPI',
        },
        {
          value: 'apispec',
          label: 'apispec',
          tooltip: 'API specification for Python',
        },
      ],
    },
    rateLimit: {
      nodejs: [
        {
          value: 'helmet',
          label: 'helmet',
          tooltip: 'Security middleware for Express',
        },
        {
          value: 'express-rate-limit',
          label: 'express-rate-limit',
          tooltip: 'Rate limiting for Express',
        },
      ],
      python: [
        {
          value: 'slowapi',
          label: 'slowapi',
          tooltip: 'Rate limiting for FastAPI',
        },
        {
          value: 'limits',
          label: 'limits',
          tooltip: 'Rate limiting library for Python',
        },
      ],
    },
    scheduler: {
      nodejs: [
        {
          value: 'node-cron',
          label: 'node-cron',
          tooltip: 'Cron jobs for Node.js',
        },
        {
          value: 'agenda',
          label: 'agenda',
          tooltip: 'Job scheduling for Node.js',
        },
      ],
      python: [
        {
          value: 'apscheduler',
          label: 'apscheduler',
          tooltip: 'Scheduling library for Python',
        },
        {
          value: 'celery',
          label: 'celery',
          tooltip: 'Distributed task queue for Python',
        },
      ],
    },
    emailing: {
      nodejs: [
        {
          value: 'nodemailer',
          label: 'nodemailer',
          tooltip: 'Email sending for Node.js',
        },
      ],
      python: [
        {
          value: 'smtplib',
          label: 'smtplib',
          tooltip: 'Built-in Python email library',
        },
        {
          value: 'flask-mail',
          label: 'flask-mail',
          tooltip: 'Email sending for Flask',
        },
      ],
    },
  };

  // Reset dependent dropdowns when language changes
  useEffect(() => {
    setWebFramework('');
    setOrm('');
    setDbDriver('');
    setValidation('');
    setAuth('');
    setEnvVars('');
    setReqHandling('');
    setCorsLib('');
    setLogging('');
    setFileUploads('');
    setTesting('');
    setApiDocs('');
    setRateLimit('');
    setScheduler('');
    setEmailing('');
  }, [language]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-white'>Configuration</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-200'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          <div className='relative group'>
            <label className='block text-xs font-medium text-gray-300 mb-1 capitalize'>
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='w-full p-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500'
            >
              <option value=''>Select Language</option>
              {libraryOptions.language.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className='absolute hidden group-hover:block bg-gray-600 text-white text-xs rounded p-2 mt-1 z-10 max-w-xs'>
              {libraryOptions.language.find((opt) => opt.value === language)
                ?.tooltip || 'Select a programming language.'}
            </div>
          </div>
          {Object.keys(libraryOptions)
            .filter((key) => key !== 'language')
            .map((key) => (
              <div key={key} className='relative group'>
                <label className='block text-xs font-medium text-gray-300 mb-1 capitalize'>
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  value={eval(key)}
                  onChange={(e) =>
                    eval(`set${key.charAt(0).toUpperCase() + key.slice(1)}`)(
                      e.target.value
                    )
                  }
                  className='w-full p-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500'
                  disabled={!language}
                >
                  <option value=''>
                    Select {key.replace(/([A-Z])/g, ' $1')}
                  </option>
                  {language &&
                    libraryOptions[key][language].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                <div className='absolute hidden group-hover:block bg-gray-600 text-white text-xs rounded p-2 mt-1 z-10 max-w-xs'>
                  {(language &&
                    libraryOptions[key][language].find(
                      (opt) => opt.value === eval(key)
                    )?.tooltip) ||
                    `Select a ${key.replace(/([A-Z])/g, ' $1')} library.`}
                </div>
              </div>
            ))}
        </div>
        <div className='mt-6'>
          <button
            onClick={() => {
              onGenerate();
              onClose();
            }}
            disabled={isLoading || !webFramework}
            className='w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs transition-colors'
          >
            <Play className='w-4 h-4' />
            {isLoading ? 'Generating...' : 'Generate Backend'}
          </button>
        </div>
      </div>
    </div>
  );
};

function CodeEditor() {
  const initialSqlQuery = `CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
  );

  CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL
  );`;

  const [sqlQuery, setSqlQuery] = useState(initialSqlQuery);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [activeGeneratedFileId, setActiveGeneratedFileId] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [error, setError] = useState('');
  const [streamOutput, setStreamOutput] = useState('');
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
  const [isConfigOpen, setIsConfigOpen] = useState(false);
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

    // Parse table names from SQL query
    const tableRegex = /CREATE\s+TABLE\s+(?:`)?(\w+)(?:`)?\s*\(/gi;
    const tables = [];
    let match;
    while ((match = tableRegex.exec(sqlQuery)) !== null) {
      tables.push(match[1]);
    }

    if (tables.length === 0) {
      setError('No tables found in the SQL query.');
      setLoadingBackend(false);
      return;
    }

    // Helper functions for naming conventions
    const toCamelCase = (str) =>
      str
        .toLowerCase()
        .replace(/(?:^\w|[A-Z]|\b\w|_+)/g, (word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .replace(/_/g, '');
    const toSnakeCase = (str) =>
      str
        .toLowerCase()
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word : '_' + word.toLowerCase()
        );

    let prompt = `Generate a complete backend application for the following SQL schema in ${language}. `;
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
      ${tables
        .map(
          (table) => `
      - \`src/models/${toCamelCase(table)}Model.js\` (model for ${table} table)
      - \`src/controllers/${toCamelCase(
        table
      )}Controller.js\` (controller logic for ${table})
      - \`src/routes/${toCamelCase(table)}Routes.js\` (API routes for ${table})`
        )
        .join('\n')}
      - \`src/swagger.json\` (Swagger configuration, if applicable)

      For each table in the SQL schema, create corresponding model, controller, and route files with standard CRUD operations (create, read, update, delete).
      Use parameterized queries appropriate to the database driver (e.g., ? for mysql2, $1 for pg).
      Include a 404 Not Found middleware and define routes for each table.
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
          ? `- \`manage.py\` (Django management script)
      - \`project/settings.py\` (project settings)
      - \`project/urls.py\` (URL configuration)
      ${tables
        .map(
          (table) => `
      - \`${toSnakeCase(table)}/models.py\` (model for ${table} table)
      - \`${toSnakeCase(table)}/views.py\` (views for ${table})
      - \`${toSnakeCase(table)}/urls.py\` (URL routes for ${table})`
        )
        .join('\n')}`
          : `- \`main.py\` (main FastAPI application)
      - \`database.py\` (database connection)
      ${tables
        .map(
          (table) => `
      - \`models/${toSnakeCase(table)}.py\` (model for ${table} table)
      - \`routes/${toSnakeCase(table)}.py\` (API routes for ${table})`
        )
        .join('\n')}`
      }

      For each table in the SQL schema, create corresponding models and ${
        webFramework === 'django' ? 'views' : 'endpoints'
      } with standard CRUD operations.
      Use parameterized queries appropriate to the database driver.
      Include a 404 Not Found handler and define routes for each table.
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
    // const model = 'gemini-2.0-flash';
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
        messageBox.textContent = 'Copied to clipboard!';
        messageBox.className = `fixed bottom-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg z-50`;
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
        messageBox.textContent = 'Copied to clipboard!';
        messageBox.className = `fixed bottom-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg z-50`;
        document.body.appendChild(messageBox);
        setTimeout(() => document.body.removeChild(messageBox), 2000);
      });
  };

  const copyFilePath = (path) => {
    copyToClipboard(path);
  };

  const downloadAsZip = () => {
    const zip = new JSZip();
    generatedFiles.forEach((file) => {
      zip.file(file.path, file.content);
    });
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'generated-backend.zip');
    });
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      copyToClipboard(currentGeneratedCode);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconStyle = 'w-3 h-3 mr-2';

    switch (ext) {
      case 'js':
        return (
          <div
            className={`${iconStyle} bg-yellow-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-black`}
          >
            JS
          </div>
        );
      case 'py':
        return (
          <div
            className={`${iconStyle} bg-blue-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            PY
          </div>
        );
      case 'json':
        return (
          <div
            className={`${iconStyle} bg-orange-400 rounded-sm flex items-center justify-center text-[10px] font-bold text-black`}
          >
            {}
          </div>
        );
      case 'sql':
        return (
          <div
            className={`${iconStyle} bg-purple-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            SQL
          </div>
        );
      case 'md':
        return (
          <div
            className={`${iconStyle} bg-gray-400 rounded-sm flex items-center justify-center text-[10px] font-bold text-black`}
          >
            MD
          </div>
        );
      case 'env':
        return (
          <div
            className={`${iconStyle} bg-green-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            .ENV
          </div>
        );
      default:
        return <File className={iconStyle} />;
    }
  };

  return (
    <div className='h-screen flex flex-col bg-gray-900 text-gray-200 font-mono text-xs'>
      {/* Header */}
      <div className='h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-red-500 rounded-full'></div>
          <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
        </div>
        <div className='flex-1 text-center text-xs text-gray-400'>
          AI-Powered Backend Generator
        </div>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setIsConfigOpen(true)}
            className='p-1 text-gray-400 hover:text-gray-200'
            title='Configuration'
          >
            <Settings className='w-4 h-4' />
          </button>
          <button
            onClick={downloadAsZip}
            disabled={generatedFiles.length === 0}
            className='p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50'
            title='Download as ZIP'
          >
            <Download className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className='bg-red-900/50 border-b border-red-700 px-3 py-2 text-red-300 text-xs'>
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Sidebar: File Tree */}
        <div className='w-64 bg-gray-800 border-r border-gray-700 flex flex-col'>
          <div className='h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3'>
            <span className='text-xs font-medium text-gray-400 uppercase tracking-wide'>
              Explorer
            </span>
          </div>
          <FileTree
            files={generatedFiles}
            activeFileId={activeGeneratedFileId}
            onFileSelect={setActiveGeneratedFileId}
            onCopyPath={copyFilePath}
          />
        </div>

        {/* Editor Area */}
        <div className='flex-1 flex flex-col'>
          {/* Editors */}
          <div className='flex-1 flex flex-col md:flex-row'>
            {/* SQL Editor */}
            <div className='flex-1 flex flex-col border-r border-gray-700'>
              <div className='h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3'>
                <div className='w-3 h-3 bg-purple-500 rounded-sm mr-2'></div>
                <span className='text-xs text-gray-300'>schema.sql</span>
              </div>
              <div className='flex-1 overflow-auto bg-gray-850'>
                <Editor
                  height='100%'
                  language='sql'
                  value={sqlQuery}
                  onChange={setSqlQuery}
                  onMount={(editor) => {
                    editor.onKeyDown((e) => {
                      if (e.ctrlKey && e.keyCode === 83) {
                        // Ctrl+S
                        e.preventDefault();
                        copyToClipboard(sqlQuery);
                      }
                    });
                  }}
                  options={{
                    fontFamily: '"Fira Code", "Consolas", monospace',
                    fontSize: 12,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                  theme='vs-dark'
                />
              </div>
            </div>

            {/* Code Editor */}
            <div className='flex-1 flex flex-col'>
              <div className='h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3'>
                {activeGeneratedFile ? (
                  <div className='flex items-center'>
                    {getFileIcon(activeGeneratedFile.name)}
                    <span className='text-xs text-gray-300'>
                      {activeGeneratedFile.name}
                    </span>
                  </div>
                ) : (
                  <span className='text-xs text-gray-400'>Select a file</span>
                )}
                <div className='flex-1' />
                <button
                  onClick={() => copyToClipboard(currentGeneratedCode)}
                  disabled={!currentGeneratedCode}
                  className='p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50'
                  title='Copy Code (Ctrl+S)'
                >
                  <Copy className='w-4 h-4' />
                </button>
              </div>
              <div className='flex-1 overflow-auto bg-gray-850'>
                {activeGeneratedFile ? (
                  <Editor
                    height='100%'
                    language={currentGeneratedCodeLanguage}
                    value={currentGeneratedCode}
                    onChange={(code) =>
                      setGeneratedFiles((prevFiles) =>
                        prevFiles.map((file) =>
                          file.id === activeGeneratedFileId
                            ? { ...file, content: code }
                            : file
                        )
                      )
                    }
                    onMount={(editor) => {
                      editor.onKeyDown((e) => {
                        if (e.ctrlKey && e.keyCode === 83) {
                          // Ctrl+S
                          e.preventDefault();
                          copyToClipboard(currentGeneratedCode);
                        }
                      });
                    }}
                    options={{
                      fontFamily: '"Fira Code", "Consolas", monospace',
                      fontSize: 12,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                    theme='vs-dark'
                  />
                ) : (
                  <div className='flex items-center justify-center h-full text-gray-400'>
                    <div className='text-center'>
                      <File className='w-12 h-12 mx-auto mb-2 opacity-50' />
                      <p className='text-xs'>No file selected</p>
                      <p className='text-xs'>
                        Choose a file from the explorer or generate new code
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Output */}
      {loadingBackend && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-gray-800 rounded-lg p-4 text-center'>
            <div className='animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3'></div>
            <p className='text-xs text-gray-300'>Generating backend code...</p>
            <pre className='text-xs font-mono p-2 mt-2 rounded bg-gray-850 text-gray-300 max-h-32 overflow-y-auto'>
              {streamOutput || 'Initializing...'}
            </pre>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {isConfigOpen && (
        <ConfigModal
          language={language}
          setLanguage={setLanguage}
          webFramework={webFramework}
          setWebFramework={setWebFramework}
          orm={orm}
          setOrm={setOrm}
          dbDriver={dbDriver}
          setDbDriver={setDbDriver}
          validation={validation}
          setValidation={setValidation}
          auth={auth}
          setAuth={setAuth}
          envVars={envVars}
          setEnvVars={setEnvVars}
          reqHandling={reqHandling}
          setReqHandling={setReqHandling}
          corsLib={corsLib}
          setCorsLib={setCorsLib}
          logging={logging}
          setLogging={setLogging}
          fileUploads={fileUploads}
          setFileUploads={setFileUploads}
          testing={testing}
          setTesting={setTesting}
          apiDocs={apiDocs}
          setApiDocs={setApiDocs}
          rateLimit={rateLimit}
          setRateLimit={setRateLimit}
          scheduler={scheduler}
          setScheduler={setScheduler}
          emailing={emailing}
          setEmailing={setEmailing}
          onGenerate={generateBackendCode}
          isLoading={loadingBackend}
          onClose={() => setIsConfigOpen(false)}
        />
      )}

      {/* Footer */}
      {/* <div className='h-8 bg-gray-800 border-t border-gray-700 flex items-center px-3 text-xs text-gray-400'>
        <p>
          **Security Note:** For production, store your Gemini API key securely
          on a backend server or use serverless functions.
        </p>
        {generatedFiles.some(
          (file) =>
            file.name === 'app.js' ||
            file.name === 'manage.py' ||
            file.name === 'main.py'
        ) && (
          <p className='ml-auto'>
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
      </div> */}
    </div>
  );
}

export default CodeEditor;
