import React, { useState, useEffect } from 'react';
import {
  AWS_AVAILABLE_IMAGES,
  AZURE_AVAILABLE_IMAGES,
  local_images,
} from '../../constants/images_constants';
import {
  generateSQLWithGemini,
  downloadTextFile,
  getImageName,
  handleImageError,
} from './utils';

export function ImagesDropdown({ isOpen, setIsOpen, handleDragStart }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadImages = async () => {
    setLoading(true);
    setTimeout(() => {
      setImages([
        ...AWS_AVAILABLE_IMAGES,
        ...AZURE_AVAILABLE_IMAGES,
        ...local_images,
      ]);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (isOpen && images.length === 0) {
      loadImages();
    }
  }, [isOpen]);

  const filteredImages = images.filter((imageName) =>
    getImageName(imageName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex-shrink-0'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between text-left bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors text-sm'
      >
        <span className='font-medium text-gray-700'>Images</span>
        <svg
          className={`w-4 h-4 transition-transform text-gray-600 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='mt-2 border border-gray-200 rounded-md p-2 bg-gray-50'>
          <input
            type='text'
            placeholder='Search...'
            className='w-full px-2 py-1 border border-gray-300 rounded text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {loading ? (
            <div className='flex items-center justify-center py-4'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
              <span className='ml-2 text-xs text-gray-600'>Loading...</span>
            </div>
          ) : (
            <div className='grid grid-cols-4 gap-1 h-40 overflow-y-auto custom-scrollbar'>
              {filteredImages.length > 0 ? (
                filteredImages.map((imageName, index) => (
                  <div
                    key={index}
                    className='text-center cursor-grab active:cursor-grabbing group'
                    onDragStart={(e) =>
                      handleDragStart(
                        e,
                        'imageNode',
                        `/images/${imageName}`,
                        getImageName(imageName)
                      )
                    }
                    draggable
                  >
                    <div className='aspect-square bg-white rounded border border-gray-300 p-0.5 flex items-center justify-center relative overflow-hidden hover:border-blue-400 transition-colors'>
                      <img
                        src={`/images/${imageName}`}
                        alt={getImageName(imageName)}
                        className='w-full h-full object-contain rounded'
                        onError={handleImageError}
                      />
                    </div>
                    <span
                      className='text-xs text-gray-600 truncate block mt-0.5'
                      title={getImageName(imageName)}
                    >
                      {getImageName(imageName)}
                    </span>
                  </div>
                ))
              ) : (
                <div className='col-span-4 text-center py-4'>
                  <p className='text-gray-500 text-xs'>No images found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DiagramTypeDropdown({
  isOpen,
  setIsOpen,
  diagramType,
  handleSelectDiagramType,
}) {
  return (
    <div className='relative flex-shrink-0'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between text-left bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors text-sm'
      >
        <span className='font-medium text-gray-700'>
          {diagramType === 'architecture' ? 'Architecture' : 'Database'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform text-gray-600 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1'>
          <button
            onClick={() => handleSelectDiagramType('architecture')}
            className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
              diagramType === 'architecture'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-t-md`}
          >
            Architecture
          </button>
          <button
            onClick={() => handleSelectDiagramType('db_diagram')}
            className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
              diagramType === 'db_diagram'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-b-md`}
          >
            Database
          </button>
        </div>
      )}
    </div>
  );
}

export function DatabaseDropdown({
  isOpen,
  setIsOpen,
  nodes,
  edges,
  showCustomMessageBox,
}) {
  const [isExporting, setIsExporting] = useState(false);
  const DATABASE_OPTIONS = [
    { id: 'mysql', name: 'MySQL', icon: '🐬' },
    { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
    { id: 'sqlite', name: 'SQLite', icon: '🗃️' },
    { id: 'oracle', name: 'Oracle', icon: '🔮' },
    { id: 'sqlserver', name: 'SQL Server', icon: '🏢' },
  ];

  const handleDatabaseExport = async (databaseType) => {
    if (nodes.length === 0) {
      showCustomMessageBox(
        'No diagram data found.',
        'Please create a database diagram first.',
        'warning'
      );
      return;
    }

    setIsExporting(true);
    setIsOpen(false);

    try {
      const diagramData = { nodes, edges };
      const sqlContent = await generateSQLWithGemini(databaseType, diagramData);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${databaseType}_schema_export_${timestamp}.sql`;
      downloadTextFile(sqlContent, filename);
      showCustomMessageBox(
        'SQL Export Successful!',
        `SQL file generated successfully for ${databaseType}!`,
        'success'
      );
    } catch (error) {
      console.error('Export failed:', error);
      showCustomMessageBox(
        'Export Failed',
        'Failed to generate SQL file. Please check your API key and try again.',
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const isExportDisabled = isExporting || nodes.length === 0;
  const exportButtonTitle =
    nodes.length === 0
      ? 'Create a database diagram first'
      : 'Export your database schema';

  return (
    <div className='flex-shrink-0'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExportDisabled}
        title={exportButtonTitle}
        className={`w-full flex items-center justify-between text-left bg-gray-100 p-2 rounded-md transition-colors text-sm
          ${
            isExportDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-200'
          }`}
      >
        <span className='font-medium text-gray-700'>
          {isExporting ? 'Generating...' : 'Export SQL'}
        </span>
        {isExporting ? (
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
        ) : (
          <svg
            className={`w-4 h-4 transition-transform text-gray-600 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        )}
      </button>

      {isOpen && !isExporting && (
        <div className='mt-2 border border-gray-200 rounded-md p-2 bg-gray-50'>
          <div className='text-xs font-medium text-gray-800 mb-2'>
            Select Database:
          </div>
          <div className='grid grid-cols-5 gap-1'>
            {DATABASE_OPTIONS.map((db) => (
              <button
                key={db.id}
                onClick={() => handleDatabaseExport(db.id)}
                disabled={nodes.length === 0}
                className={`flex flex-col items-center justify-center p-2 bg-white rounded border border-gray-200 aspect-square text-xs
                  ${
                    nodes.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-blue-400 hover:bg-blue-50 transition-all transform hover:scale-105'
                  }`}
                title={nodes.length === 0 ? 'Create a diagram first' : db.name}
              >
                <span className='text-lg mb-1'>{db.icon}</span>
                <span className='text-xs text-center leading-tight'>
                  {db.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {nodes.length === 0 && (
            <div className='mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700'>
              ⚠️ Create a database diagram first to export SQL schema.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
