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
  Sparkles,
  Code2,
  Database,
  Zap,
  CheckCircle,
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
      /```(?:javascript|python|json|sql|markdown|typescript|html|css)?\n|\n```/g,
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
const FileTree = ({ files, activeFileId, onFileSelect, onCopyContent }) => {
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
    const iconStyle = 'w-3 h-3 mr-2 flex-shrink-0';

    switch (ext) {
      case 'js':
      case 'jsx':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
          >
            JS
          </div>
        );
      case 'py':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-blue-500 to-blue-700 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
          >
            PY
          </div>
        );
      case 'json':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-orange-400 to-orange-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
          >
            {'{}'}
          </div>
        );
      case 'sql':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-purple-500 to-purple-700 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
          >
            SQL
          </div>
        );
      case 'md':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-gray-400 to-gray-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
          >
            MD
          </div>
        );
      case 'env':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-green-500 to-green-700 rounded-sm flex items-center justify-center text-[7px] font-bold text-white shadow-sm`}
          >
            ENV
          </div>
        );
      case 'html':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-red-500 to-red-700 rounded-sm flex items-center justify-center text-[7px] font-bold text-white shadow-sm`}
          >
            HTML
          </div>
        );
      case 'css':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
          >
            CSS
          </div>
        );
      case 'ts':
      case 'tsx':
        return (
          <div
            className={`${iconStyle} bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
          >
            TS
          </div>
        );
      default:
        return <File className={`${iconStyle} text-gray-400`} />;
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
      const paddingLeft = `${depth * 12 + 8}px`;

      if (item.type === 'directory') {
        const isExpanded = expandedDirs[currentPath] === true;
        return (
          <div key={currentPath}>
            <div
              className='flex items-center h-7 px-2 text-xs cursor-pointer hover:bg-gray-700/60 text-gray-300 transition-all duration-200 group'
              style={{ paddingLeft }}
              onClick={() => toggleDirectory(currentPath)}
            >
              {isExpanded ? (
                <ChevronDown className='w-3 h-3 mr-2 text-gray-500 group-hover:text-blue-400 transition-colors' />
              ) : (
                <ChevronRight className='w-3 h-3 mr-2 text-gray-500 group-hover:text-blue-400 transition-colors' />
              )}
              {isExpanded ? (
                <FolderOpen className='w-3 h-3 mr-2 text-blue-400' />
              ) : (
                <Folder className='w-3 h-3 mr-2 text-blue-500' />
              )}
              <span className='truncate font-medium'>{key}</span>
            </div>
            {isExpanded && renderTree(item.children, currentPath, depth + 1)}
          </div>
        );
      } else {
        return (
          <div
            key={item.id}
            className={`flex items-center h-7 px-2 text-xs cursor-pointer hover:bg-gray-700/60 group ${
              activeFileId === item.id
                ? 'bg-gradient-to-r from-blue-600/40 to-purple-600/20 text-white border-r-2 border-blue-400'
                : 'text-gray-300'
            } transition-all duration-200`}
            style={{ paddingLeft }}
            onClick={() => onFileSelect(item.id)}
          >
            {getFileIcon(item.name)}
            <span className='truncate flex-1 font-medium'>{item.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyContent(item.content);
              }}
              className='opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-600 rounded transition-all duration-200'
              title='Copy content'
            >
              <Copy className='w-3 h-3 text-gray-400 hover:text-blue-400' />
            </button>
          </div>
        );
      }
    });
  };

  // Keep all folders closed initially (remove the useEffect that expanded all folders)

  return (
    <div className='flex flex-col h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-700'>
      <div className='p-3 border-b border-gray-700 bg-gradient-to-r from-gray-700/80 to-gray-600/80'>
        <div className='relative'>
          <Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search files...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-8 pr-7 py-1.5 text-xs bg-gray-900/60 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all'
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>
      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {files.length > 0 ? (
          <div className='py-1'>{renderTree(tree)}</div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full p-4 text-center'>
            <Code2 className='w-8 h-8 text-gray-500 mb-2' />
            <p className='text-xs text-gray-500 font-medium'>
              No files generated yet
            </p>
            <p className='text-xs text-gray-600 mt-1'>
              Configure and generate to see files
            </p>
          </div>
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
        tooltip: 'Modern backend development with Node.js ecosystem',
      },
      {
        value: 'python',
        label: 'Python',
        tooltip: 'Powerful backend development with Python frameworks',
      },
    ],
    webFramework: {
      nodejs: [
        {
          value: 'express',
          label: 'Express',
          tooltip: 'Fast, unopinionated web framework for Node.js',
        },
        {
          value: 'fastify',
          label: 'Fastify',
          tooltip: 'High-performance framework with schema-based validation',
        },
      ],
      python: [
        {
          value: 'django',
          label: 'Django',
          tooltip: 'Full-featured framework with ORM, admin, and more',
        },
        {
          value: 'fastapi',
          label: 'FastAPI',
          tooltip: 'Modern, async API framework with automatic docs',
        },
      ],
    },
    orm: {
      nodejs: [
        {
          value: 'prisma',
          label: 'Prisma',
          tooltip: 'Type-safe ORM with migrations and introspection',
        },
        {
          value: 'sequelize',
          label: 'Sequelize',
          tooltip: 'Feature-rich ORM with associations and validations',
        },
        {
          value: 'knex',
          label: 'Knex',
          tooltip: 'Flexible SQL query builder with migrations',
        },
      ],
      python: [
        {
          value: 'sqlalchemy',
          label: 'SQLAlchemy',
          tooltip: 'Comprehensive SQL toolkit and ORM',
        },
        {
          value: 'tortoise-orm',
          label: 'Tortoise ORM',
          tooltip: 'Async ORM inspired by Django ORM',
        },
      ],
    },
    dbDriver: {
      nodejs: [
        {
          value: 'pg',
          label: 'pg (PostgreSQL)',
          tooltip: 'PostgreSQL client with connection pooling',
        },
        {
          value: 'mysql2',
          label: 'mysql2 (MySQL)',
          tooltip: 'Fast MySQL driver with prepared statements',
        },
      ],
      python: [
        {
          value: 'psycopg2',
          label: 'psycopg2 (PostgreSQL)',
          tooltip: 'Most popular PostgreSQL adapter for Python',
        },
        {
          value: 'mysqlclient',
          label: 'mysqlclient (MySQL)',
          tooltip: 'MySQLdb fork with Python 3 support',
        },
        {
          value: 'pymysql',
          label: 'pymysql (MySQL)',
          tooltip: 'Pure-Python MySQL client library',
        },
      ],
    },
    validation: {
      nodejs: [
        {
          value: 'zod',
          label: 'Zod',
          tooltip: 'TypeScript-first schema validation with inference',
        },
        {
          value: 'joi',
          label: 'Joi',
          tooltip: 'Powerful schema description and validation',
        },
        {
          value: 'yup',
          label: 'Yup',
          tooltip: 'Schema builder for runtime value parsing',
        },
      ],
      python: [
        {
          value: 'pydantic',
          label: 'Pydantic',
          tooltip: 'Data validation using Python type annotations',
        },
        {
          value: 'wtforms',
          label: 'WTForms',
          tooltip: 'Flexible web form validation and rendering',
        },
      ],
    },
    auth: {
      nodejs: [
        {
          value: 'jsonwebtoken',
          label: 'jsonwebtoken',
          tooltip: 'JWT implementation for secure authentication',
        },
        {
          value: 'bcrypt',
          label: 'bcrypt',
          tooltip: 'Secure password hashing with salt rounds',
        },
      ],
      python: [
        {
          value: 'pyjwt',
          label: 'PyJWT',
          tooltip: 'JSON Web Token implementation in Python',
        },
        {
          value: 'oauthlib',
          label: 'OAuthLib',
          tooltip: 'Generic OAuth request-signing logic',
        },
      ],
    },
    envVars: {
      nodejs: [
        {
          value: 'dotenv',
          label: 'dotenv',
          tooltip: 'Load environment variables from .env files',
        },
      ],
      python: [
        {
          value: 'python-decouple',
          label: 'python-decouple',
          tooltip: 'Strict separation of settings from code',
        },
        {
          value: 'environs',
          label: 'environs',
          tooltip: 'Environment variable parsing library',
        },
      ],
    },
    reqHandling: {
      nodejs: [
        {
          value: 'express.json',
          label: 'express.json',
          tooltip: 'Built-in Express JSON body parser middleware',
        },
        {
          value: 'body-parser',
          label: 'body-parser',
          tooltip: 'Node.js body parsing middleware collection',
        },
      ],
      python: [
        {
          value: 'fastapi',
          label: 'FastAPI',
          tooltip: 'Built-in request handling with Pydantic models',
        },
        {
          value: 'starlette',
          label: 'Starlette',
          tooltip: 'Lightweight ASGI framework for async Python',
        },
      ],
    },
    corsLib: {
      nodejs: [
        {
          value: 'cors',
          label: 'cors',
          tooltip: 'Configurable CORS middleware for Express',
        },
      ],
      python: [
        {
          value: 'fastapi-cors',
          label: 'fastapi-cors',
          tooltip: 'CORS support for FastAPI applications',
        },
        {
          value: 'starlette-cors',
          label: 'starlette-cors',
          tooltip: 'CORS middleware for Starlette applications',
        },
      ],
    },
    logging: {
      nodejs: [
        {
          value: 'morgan',
          label: 'morgan',
          tooltip: 'HTTP request logger middleware',
        },
        {
          value: 'winston',
          label: 'winston',
          tooltip: 'Multi-transport async logging library',
        },
        {
          value: 'pino',
          label: 'pino',
          tooltip: 'Extremely fast JSON logger',
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
          tooltip: 'Simplified logging with better defaults',
        },
      ],
    },
    fileUploads: {
      nodejs: [
        {
          value: 'multer',
          label: 'multer',
          tooltip: 'Multipart/form-data handling for file uploads',
        },
      ],
      python: [
        {
          value: 'python-multipart',
          label: 'python-multipart',
          tooltip: 'Streaming multipart parser for Python',
        },
        {
          value: 'fastapi-upload',
          label: 'fastapi-upload',
          tooltip: 'Enhanced file upload handling for FastAPI',
        },
      ],
    },
    testing: {
      nodejs: [
        {
          value: 'jest',
          label: 'Jest',
          tooltip: 'Delightful JavaScript testing framework',
        },
        {
          value: 'supertest',
          label: 'Supertest',
          tooltip: 'HTTP assertions made easy via superagent',
        },
        {
          value: 'mocha',
          label: 'Mocha',
          tooltip: 'Feature-rich JavaScript test framework',
        },
        {
          value: 'chai',
          label: 'Chai',
          tooltip: 'BDD/TDD assertion library',
        },
      ],
      python: [
        {
          value: 'pytest',
          label: 'pytest',
          tooltip: 'Simple yet powerful testing framework',
        },
        {
          value: 'unittest',
          label: 'unittest',
          tooltip: 'Built-in Python unit testing framework',
        },
      ],
    },
    apiDocs: {
      nodejs: [
        {
          value: 'swagger-jsdoc',
          label: 'swagger-jsdoc',
          tooltip: 'Generate Swagger docs from JSDoc comments',
        },
        {
          value: 'swagger-ui-express',
          label: 'swagger-ui-express',
          tooltip: 'Serve auto-generated swagger-ui',
        },
      ],
      python: [
        {
          value: 'fastapi-swagger-ui',
          label: 'fastapi-swagger-ui',
          tooltip: 'Automatic interactive API documentation',
        },
        {
          value: 'apispec',
          label: 'apispec',
          tooltip: 'Pluggable API specification generator',
        },
      ],
    },
    rateLimit: {
      nodejs: [
        {
          value: 'helmet',
          label: 'helmet',
          tooltip: 'Security middleware for Express apps',
        },
        {
          value: 'express-rate-limit',
          label: 'express-rate-limit',
          tooltip: 'Basic rate-limiting middleware for Express',
        },
      ],
      python: [
        {
          value: 'slowapi',
          label: 'slowapi',
          tooltip: 'Rate limiting for FastAPI and Starlette',
        },
        {
          value: 'limits',
          label: 'limits',
          tooltip: 'Rate limiting using various strategies',
        },
      ],
    },
    scheduler: {
      nodejs: [
        {
          value: 'node-cron',
          label: 'node-cron',
          tooltip: 'Task scheduler for Node.js based on cron',
        },
        {
          value: 'agenda',
          label: 'agenda',
          tooltip: 'Lightweight job scheduling for Node.js',
        },
      ],
      python: [
        {
          value: 'apscheduler',
          label: 'apscheduler',
          tooltip: 'In-process task scheduler with cron-like features',
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
          tooltip: 'Send emails from Node.js with ease',
        },
      ],
      python: [
        {
          value: 'smtplib',
          label: 'smtplib',
          tooltip: 'Built-in Python SMTP protocol client',
        },
        {
          value: 'flask-mail',
          label: 'flask-mail',
          tooltip: 'Flask extension for sending email',
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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md'>
      <div className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-700'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg'>
              <Settings className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>
                Project Configuration
              </h2>
              <p className='text-sm text-gray-400'>
                Configure your backend architecture and libraries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-700 rounded-lg'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='relative group lg:col-span-3'>
            <label className='block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2'>
              <Sparkles className='w-4 h-4 text-yellow-400' />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='w-full p-3 text-sm bg-gray-900/60 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all'
            >
              <option value=''>Select Programming Language</option>
              {libraryOptions.language.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className='absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded-lg p-3 mt-2 z-10 max-w-xs shadow-lg border border-gray-600'>
              {libraryOptions.language.find((opt) => opt.value === language)
                ?.tooltip ||
                'Choose your preferred programming language for backend development.'}
            </div>
          </div>

          {Object.keys(libraryOptions)
            .filter((key) => key !== 'language')
            .map((key) => (
              <div key={key} className='relative group'>
                <label className='block text-sm font-semibold text-gray-300 mb-2 capitalize flex items-center gap-2'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  value={getDynamicValue(key)}
                  onChange={(e) => setDynamicValue(key, e.target.value)}
                  className='w-full p-3 text-sm bg-gray-900/60 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
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
                <div className='absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded-lg p-3 mt-2 z-10 max-w-xs shadow-lg border border-gray-600'>
                  {(language &&
                    libraryOptions[key][language]?.find(
                      (opt) => opt.value === getDynamicValue(key)
                    )?.tooltip) ||
                    `Select a ${key.replace(
                      /([A-Z])/g,
                      ' $1'
                    )} library for your project.`}
                </div>
              </div>
            ))}
        </div>

        <div className='mt-8 flex gap-4'>
          <button
            onClick={() => {
              onGenerate();
              onClose();
            }}
            disabled={isLoading || !webFramework}
            className='flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none'
          >
            {isLoading ? (
              <>
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                Generating Architecture...
              </>
            ) : (
              <>
                <Zap className='w-5 h-5' />
                Generate Backend
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className='px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// App Component
function CodeEditor() {
  const initialSqlQuery = `-- E-commerce Database Schema
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    category_id INT,
    sku VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
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
  const [copySuccess, setCopySuccess] = useState(false);
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
    if (newHeight >= 25 && newHeight <= 75) {
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
      await new Promise((resolve) => setTimeout(resolve, 30));
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

    let prompt = `Generate a complete, production-ready backend application based on the provided SQL schema using ${language}. This should be a comprehensive business application, not just basic CRUD operations.

**Technology Stack:**
- Language: ${language}
- Web Framework: ${webFramework}
${orm ? `- ORM/Query Builder: ${orm}` : ''}
${dbDriver ? `- Database Driver: ${dbDriver}` : ''}
${validation ? `- Validation: ${validation}` : ''}
${auth ? `- Authentication: ${auth}` : ''}
${envVars ? `- Environment Variables: ${envVars}` : ''}
${reqHandling ? `- Request Handling: ${reqHandling}` : ''}
${corsLib ? `- CORS: ${corsLib}` : ''}
${logging ? `- Logging: ${logging}` : ''}
${fileUploads ? `- File Uploads: ${fileUploads}` : ''}
${testing ? `- Testing: ${testing}` : ''}
${apiDocs ? `- API Documentation: ${apiDocs}` : ''}
${rateLimit ? `- Security/Rate Limiting: ${rateLimit}` : ''}
${scheduler ? `- Scheduling: ${scheduler}` : ''}
${emailing ? `- Email Service: ${emailing}` : ''}

**Requirements:**
1. **Business Logic Implementation**: Include sophisticated business validation, relationships handling, and domain-specific operations
2. **Advanced Features**: Implement pagination, filtering, sorting, search functionality, bulk operations
3. **Error Handling**: Comprehensive error handling with proper HTTP status codes and informative error messages
4. **Security**: Input validation, SQL injection prevention, authentication middleware, authorization checks
5. **Performance**: Optimized queries, connection pooling, caching strategies where applicable
6. **Monitoring**: Structured logging, health check endpoints, metrics collection
7. **API Design**: RESTful design with proper resource modeling and HTTP methods

**Project Structure for ${language === 'nodejs' ? 'Node.js' : 'Python'}:**`;

    if (language === 'nodejs') {
      prompt += `
- \`package.json\` (comprehensive dependencies and scripts)
- \`.env\` (environment configuration)
- \`README.md\` (setup and usage instructions)
- \`src/app.js\` (main application with middleware setup)
- \`src/config/database.js\` (database configuration and connection)
- \`src/config/swagger.js\` (API documentation setup)
- \`src/middleware/auth.js\` (authentication middleware)
- \`src/middleware/validation.js\` (request validation middleware)
- \`src/middleware/errorHandler.js\` (global error handling)
- \`src/utils/logger.js\` (logging utility)
- \`src/utils/constants.js\` (application constants)
${tables
  .map(
    (table) => `
- \`src/models/${toCamelCase(
      table
    )}.js\` (${table} model with validations and relationships)
- \`src/controllers/${toCamelCase(
      table
    )}Controller.js\` (business logic for ${table})
- \`src/routes/${toCamelCase(table)}Routes.js\` (API endpoints for ${table})
- \`src/services/${toCamelCase(
      table
    )}Service.js\` (business service layer for ${table})`
  )
  .join('')}`;
    } else {
      prompt += `
- \`requirements.txt\` (all project dependencies)
- \`.env\` (environment configuration)
- \`README.md\` (setup and usage instructions)
${
  webFramework === 'django'
    ? `
- \`manage.py\` (Django management script)
- \`project/settings.py\` (comprehensive Django settings)
- \`project/urls.py\` (main URL configuration)
- \`project/wsgi.py\` (WSGI configuration)
- \`core/middleware.py\` (custom middleware)
- \`core/permissions.py\` (custom permissions)
- \`core/utils.py\` (utility functions)
${tables
  .map(
    (table) => `
- \`${toSnakeCase(table)}/models.py\` (${table} model with validations)
- \`${toSnakeCase(table)}/views.py\` (ViewSets for ${table})
- \`${toSnakeCase(table)}/serializers.py\` (DRF serializers for ${table})
- \`${toSnakeCase(table)}/urls.py\` (URL patterns for ${table})
- \`${toSnakeCase(table)}/services.py\` (business logic for ${table})`
  )
  .join('')}`
    : `
