import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setDiagramType, setUserPrompt } from '../redux/diagramSlice'; // Import Redux actions
import {
  AWS_AVAILABLE_IMAGES,
  AZURE_AVAILABLE_IMAGES,
  local_images,
} from '../constants/images_constants'; // Ensure this path is correct

// Import the gunevo.svg image
import gunevoLogo from '/public/images/gunevo.svg';

export default function Sidebar({ nodes, edges }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isImagesDropdownOpen, setIsImagesDropdownOpen] = useState(false);
  const [isDiagramTypeDropdownOpen, setIsDiagramTypeDropdownOpen] =
    useState(false);
  const [isDatabaseDropdownOpen, setIsDatabaseDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Get current diagram type and nodes/edges from Redux store
  const diagramType = useSelector((state) => state.diagram.diagramType);
  const dispatch = useDispatch();

  // Database options
  const DATABASE_OPTIONS = [
    { id: 'mysql', name: 'MySQL', icon: '🐬' },
    { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
    { id: 'sqlite', name: 'SQLite', icon: '🗃️' },
    { id: 'oracle', name: 'Oracle', icon: '🔮' },
    { id: 'sqlserver', name: 'SQL Server', icon: '🏢' },
    // MongoDB has been removed as per the request
  ];

  const handleDragStart = (
    event,
    nodeType,
    imageSrc = null,
    imageName = null
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (imageSrc) {
      event.dataTransfer.setData('image/src', imageSrc);
    }
    if (imageName) {
      event.dataTransfer.setData('image/name', imageName);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

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

  const handleImagesDropdownClick = () => {
    setIsImagesDropdownOpen(!isImagesDropdownOpen);
    if (!isImagesDropdownOpen && images.length === 0) {
      loadImages();
    }
  };

  const handleDiagramTypeDropdownClick = () => {
    setIsDiagramTypeDropdownOpen(!isDiagramTypeDropdownOpen);
  };

  const handleDatabaseDropdownClick = () => {
    setIsDatabaseDropdownOpen(!isDatabaseDropdownOpen);
  };

  const handleSelectDiagramType = (type) => {
    dispatch(setDiagramType(type));
    setIsDiagramTypeDropdownOpen(false);
  };

  const generateSQLWithGemini = async (databaseType, diagramData) => {
    // In a real application, you would load this from an environment variable or secure configuration.
    // For this example, we'll keep it as an empty string, as per instructions for Canvas.
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const prompt = `
        Generate SQL DDL (Data Definition Language) statements for ${databaseType} database based on the following diagram structure:
        
        Nodes: ${JSON.stringify(diagramData.nodes, null, 2)}
        Edges: ${JSON.stringify(diagramData.edges, null, 2)}
        
        Please create:
        1. CREATE TABLE statements for each entity
        2. Primary and foreign key constraints
        3. Appropriate data types for ${databaseType}
        4. Index suggestions where appropriate
        5. Comments explaining the structure
        
        Format the output as clean, executable SQL statements.
      `;

      const payload = { contents: [{ parts: [{ text: prompt }] }] };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No SQL generated';
    } catch (error) {
      console.error('Error generating SQL:', error);
      throw error;
    }
  };

  const downloadTextFile = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDatabaseExport = async (databaseType) => {
    // This check is already in place and will show a message box.
    // The buttons will now be disabled if nodes are empty, preventing this from being reached.
    if (nodes.length === 0) {
      showCustomMessageBox(
        'No diagram data found.',
        'Please create a database diagram first.',
        'warning'
      );
      return;
    }

    setIsExporting(true);
    setIsDatabaseDropdownOpen(false);

    try {
      const diagramData = { nodes, edges };
      const sqlContent = await generateSQLWithGemini(databaseType, diagramData);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${databaseType}_schema_export_${timestamp}.sql`;

      downloadTextFile(sqlContent, filename);

      // Show success message
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

  const getImageName = (filename) => {
    return filename.split('.')[0];
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    // Ensure the fallback div becomes fully opaque on error
    if (e.target.nextSibling) {
      e.target.nextSibling.style.opacity = '1';
      e.target.nextSibling.style.display = 'flex'; // Ensure it's flex if it wasn't already
    }
  };

  const filteredImages = images.filter((imageName) =>
    getImageName(imageName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    console.log('User logged out!');
    localStorage.clear();
    navigate('/login');
  };

  // Custom message box component
  const CustomMessageBox = ({ message, title, type, onClose }) => {
    let bgColor, borderColor, textColor;
    switch (type) {
      case 'success':
        bgColor = 'bg-green-100';
        borderColor = 'border-green-400';
        textColor = 'text-green-700';
        break;
      case 'error':
        bgColor = 'bg-red-100';
        borderColor = 'border-red-400';
        textColor = 'text-red-700';
        break;
      case 'warning':
        bgColor = 'bg-yellow-100';
        borderColor = 'border-yellow-400';
        textColor = 'text-yellow-700';
        break;
      default:
        bgColor = 'bg-blue-100';
        borderColor = 'border-blue-400';
        textColor = 'text-blue-700';
    }

    return (
      <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'>
        <div
          className={`rounded-lg shadow-xl p-6 max-w-sm w-full ${bgColor} border ${borderColor}`}
        >
          <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>{title}</h3>
          <p className={`text-sm mb-4 ${textColor}`}>{message}</p>
          <button
            onClick={onClose}
            className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors'
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  const [messageBox, setMessageBox] = useState(null);

  const showCustomMessageBox = (title, message, type) => {
    setMessageBox({ title, message, type });
  };

  const closeCustomMessageBox = () => {
    setMessageBox(null);
  };

  const isExportDisabled = isExporting || nodes.length === 0;
  const exportButtonTitle =
    nodes.length === 0
      ? 'Create a database diagram first to enable export'
      : 'Export your database schema';

  return (
    <div className='w-64 bg-white border-r p-4 font-sans flex flex-col h-full'>
      {/* Logo */}
      <div className='mb-4 text-center'>
        <img src={gunevoLogo} alt='Gunevo Logo' className='w-48 mx-auto' />
      </div>

      {/* Diagram Type Dropdown */}
      <div className='mb-4 relative'>
        <button
          onClick={handleDiagramTypeDropdownClick}
          className='w-full flex items-center justify-between text-left bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors shadow-sm'
        >
          <span className='text-base font-medium text-gray-700'>
            {diagramType === 'architecture'
              ? 'Architecture Diagram'
              : 'DB Diagram'}
          </span>
          <svg
            className={`w-5 h-5 transition-transform text-gray-600 ${
              isDiagramTypeDropdownOpen ? 'rotate-180' : ''
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
        {isDiagramTypeDropdownOpen && (
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

      {/* Images Dropdown (only for architecture diagrams) */}
      {diagramType === 'architecture' && (
        <div className='mb-2 flex-grow'>
          <button
            onClick={handleImagesDropdownClick}
            className='w-full flex items-center justify-between text-left bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors shadow-sm'
          >
            <span className='text-base font-medium text-gray-700'>Images</span>
            <svg
              className={`w-5 h-5 transition-transform text-gray-600 ${
                isImagesDropdownOpen ? 'rotate-180' : ''
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
          {isImagesDropdownOpen && (
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
                        className='text-center cursor-grab active:cursor-grabbing group' // Added group class
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
                          {' '}
                          {/* Enhanced hover styles */}
                          <img
                            src={`/images/${imageName}`}
                            alt={getImageName(imageName)}
                            className='w-full h-full object-contain rounded'
                            onError={handleImageError}
                          />
                          {/* Fallback div now subtly visible on hover, fully on error */}
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
                            {' '}
                            {/* Text color change on hover */}
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

              {!loading &&
                images.length === 0 &&
                filteredImages.length === 0 && (
                  <div className='text-center py-4'>
                    <div className='text-gray-400 text-2xl mb-2'>📁</div>
                    <p className='text-gray-500 text-sm'>No images found.</p>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* Database Export Dropdown (only for DB diagrams) */}
      {diagramType === 'db_diagram' && (
        <div className='mb-2 flex-grow'>
          <button
            onClick={handleDatabaseDropdownClick}
            disabled={isExportDisabled} // Disabled if exporting or no nodes
            title={exportButtonTitle} // Tooltip for disabled state
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
                  isDatabaseDropdownOpen ? 'rotate-180' : ''
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
          {isDatabaseDropdownOpen && !isExporting && (
            <div className='mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-inner animate-fade-in'>
              <div className='text-sm font-semibold text-gray-800 mb-2'>
                {' '}
                {/* Updated styling for the label */}
                Select Database Type:
              </div>
              <div className='grid grid-cols-3 gap-2 h-28 overflow-y-auto custom-scrollbar p-1'>
                {' '}
                {/* Changed to grid, fixed height, scrollable */}
                {DATABASE_OPTIONS.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => handleDatabaseExport(db.id)}
                    disabled={nodes.length === 0} // Disable individual buttons if no nodes
                    className={`flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-gray-200 shadow-sm aspect-square
                      ${
                        nodes.length === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 ease-in-out group transform hover:scale-105'
                      }`}
                    title={
                      nodes.length === 0 ? 'Create a diagram first' : db.name
                    } // Added title for tooltip on hover
                  >
                    <span className='text-2xl'>{db.icon}</span>{' '}
                    {/* Larger icon */}
                    {/* Removed db.name span and SVG download icon */}
                  </button>
                ))}
              </div>
              {nodes.length === 0 && ( // This block is inside the dropdown content
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
      )}

      {/* Logout Button */}
      <div className='mt-auto pt-4 border-t border-gray-200'>
        <button
          onClick={handleLogout}
          className='w-full flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors'
        >
          <svg
            className='w-5 h-5 mr-2'
            fill='none'
            stroke='currentColor'
            viewB='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1'
            ></path>
          </svg>
          Logout
        </button>
      </div>
      {messageBox && (
        <CustomMessageBox
          title={messageBox.title}
          message={messageBox.message}
          type={messageBox.type}
          onClose={closeCustomMessageBox}
        />
      )}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
