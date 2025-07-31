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

    let language = 'plaintext';
    if (fileExtension === 'js' || fileExtension === 'jsx')
      language = 'javascript';
    else if (fileExtension === 'py') language = 'python';
    else if (fileExtension === 'json') language = 'json';
    else if (fileExtension === 'sql') language = 'sql';
    else if (fileExtension === 'md') language = 'markdown';
    else if (fileExtension === 'html') language = 'html';
    else if (fileExtension === 'css') language = 'css';
    else if (fileExtension === 'ts' || fileExtension === 'tsx')
      language = 'typescript';
    else if (fileExtension === 'xml') language = 'xml';
    else if (fileExtension === 'yml' || fileExtension === 'yaml')
      language = 'yaml';
    else if (fileExtension === 'env') language = 'ini';

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

// FileTree Component
const FileTree = ({ files, activeFileId, onFileSelect, onCopyPath }) => {
  const [expandedDirs, setExpandedDirs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const toggleDirectory = (path) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconStyle = 'w-4 h-4 mr-2 flex-shrink-0';

    switch (ext) {
      case 'js':
      case 'jsx':
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
            {'{}'}
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
      case 'html':
        return (
          <div
            className={`${iconStyle} bg-red-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            HTML
          </div>
        );
      case 'css':
        return (
          <div
            className={`${iconStyle} bg-blue-400 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            CSS
          </div>
        );
      case 'ts':
      case 'tsx':
        return (
          <div
            className={`${iconStyle} bg-blue-600 rounded-sm flex items-center justify-center text-[10px] font-bold text-white`}
          >
            TS
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
        return (
          JSON.stringify(item.children)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          key.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
              className='flex items-center h-8 px-2 text-sm cursor-pointer hover:bg-gray-700/70 text-gray-300 transition-colors'
              style={{ paddingLeft }}
              onClick={() => toggleDirectory(currentPath)}
            >
              {isExpanded ? (
                <ChevronDown className='w-4 h-4 mr-2 text-gray-400' />
              ) : (
                <ChevronRight className='w-4 h-4 mr-2 text-gray-400' />
              )}
              {isExpanded ? (
                <FolderOpen className='w-4 h-4 mr-2 text-blue-400' />
              ) : (
                <Folder className='w-4 h-4 mr-2 text-blue-400' />
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
            className={`flex items-center h-8 px-2 text-sm cursor-pointer hover:bg-gray-700/70 ${
              activeFileId === item.id
                ? 'bg-blue-600/50 text-white'
                : 'text-gray-300'
            } transition-colors`}
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
    const allDirs = {};
    const buildExpandedState = (node, path = '') => {
      Object.entries(node).forEach(([key, item]) => {
        const currentPath = path ? `${path}/${key}` : key;
        if (item.type === 'directory') {
          allDirs[currentPath] = true;
          buildExpandedState(item.children, currentPath);
        }
      });
    };
    buildExpandedState(tree);
    setExpandedDirs(allDirs);
  }, [files]);

  return (
    <div className='flex flex-col h-full bg-gray-800 rounded-lg shadow-lg overflow-hidden'>
      <div className='p-3 border-b border-gray-700 bg-gray-700/50'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder='Search files...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-8 py-2 text-sm bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200'
            >
              <X className='w-5 h-5' />
            </button>
          )}
        </div>
      </div>
      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {files.length > 0 ? (
          renderTree(tree)
        ) : (
          <p className='text-sm p-4 text-gray-400 font-mono text-center'>
            No files to display. Generate a backend to see files.
          </p>
        )}
      </div>
    </div>
  );
};

// ConfigModal Component
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

  const getDynamicValue = (key) => {
    switch (key) {
      case 'webFramework':
        return webFramework;
      case 'orm':
        return orm;
      case 'dbDriver':
        return dbDriver;
      case 'validation':
        return validation;
      case 'auth':
        return auth;
      case 'envVars':
        return envVars;
      case 'reqHandling':
        return reqHandling;
      case 'corsLib':
        return corsLib;
      case 'logging':
        return logging;
      case 'fileUploads':
        return fileUploads;
      case 'testing':
        return testing;
      case 'apiDocs':
        return apiDocs;
      case 'rateLimit':
        return rateLimit;
      case 'scheduler':
        return scheduler;
      case 'emailing':
        return emailing;
      default:
        return '';
    }
  };

  const setDynamicValue = (key, value) => {
    switch (key) {
      case 'webFramework':
        setWebFramework(value);
        break;
      case 'orm':
        setOrm(value);
        break;
      case 'dbDriver':
        setDbDriver(value);
        break;
      case 'validation':
        setValidation(value);
        break;
      case 'auth':
        setAuth(value);
        break;
      case 'envVars':
        setEnvVars(value);
        break;
      case 'reqHandling':
        setReqHandling(value);
        break;
      case 'corsLib':
        setCorsLib(value);
        break;
      case 'logging':
        setLogging(value);
        break;
      case 'fileUploads':
        setFileUploads(value);
        break;
      case 'testing':
        setTesting(value);
        break;
      case 'apiDocs':
        setApiDocs(value);
        break;
      case 'rateLimit':
        setRateLimit(value);
        break;
      case 'scheduler':
        setScheduler(value);
        break;
      case 'emailing':
        setEmailing(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
      <div className='bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold text-white'>Configuration</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-200 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='relative group'>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='w-full p-2.5 text-sm bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
            >
              <option value=''>Select Language</option>
              {libraryOptions.language.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className='absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded-lg p-3 mt-2 z-10 max-w-xs shadow-lg'>
              {libraryOptions.language.find((opt) => opt.value === language)
                ?.tooltip || 'Select a programming language.'}
            </div>
          </div>
          {Object.keys(libraryOptions)
            .filter((key) => key !== 'language')
            .map((key) => (
              <div key={key} className='relative group'>
                <label className='block text-sm font-medium text-gray-300 mb-2 capitalize'>
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  value={getDynamicValue(key)}
                  onChange={(e) => setDynamicValue(key, e.target.value)}
                  className='w-full p-2.5 text-sm bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                  disabled={!language || !libraryOptions[key][language]}
                >
                  <option value=''>
                    Select {key.replace(/([A-Z])/g, ' $1')}
                  </option>
                  {language &&
                    libraryOptions[key][language]?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                <div className='absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded-lg p-3 mt-2 z-10 max-w-xs shadow-lg'>
                  {(language &&
                    libraryOptions[key][language]?.find(
                      (opt) => opt.value === getDynamicValue(key)
                    )?.tooltip) ||
                    `Select a ${key.replace(/([A-Z])/g, ' $1')} library.`}
                </div>
              </div>
            ))}
        </div>
        <div className='mt-8'>
          <button
            onClick={() => {
              onGenerate();
              onClose();
            }}
            disabled={isLoading || !webFramework}
            className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-md'
          >
            <Play className='w-5 h-5' />
            {isLoading ? 'Generating...' : 'Generate Backend'}
          </button>
        </div>
      </div>
    </div>
  );
};

// App Component
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
  const [sqlEditorHeight, setSqlEditorHeight] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const streamRef = useRef(null);
  const dividerRef = useRef(null);

  const activeGeneratedFile = generatedFiles.find(
    (file) => file.id === activeGeneratedFileId
  );
  const currentGeneratedCode = activeGeneratedFile
    ? activeGeneratedFile.content
    : '';
  const currentGeneratedCodeLanguage = activeGeneratedFile
    ? activeGeneratedFile.language
    : 'javascript';

  const startDragging = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    const container = dividerRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const newHeight =
      ((e.clientY - containerRect.top) / containerRect.height) * 100;
    if (newHeight >= 20 && newHeight <= 80) {
      setSqlEditorHeight(newHeight);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => onDrag(e);
    const handleMouseUp = () => stopDragging();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const simulateEventStream = async (apiResponseText) => {
    setStreamOutput('');
    const chunks = apiResponseText.split('\n').filter((line) => line.trim());
    for (let i = 0; i < chunks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setStreamOutput((prev) => prev + chunks[i] + '\n');
      if (streamRef.current) {
        streamRef.current.scrollTop = streamRef.current.scrollHeight;
      }
    }
    return apiResponseText;
  };

  const generateBackendCode = async () => {
    setError('');
    setLoadingBackend(true);
    setGeneratedFiles([]);
    setActiveGeneratedFileId(null);
    setStreamOutput('');

    const tableRegex = /CREATE\s+TABLE\s+(?:`)?(\w+)(?:`)?\s*\(/gi;
    const tables = [];
    let match;
    while ((match = tableRegex.exec(sqlQuery)) !== null) {
      tables.push(match[1]);
    }

    if (tables.length === 0) {
      setError(
        'No tables found in the SQL query. Please provide a valid SQL schema.'
      );
      setLoadingBackend(false);
      return;
    }

    const toCamelCase = (str) =>
      str
        .toLowerCase()
        .replace(/(?:^\w|[A-Z]|\b\w|_+)/g, (word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .replace(/_/g, '');

    const toSnakeCase = (str) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

    let prompt = `Generate a complete backend application for the following SQL schema in ${language}. `;
    if (language === 'nodejs') {
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
    } else if (language === 'python') {
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
      Return only the code for each file, prefixed with '# ' followed by the file path.
      `;
    } else {
      setError('Please select a valid language and web framework.');
      setLoadingBackend(false);
      return;
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
        'API Key is not configured. Please ensure it is provided in the environment.'
      );
      setLoadingBackend(false);
      return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    try {
      let retries = 0;
      const maxRetries = 5;
      let response;

      while (retries < maxRetries) {
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }),
          });

          if (response.ok) {
            break;
          } else if (response.status === 429) {
            const delay = Math.pow(2, retries) * 1000;
            console.warn(
              `Rate limit hit. Retrying in ${delay / 1000} seconds...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries++;
          } else {
            const errorData = await response.json();
            throw new Error(
              `API error: ${response.status} - ${
                errorData.error?.message || 'Unknown error'
              }`
            );
          }
        } catch (innerError) {
          if (retries === maxRetries - 1) {
            throw innerError;
          }
          retries++;
          const delay = Math.pow(2, retries) * 1000;
          console.warn(
            `Fetch error: ${innerError.message}. Retrying in ${
              delay / 1000
            } seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      if (!response || !response.ok) {
        throw new Error(
          'Failed to get a successful response after multiple retries.'
        );
      }

      const result = await response.json();
      const generatedText =
        result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!generatedText) {
        setError(
          'No code was generated. Please try adjusting your query or configurations.'
        );
        setLoadingBackend(false);
        return;
      }

      await simulateEventStream(generatedText);
      const parsed = parseGeneratedCode(generatedText);
      setGeneratedFiles(parsed);
      if (parsed.length > 0) {
        setActiveGeneratedFileId(parsed[0].id);
      }
    } catch (err) {
      console.error('Error generating backend code:', err);
      setError(`Failed to generate code: ${err.message}`);
    } finally {
      setLoadingBackend(false);
    }
  };

  const downloadProject = async () => {
    if (generatedFiles.length === 0) {
      setError('No files to download. Generate code first.');
      return;
    }

    const zip = new JSZip();
    generatedFiles.forEach((file) => {
      zip.file(file.path, file.content);
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'backend_project.zip');
    } catch (err) {
      console.error('Error zipping files:', err);
      setError('Failed to download project.');
    }
  };

  const copyFilePath = (path) => {
    navigator.clipboard.writeText(path).then(
      () => {
        console.log(`Copied path: ${path}`);
      },
      (err) => {
        console.error('Failed to copy path: ', err);
        setError('Failed to copy path.');
      }
    );
  };

  return (
    <div className='flex flex-col h-screen w-screen font-sans bg-gray-900 text-gray-100'>
      <header className='flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-lg'>
        <h1 className='text-xl font-bold text-blue-400'>Gunevo Studio</h1>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => setIsConfigOpen(true)}
            className='flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all shadow-md'
          >
            <Settings className='w-5 h-5' />
            Configure
          </button>
          <button
            onClick={downloadProject}
            disabled={generatedFiles.length === 0}
            className='flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-md'
          >
            <Download className='w-5 h-5' />
            Download
          </button>
        </div>
      </header>
      <div className='flex flex-1 overflow-hidden'>
        <div
          className='flex flex-col w-1/2 min-w-[350px] max-w-[50%] bg-gray-800 border-r border-gray-700 flex-shrink-0'
          ref={dividerRef}
        >
          <div className='p-4 bg-gray-700/50 border-b border-gray-600 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-gray-200'>
              SQL Schema Input
            </h2>
          </div>
          <div style={{ height: `${sqlEditorHeight}%`, minHeight: '100px' }}>
            <Editor
              height='100%'
              language='sql'
              theme='vs-dark'
              value={sqlQuery}
              onChange={(value) => setSqlQuery(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbersMinChars: 3,
                padding: { top: 10, bottom: 10 },
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  useShadows: true,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          </div>
          <div
            className='h-2 bg-gray-600 cursor-ns-resize hover:bg-blue-500 transition-colors'
            onMouseDown={startDragging}
          />
          <div className='p-4 bg-gray-700/50 border-t border-gray-600 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-gray-200'>
              Generation Output
            </h2>
            {loadingBackend && (
              <span className='text-blue-400 text-sm flex items-center gap-2'>
                <svg
                  className='animate-spin h-5 w-5 text-blue-400'
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
                Generating...
              </span>
            )}
          </div>
          <div
            ref={streamRef}
            className='flex-1 p-4 text-sm bg-gray-900 overflow-y-auto custom-scrollbar whitespace-pre-wrap'
            style={{ minHeight: '100px' }}
          >
            {error && <p className='text-red-500 mb-3 font-medium'>{error}</p>}
            {streamOutput}
          </div>
        </div>
        <div className='flex flex-col w-1/2 min-w-[350px] flex-grow'>
          <div className='flex flex-1 overflow-hidden'>
            <div className='w-1/3 min-w-[200px] max-w-[30%] bg-gray-800 border-r border-gray-700 flex-shrink-0 flex flex-col'>
              <div className='p-4 bg-gray-700/50 border-b border-gray-600'>
                <h2 className='text-sm font-semibold text-gray-200'>
                  Project Files
                </h2>
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar'>
                <FileTree
                  files={generatedFiles}
                  activeFileId={activeGeneratedFileId}
                  onFileSelect={setActiveGeneratedFileId}
                  onCopyPath={copyFilePath}
                />
              </div>
            </div>
            <div className='flex flex-col flex-grow bg-gray-900'>
              <div className='p-4 bg-gray-700/50 border-b border-gray-600 flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-gray-200 truncate'>
                  {activeGeneratedFile
                    ? activeGeneratedFile.path
                    : 'Select a file'}
                </h2>
                {activeGeneratedFile && (
                  <button
                    onClick={() => copyFilePath(activeGeneratedFile.path)}
                    className='flex items-center gap-2 px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-all'
                  >
                    <Copy className='w-4 h-4' />
                    Copy Path
                  </button>
                )}
              </div>
              <div className='flex-1 overflow-hidden'>
                <Editor
                  height='100%'
                  language={currentGeneratedCodeLanguage}
                  theme='vs-dark'
                  value={currentGeneratedCode}
                  options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbersMinChars: 3,
                    padding: { top: 10, bottom: 10 },
                    scrollbar: {
                      vertical: 'auto',
                      horizontal: 'auto',
                      useShadows: true,
                      verticalHasArrows: false,
                      horizontalHasArrows: false,
                      verticalScrollbarSize: 8,
                      horizontalScrollbarSize: 8,
                    },
                  }}
                  onChange={(newValue) => {
                    setGeneratedFiles((prevFiles) =>
                      prevFiles.map((file) =>
                        file.id === activeGeneratedFileId
                          ? { ...file, content: newValue }
                          : file
                      )
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
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
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}

export default CodeEditor;
