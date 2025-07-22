import React, { memo } from 'react';
import { Handle, Position } from 'reactflow'; // Import Handle and Position for connections

// DbTableNode component definition
const DbTableNode = ({ data, selected }) => {
  // Ensure data.fields is an array to prevent errors if it's missing
  const fields = data.fields || [];

  return (
    <div
      className={`px-4 py-2 shadow-md rounded-lg bg-white border-2 ${
        selected ? 'border-blue-500' : 'border-gray-200'
      } max-w-xs`}
      style={{ minWidth: '180px' }} // Give it a minimum width
    >
      {/* Table Name */}
      <div className='font-bold text-lg text-gray-800 border-b pb-1 mb-2'>
        {data.label || 'New Table'}
      </div>

      {/* Fields List */}
      <div className='text-sm text-gray-700'>
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <div
              key={index}
              className='flex justify-between items-center py-0.5'
            >
              <span className='font-medium'>{field.name}:</span>
              <span className='ml-2 text-gray-600'>{field.type}</span>
              <div className='flex ml-auto'>
                {field.primaryKey && (
                  <span className='ml-2 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full'>
                    PK
                  </span>
                )}
                {field.foreignKey && (
                  <span className='ml-1 px-1 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full'>
                    FK
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className='text-gray-500 italic'>No fields defined</div>
        )}
      </div>

      {/* Handles for connections */}
      {/* Top Handle for incoming/outgoing connections */}
      <Handle
        type='target'
        position={Position.Top}
        id='a'
        className='w-3 h-3 bg-blue-500'
      />
      {/* Right Handle */}
      <Handle
        type='source'
        position={Position.Right}
        id='b'
        className='w-3 h-3 bg-blue-500'
      />
      {/* Bottom Handle */}
      <Handle
        type='target'
        position={Position.Bottom}
        id='c'
        className='w-3 h-3 bg-blue-500'
      />
      {/* Left Handle */}
      <Handle
        type='source'
        position={Position.Left}
        id='d'
        className='w-3 h-3 bg-blue-500'
      />
    </div>
  );
};

export default memo(DbTableNode);
