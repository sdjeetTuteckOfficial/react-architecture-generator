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
        onEdit: () => {
          onUpdate({
            ...node,
            data: {
              ...node.data,
              label,
              image,
            },
          });
          onClose();
        },
      },
    };
    onUpdate(updatedNode);
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm'>
      <div className='bg-white p-6 rounded shadow-lg w-96'>
        <h2 className='text-xl font-bold mb-4'>Edit Node</h2>

        <input
          type='text'
          className='w-full border p-2 mb-4'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder='Node label'
        />

        {image && (
          <img
            src={image}
            alt='Preview'
            className='mb-4 w-full h-32 object-cover rounded'
          />
        )}

        <input
          type='file'
          accept='image/*'
          onChange={handleImageUpload}
          className='mb-4'
        />

        <div className='flex justify-between gap-2 mt-2'>
          <button
            onClick={() => {
              onDelete(node.id);
              onClose();
            }}
            className='px-4 py-1 bg-red-500 text-white rounded'
          >
            Delete
          </button>

          <div className='flex gap-2'>
            <button onClick={onClose} className='px-4 py-1 bg-gray-300 rounded'>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className='px-4 py-1 bg-blue-600 text-white rounded'
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
