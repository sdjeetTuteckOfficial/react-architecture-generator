import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setDiagramType, setUserPrompt } from '../redux/diagramSlice'; // Import Redux actions
import {
  AWS_AVAILABLE_IMAGES,
  AZURE_AVAILABLE_IMAGES,
  local_images,
} from '../constants/images_constants'; // Ensure this path is correct

export default function Sidebar() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isImagesDropdownOpen, setIsImagesDropdownOpen] = useState(false); // Renamed for clarity
  const [isDiagramTypeDropdownOpen, setIsDiagramTypeDropdownOpen] =
    useState(false); // New state for diagram type dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Get current diagram type from Redux store
  const diagramType = useSelector((state) => state.diagram.diagramType);
  const dispatch = useDispatch();

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
    // Renamed handler
    setIsImagesDropdownOpen(!isImagesDropdownOpen);
    if (!isImagesDropdownOpen && images.length === 0) {
      loadImages();
    }
  };

  const handleDiagramTypeDropdownClick = () => {
    // New handler
    setIsDiagramTypeDropdownOpen(!isDiagramTypeDropdownOpen);
  };

  const handleSelectDiagramType = (type) => {
    // New handler
    dispatch(setDiagramType(type)); // Dispatch action to update Redux store
    setIsDiagramTypeDropdownOpen(false); // Close dropdown after selection
  };

  const getImageName = (filename) => {
    return filename.split('.')[0];
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  const filteredImages = images.filter((imageName) =>
    getImageName(imageName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    console.log('User logged out!');
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className='w-64 bg-white border-r p-4 font-sans flex flex-col h-full'>
      <h2 className='text-lg font-bold mb-4 text-gray-800'>Drag Nodes</h2>

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

      {/* REMOVED: Default Node (previously here) */}
      {/*
      <div
        onDragStart={(e) => handleDragStart(e, 'default')}
        draggable
        className='cursor-grab active:cursor-grabbing bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors mb-4 text-center'
      >
        Default Node
      </div>
      */}

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
                        className='text-center cursor-grab active:cursor-grabbing'
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
                        <div className='aspect-square bg-white rounded-lg border border-gray-300 p-1 flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                          <img
                            src={`/images/${imageName}`}
                            alt={getImageName(imageName)}
                            className='w-full h-full object-contain rounded'
                            onError={handleImageError}
                          />
                          <div className='absolute inset-0 hidden w-full h-full items-center justify-center bg-gray-100 rounded-lg'>
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
                          <span className='text-xs text-gray-600 truncate block'>
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

      {/* --- Logout Button --- */}
      <div className='mt-auto pt-4 border-t border-gray-200'>
        <button
          onClick={handleLogout}
          className='w-full flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors'
        >
          <svg
            className='w-5 h-5 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
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
      `}</style>
    </div>
  );
}