- \`main.py\` (FastAPI application with comprehensive setup)
- \`database.py\` (database configuration and session management)
- \`auth.py\` (authentication and authorization)
- \`config.py\` (application configuration)
- \`exceptions.py\` (custom exception classes)
${tables
  .map(
    (table) => `
- \`models/${toSnakeCase(table)}.py\` (SQLAlchemy model for ${table})
- \`schemas/${toSnakeCase(table)}.py\` (Pydantic schemas for ${table})
- \`routes/${toSnakeCase(table)}.py\` (API endpoints for ${table})
- \`services/${toSnakeCase(table)}.py\` (business logic for ${table})`
  )
  .join('')}`
}`;
    }

    prompt += `

**Business Logic Requirements:**
- Implement proper relationship handling (foreign keys, cascading operations)
- Add business validation rules (e.g., stock quantity checks, user permissions)
- Include transaction management for complex operations
- Implement soft deletes where appropriate
- Add audit logging for important operations
- Include pagination, filtering, and search capabilities
- Implement bulk operations for efficiency
- Add caching for frequently accessed data
- Include rate limiting and security measures

**Code Quality:**
- Use proper error handling and logging
- Follow best practices and design patterns
- Include comprehensive comments for complex logic
- Use environment variables for configuration
- Implement proper data validation
- Include health check endpoints
- Use parameterized queries to prevent SQL injection

Return only the complete file contents, each prefixed with '${
      language === 'nodejs' ? '//' : '#'
    }' followed by the exact file path. No explanations or markdown formatting.

**SQL Schema:**
\`\`\`sql
${sqlQuery}
\`\`\``;

    if (!webFramework) {
      setError('Please select a web framework to continue.');
      setLoadingBackend(false);
      return;
    }

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      setError(
        'API Key is not configured. Please add your Gemini API key to the environment variables.'
      );
      setLoadingBackend(false);
      return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

    try {
      let retries = 0;
      const maxRetries = 3;
      let response;

      while (retries < maxRetries) {
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              },
            }),
          });

          if (response.ok) {
            break;
          } else if (response.status === 429) {
            const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
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
          const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
          console.warn(
            `Request failed: ${innerError.message}. Retrying in ${
              delay / 1000
            } seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      if (!response || !response.ok) {
        throw new Error(
          'Failed to generate code after multiple attempts. Please try again.'
        );
      }

      const result = await response.json();
      const generatedText =
        result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!generatedText) {
        setError(
          'No code was generated. Please verify your configuration and try again.'
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
      setError(`Code generation failed: ${err.message}`);
    } finally {
      setLoadingBackend(false);
    }
  };

  const downloadProject = async () => {
    if (generatedFiles.length === 0) {
      setError('No files available for download. Generate code first.');
      return;
    }

    const zip = new JSZip();
    generatedFiles.forEach((file) => {
      zip.file(file.path, file.content);
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const projectName = `${language}_${webFramework}_backend_${Date.now()}`;
      saveAs(content, `${projectName}.zip`);
    } catch (err) {
      console.error('Error creating project archive:', err);
      setError('Failed to download project. Please try again.');
    }
  };

  const copyContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
      setError('Failed to copy content to clipboard.');
    }
  };

  return (
    <div className='flex flex-col h-screen w-screen font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100'>
      {/* Header */}
      <header className='flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50 shadow-xl backdrop-blur-sm'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg'>
            <Database className='w-6 h-6 text-white' />
          </div>
          <div>
            <h1 className='text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Gunevo Studio
            </h1>
            <p className='text-xs text-gray-400'>
              Backend Architecture Generator
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => setIsConfigOpen(true)}
            className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105'
          >
            <Settings className='w-4 h-4' />
            Configure
          </button>
          <button
            onClick={downloadProject}
            disabled={generatedFiles.length === 0}
            className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none'
          >
            <Download className='w-4 h-4' />
            Download
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Panel */}
        <div
          className='flex flex-col w-1/2 min-w-[400px] max-w-[50%] bg-gray-800/50 border-r border-gray-600/50 flex-shrink-0 backdrop-blur-sm'
          ref={dividerRef}
        >
          {/* SQL Editor Header */}
          <div className='p-4 bg-gradient-to-r from-gray-700/60 to-gray-600/60 border-b border-gray-600/50 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Database className='w-4 h-4 text-blue-400' />
              <h2 className='text-sm font-semibold text-gray-200'>
                SQL Schema Designer
              </h2>
            </div>
            <div className='text-xs text-gray-400'>
              Design your database structure
            </div>
          </div>

          {/* SQL Editor */}
          <div
            style={{ height: `${sqlEditorHeight}%`, minHeight: '150px' }}
            className='relative'
          >
            <Editor
              height='100%'
              language='sql'
              theme='vs-dark'
              value={sqlQuery}
              onChange={(value) => setSqlQuery(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbersMinChars: 3,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  useShadows: true,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
              }}
            />
          </div>

          {/* Resizer */}
          <div
            className='h-1 bg-gradient-to-r from-gray-600 to-blue-500 cursor-ns-resize hover:from-blue-500 hover:to-purple-500 transition-all duration-300'
            onMouseDown={startDragging}
          />

          {/* Output Panel Header */}
          <div className='p-4 bg-gradient-to-r from-gray-700/60 to-gray-600/60 border-t border-gray-600/50 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Code2 className='w-4 h-4 text-green-400' />
              <h2 className='text-sm font-semibold text-gray-200'>
                Generation Output
              </h2>
            </div>
            {loadingBackend && (
              <div className='flex items-center gap-2 text-blue-400 text-sm'>
                <div className='w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin'></div>
                <span>Generating...</span>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div
            ref={streamRef}
            className='flex-1 p-4 text-xs bg-gray-900/60 overflow-y-auto custom-scrollbar whitespace-pre-wrap font-mono'
            style={{ minHeight: '150px' }}
          >
            {error && (
              <div className='mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm'>
                <strong>Error:</strong> {error}
              </div>
            )}
            {streamOutput && (
              <div className='text-gray-300 leading-relaxed'>
                {streamOutput}
              </div>
            )}
            {!streamOutput && !error && !loadingBackend && (
              <div className='flex flex-col items-center justify-center h-full text-center opacity-60'>
                <Sparkles className='w-8 h-8 text-gray-500 mb-2' />
                <p className='text-sm text-gray-500'>
                  Ready to generate your backend
                </p>
                <p className='text-xs text-gray-600 mt-1'>
                  Configure and click Generate to start
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className='flex flex-col w-1/2 min-w-[400px] flex-grow'>
          <div className='flex flex-1 overflow-hidden'>
            {/* File Tree */}
            <div className='w-1/3 min-w-[250px] max-w-[35%] bg-gray-800/50 border-r border-gray-600/50 flex-shrink-0 flex flex-col backdrop-blur-sm'>
              <div className='p-4 bg-gradient-to-r from-gray-700/60 to-gray-600/60 border-b border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <File className='w-4 h-4 text-purple-400' />
                  <h2 className='text-sm font-semibold text-gray-200'>
                    Project Files
                  </h2>
                </div>
                {generatedFiles.length > 0 && (
                  <p className='text-xs text-gray-400 mt-1'>
                    {generatedFiles.length} files generated
                  </p>
                )}
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar'>
                <FileTree
                  files={generatedFiles}
                  activeFileId={activeGeneratedFileId}
                  onFileSelect={setActiveGeneratedFileId}
                  onCopyContent={copyContent}
                />
              </div>
            </div>

            {/* Code Editor */}
            <div className='flex flex-col flex-grow bg-gray-900/60 backdrop-blur-sm'>
              <div className='p-4 bg-gradient-to-r from-gray-700/60 to-gray-600/60 border-b border-gray-600/50 flex items-center justify-between'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  {activeGeneratedFile && getFileIcon(activeGeneratedFile.name)}
                  <h2 className='text-sm font-semibold text-gray-200 truncate'>
                    {activeGeneratedFile
                      ? activeGeneratedFile.path
                      : 'Select a file to view'}
                  </h2>
                </div>
                {activeGeneratedFile && (
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => copyContent(activeGeneratedFile.content)}
                      className='flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-xs transition-all shadow-md hover:shadow-lg transform hover:scale-105'
                    >
                      {copySuccess ? (
                        <CheckCircle className='w-3 h-3' />
                      ) : (
                        <Copy className='w-3 h-3' />
                      )}
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
              <div className='flex-1 overflow-hidden'>
                {activeGeneratedFile ? (
                  <Editor
                    height='100%'
                    language={currentGeneratedCodeLanguage}
                    theme='vs-dark'
                    value={currentGeneratedCode}
                    options={{
                      readOnly: false,
                      minimap: { enabled: false },
                      fontSize: 13,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      lineNumbersMinChars: 3,
                      padding: { top: 12, bottom: 12 },
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        useShadows: true,
                        verticalHasArrows: false,
                        horizontalHasArrows: false,
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
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
                ) : (
                  <div className='flex flex-col items-center justify-center h-full text-center p-8'>
                    <div className='p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-4'>
                      <Code2 className='w-12 h-12 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-300 mb-2'>
                      No File Selected
                    </h3>
                    <p className='text-sm text-gray-500 max-w-md'>
                      Select a file from the project tree to view and edit its
                      contents, or generate a new backend to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Copy Success Toast */}
      {copySuccess && (
        <div className='fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg animate-bounce'>
          <CheckCircle className='w-4 h-4' />
          Content copied to clipboard!
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: rgba(55, 65, 81, 0.3);
        }
        
        /* Animation for the gradient backgrounds */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        /* Enhanced selection styles */
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }
        
        /* Custom focus styles */
        input:focus, select:focus, button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          transition-property: color, background-color, border-color, transform, box-shadow, opacity;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
      `}</style>
    </div>
  );
}

// Helper function for file icons (used in both FileTree and main editor)
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  const iconStyle = 'w-4 h-4 flex-shrink-0';

  switch (ext) {
    case 'js':
    case 'jsx':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
        >
          JS
        </div>
      );
    case 'py':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-blue-500 to-blue-700 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
        >
          PY
        </div>
      );
    case 'json':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-orange-400 to-orange-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
        >
          {'{}'}
        </div>
      );
    case 'sql':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-purple-500 to-purple-700 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
        >
          SQL
        </div>
      );
    case 'md':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-gray-400 to-gray-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
        >
          MD
        </div>
      );
    case 'env':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-green-500 to-green-700 rounded-sm flex items-center justify-center text-[7px] font-bold text-white shadow-sm`}
        >
          ENV
        </div>
      );
    case 'html':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-red-500 to-red-700 rounded-sm flex items-center justify-center text-[7px] font-bold text-white shadow-sm`}
        >
          HTML
        </div>
      );
    case 'css':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
        >
          CSS
        </div>
      );
    case 'ts':
    case 'tsx':
      return (
        <div
          className={`${iconStyle} bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
        >
          TS
        </div>
      );
    default:
      return <File className={`${iconStyle} text-gray-400`} />;
  }
};

export default CodeEditor;
