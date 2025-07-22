import React, { useState, useEffect } from 'react';
import { AVAILABLE_IMAGES } from '../constants/images_constants';
// Assuming AVAILABLE_IMAGES is an array of image filenames, e.g., ['image1.png', 'image2.jpg']
// In a real application, this would likely come from an API call or dynamic file listing.

export default function Sidebar() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  const handleDragStart = (event, nodeType, imageSrc = null) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    // If it's an image node, also pass the image source
    if (imageSrc) {
      event.dataTransfer.setData('image/src', imageSrc);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const loadImages = async () => {
    setLoading(true);
    // Simulate API call to get images from public/images
    // In a real application, you might fetch these from a server endpoint
    setTimeout(() => {
      setImages(AVAILABLE_IMAGES); // Using the mock data
      setLoading(false);
    }, 300);
  };

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && images.length === 0) {
      loadImages();
    }
  };

  const getImageName = (filename) => {
    // Remove file extension for display
    return filename.split('.')[0];
  };

  const handleImageError = (e) => {
    // Fallback when image doesn't exist
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex'; // Show the fallback icon
  };

  // Filter images based on search term
  const filteredImages = images.filter((imageName) =>
    getImageName(imageName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='w-64 bg-white border-r p-4 font-sans'>
      <h2 className='text-lg font-bold mb-4 text-gray-800'>Drag Nodes</h2>

      {/* Default Node - your original code */}
      <div
        onDragStart={(e) => handleDragStart(e, 'default')}
        draggable
        className='cursor-grab active:cursor-grabbing bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors mb-4 text-center'
      >
        Default Node
      </div>

      {/* Images Dropdown */}
      <div className='mb-2'>
        <button
          onClick={handleDropdownClick}
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

        {/* Images Grid - only visible when dropdown is open */}
        {isOpen && (
          <div className='mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-inner'>
            {/* Search Bar */}
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
                {' '}
                {/* Added h-64, overflow-y-auto, and custom-scrollbar */}
                {filteredImages.length > 0 ? (
                  filteredImages.map((imageName, index) => (
                    <div
                      key={index}
                      className='text-center cursor-grab active:cursor-grabbing'
                      onDragStart={(e) =>
                        handleDragStart(e, 'imageNode', `/images/${imageName}`)
                      }
                      draggable
                    >
                      <div className='aspect-square bg-white rounded-lg border border-gray-300 p-1 flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                        {/* Actual image preview */}
                        <img
                          src={`/images/${imageName}`}
                          alt={getImageName(imageName)}
                          className='w-full h-full object-contain rounded' // Changed object-cover to object-contain for better fit
                          onError={handleImageError}
                        />

                        {/* Fallback icon when image doesn't exist */}
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

                      {/* Image name below */}
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

            {!loading && images.length === 0 && filteredImages.length === 0 && (
              <div className='text-center py-4'>
                <div className='text-gray-400 text-2xl mb-2'>📁</div>
                <p className='text-gray-500 text-sm'>No images found.</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Custom scrollbar style for better appearance */}
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
