import React, { useEffect, useState } from 'react';

export default function EditModal({
  isOpen,
  node,
  onClose,
  onUpdate,
  onDelete,
}) {
  const [label, setLabel] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    console.log('hitting', node);
    if (node) {
      setLabel(node.data?.label || '');
      setImage(node.data?.image || null);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSubmit = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        label,
        image,
      },
    };
    onUpdate(updatedNode);
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-xl shadow-2xl w-80 mx-4'>
        {/* Header */}
        <div className='px-5 py-4 border-b border-gray-100 relative'>
          <h2 className='text-lg font-semibold text-gray-800 pr-8'>
            Edit Node
          </h2>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all'
            title='Close'
          >
            <svg
              className='w-4 h-4'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <line x1='18' y1='6' x2='6' y2='18'></line>
              <line x1='6' y1='6' x2='18' y2='18'></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='px-5 py-4 space-y-3'>
          {/* Label Input */}
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Label
            </label>
            <input
              type='text'
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='Enter label...'
            />
          </div>

          {/* Image Section */}
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Image
            </label>

            {/* Image Preview */}
            {image && (
              <div className='relative mb-2 group'>
                <div className='w-16 h-16 mx-auto rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm'>
                  <img
                    src={image}
                    alt='Preview'
                    className='w-full h-full object-cover transition-transform group-hover:scale-110'
                    onError={() => {
                      console.error('Failed to load image');
                      setImage(null);
                    }}
                  />
                </div>
                <button
                  onClick={removeImage}
                  className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg'
                  title='Remove image'
                >
                  ×
                </button>
              </div>
            )}

            {/* File Input */}
            <div className='relative'>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                id='image-upload'
              />
              <label
                htmlFor='image-upload'
                className='flex items-center justify-center w-full h-10 px-3 py-2 text-xs border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all'
              >
                <span className='text-gray-500'>
                  {image ? 'Change' : '+ Add Image'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl'>
          <div className='flex justify-between items-center'>
            {/* Delete Button */}
            <button
              onClick={() => {
                if (window.confirm('Delete this node?')) {
                  onDelete(node.id);
                  onClose();
                }
              }}
              className='px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm'
            >
              Delete
            </button>

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <button
                onClick={onClose}
                className='px-3 py-1.5 text-xs bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className='px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!label.trim()}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
