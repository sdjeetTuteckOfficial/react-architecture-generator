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
    <div className='mb-2 flex-grow'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between text-left bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors shadow-sm'
      >
        <span className='text-base font-medium text-gray-700'>Images</span>
        <svg
          className={`w-5 h-5 transition-transform text-gray-600 ${
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
        <div className='mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-inner'>
          <input
            type='text'
            placeholder='Search images...'
            className='w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading ? (
            <div className='flex items-center justify-center py-6'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500'></div>
              <span className='ml-3 text-sm text-gray-600'>
                Loading images...
              </span>
            </div>
          ) : (
            <div className='grid grid-cols-3 gap-3 h-64 overflow-y-auto pr-2 custom-scrollbar'>
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
                    <div className='aspect-square bg-white rounded-lg border border-gray-300 p-1 flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group-hover:border-blue-400 group-hover:shadow-lg'>
                      <img
                        src={`/images/${imageName}`}
                        alt={getImageName(imageName)}
                        className='w-full h-full object-contain rounded'
                        onError={handleImageError}
                      />
                      <div className='absolute inset-0 flex w-full h-full items-center justify-center bg-gray-100 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity'>
                        <svg
                          className='w-6 h-6 text-gray-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z'
                          />
                        </svg>
                      </div>
                    </div>
                    <div className='mt-1'>
                      <span className='text-xs text-gray-600 truncate block group-hover:text-blue-700'>
                        {getImageName(imageName)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='col-span-3 text-center py-4'>
                  <div className='text-gray-400 text-2xl mb-2'>🔍</div>
                  <p className='text-gray-500 text-sm'>
                    No images match your search.
                  </p>
                </div>
              )}
            </div>
          )}
          {!loading && images.length === 0 && filteredImages.length === 0 && (
            <div className='text-center py-4'>
              <div className='text-gray-400 text-2xl mb-2'>📁</div>
              <p className='text-gray-500 text-sm'>No images found.</p>
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
    <div className='mb-4 relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between text-left bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors shadow-sm'
      >
        <span className='text-base font-medium text-gray-700'>
          {diagramType === 'architecture'
            ? 'Architecture Diagram'
            : 'DB Diagram'}
        </span>
        <svg
          className={`w-5 h-5 transition-transform text-gray-600 ${
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
        <div className='absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1'>
          <button
            onClick={() => handleSelectDiagramType('architecture')}
            className={`block w-full text-left px-4 py-2 text-sm ${
              diagramType === 'architecture'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-t-lg`}
          >
            Architecture Diagram
          </button>
          <button
            onClick={() => handleSelectDiagramType('db_diagram')}
            className={`block w-full text-left px-4 py-2 text-sm ${
              diagramType === 'db_diagram'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-b-lg`}
          >
            DB Diagram
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
      ? 'Create a database diagram first to enable export'
      : 'Export your database schema';

  return (
    <div className='mb-2 flex-grow'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExportDisabled}
        title={exportButtonTitle}
        className={`w-full flex items-center justify-between text-left bg-gray-100 p-3 rounded-lg transition-colors shadow-sm
          ${
            isExportDisabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-200'
          }`}
      >
        <span className='text-base font-medium text-gray-700'>
          {isExporting ? 'Generating SQL...' : 'Export Database Schema'}
        </span>
        {isExporting ? (
          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
        ) : (
          <svg
            className={`w-5 h-5 transition-transform text-gray-600 ${
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
        <div className='mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-inner animate-fade-in'>
          <div className='text-sm font-semibold text-gray-800 mb-2'>
            Select Database Type:
          </div>
          <div className='grid grid-cols-3 gap-2 h-28 overflow-y-auto custom-scrollbar p-1'>
            {DATABASE_OPTIONS.map((db) => (
              <button
                key={db.id}
                onClick={() => handleDatabaseExport(db.id)}
                disabled={nodes.length === 0}
                className={`flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-gray-200 shadow-sm aspect-square
                  ${
                    nodes.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 ease-in-out group transform hover:scale-105'
                  }`}
                title={nodes.length === 0 ? 'Create a diagram first' : db.name}
              >
                <span className='text-2xl'>{db.icon}</span>
              </button>
            ))}
          </div>
          {nodes.length === 0 && (
            <div className='mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg animate-fade-in'>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 text-yellow-600 mr-2 flex-shrink-0'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
                <span className='text-sm text-yellow-700'>
                  Create a database diagram first to export SQL schema.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
