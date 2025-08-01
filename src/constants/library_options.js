export const libraryOptions = {
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
