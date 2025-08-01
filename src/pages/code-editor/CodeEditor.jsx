import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Database,
  Code2,
  Settings,
  Download,
  Sparkles,
  CheckCircle,
  Copy,
} from 'lucide-react';
import FileTree from '../../components/FileTree';
import ConfigModal from '../../components/ConfigModal';
import FileIcon from '../../components/FileIcon';
import { parseGeneratedCode } from './utils/parseGeneratedCode';
import { toCamelCase, toSnakeCase } from './utils/stringUtils';
import { initialSqlQuery } from '../../constants/initial_sql_query';

function CodeEditor() {
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
  const [copySuccess, setCopySuccess] = useState(false); // Added missing state
  const streamRef = useRef(null);
  const sqlDividerRef = useRef(null);

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
  .join('')}
`;
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
  .join('')}
`
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

  const activeGeneratedFile = generatedFiles.find(
    (file) => file.id === activeGeneratedFileId
  );
  const currentGeneratedCode = activeGeneratedFile
    ? activeGeneratedFile.content
    : '';
  const currentGeneratedCodeLanguage = activeGeneratedFile
    ? activeGeneratedFile.language
    : 'javascript';

  const handleVerticalDrag = (e) => {
    const container = sqlDividerRef.current?.parentElement;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const newHeight =
        ((e.clientY - containerRect.top) / containerRect.height) * 100;
      if (newHeight >= 25 && newHeight <= 75) {
        setSqlEditorHeight(newHeight);
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => handleVerticalDrag(e);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    if (sqlDividerRef.current) {
      sqlDividerRef.current.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });
    }

    return () => {
      if (sqlDividerRef.current) {
        sqlDividerRef.current.removeEventListener('mousedown', handleMouseMove);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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
        {/* Left Panel (SQL Editor + Output) */}
        <div
          className='flex flex-col bg-gray-800/50 border-r border-gray-600/50 flex-shrink-0'
          style={{ width: '50%', minWidth: '300px', maxWidth: '70%' }}
          ref={sqlDividerRef}
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

          {/* Vertical Resizer (SQL Editor/Output) */}
          <div className='h-1 bg-gradient-to-r from-gray-600 to-blue-500 cursor-ns-resize hover:from-blue-500 hover:to-purple-500 transition-all duration-300' />

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

        {/* Right Panel (File Tree + Code Editor) */}
        <div className='flex flex-col flex-grow'>
          <div className='flex flex-1 overflow-hidden'>
            {/* File Tree */}
            <div
              className='bg-gray-800/50 border-r border-gray-600/50 flex-shrink-0 flex flex-col'
              style={{ width: '33%', minWidth: '200px', maxWidth: '50%' }}
            >
              <div className='p-4 bg-gradient-to-r from-gray-700/60 to-gray-600/60 border-b border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <FileIcon fileName='project' />
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
            <div className='flex flex-col flex-grow bg-gray-900/60'>
              <div className='p-4 bg-gradient-to-r from-gray-700/60 to-gray-600/60 border-b border-gray-600/50 flex items-center justify-between'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  {activeGeneratedFile && (
                    <FileIcon fileName={activeGeneratedFile.name} />
                  )}
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
              <div className='flex-1 overflow-hidden editor-container'>
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
                      wordWrap: 'off', // Enable horizontal scrolling
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
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }
        
        input:focus, select:focus, button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
        }
        
        * {
          transition-property: color, background-color, border-color, transform, box-shadow, opacity;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .editor-container {
          overflow-x: auto; /* Enable horizontal scrolling for Code Editor */
        }
      `}</style>
    </div>
  );
}

export default CodeEditor;
