import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Edit, Plus, Trash2 } from 'lucide-react';

// DbTableNode component definition
const DbTableNode = ({ data, selected, id }) => {
  // Ensure data.fields is an array to prevent errors if it's missing
  const fields = data.fields || [];

  // Handle edit button click
  const handleEdit = (e) => {
    e.stopPropagation(); // Prevent node selection when clicking edit
    if (data.onEdit) {
      data.onEdit(id);
    }
  };

  return (
    <div
      className={`px-4 py-2 shadow-md rounded-lg bg-white border-2 ${
        selected ? 'border-blue-500' : 'border-gray-200'
      } max-w-xs relative group`}
      style={{ minWidth: '180px' }} // Give it a minimum width
    >
      {/* Edit Button - appears on hover */}
      <button
        onClick={handleEdit}
        className='absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-blue-600'
        title='Edit table'
      >
        <Edit size={12} />
      </button>

      {/* Table Name */}
      <div className='font-bold text-lg text-gray-800 border-b pb-1 mb-2 flex items-center justify-between'>
        <span>{data.label || 'New Table'}</span>
        {/* Table type indicator */}
        <span className='text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full'>
          TABLE
        </span>
      </div>

      {/* Fields List */}
      <div className='text-sm text-gray-700'>
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <div
              key={index}
              className='flex justify-between items-center py-1 hover:bg-gray-50 px-1 rounded'
            >
              <div className='flex-1'>
                <div className='flex items-center'>
                  <span className='font-medium text-gray-800'>
                    {field.name}
                  </span>
                  <span className='ml-2 text-gray-600 text-xs'>
                    ({field.type})
                  </span>
                </div>
                <div className='flex mt-0.5'>
                  {field.primaryKey && (
                    <span className='mr-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full'>
                      PK
                    </span>
                  )}
                  {field.foreignKey && (
                    <span className='mr-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full'>
                      FK
                    </span>
                  )}
                  {field.nullable === false && (
                    <span className='mr-1 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full'>
                      NOT NULL
                    </span>
                  )}
                  {field.unique && (
                    <span className='mr-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full'>
                      UNIQUE
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='text-gray-500 italic py-2 text-center'>
            No fields defined
            <div className='text-xs mt-1'>Click edit to add fields</div>
          </div>
        )}
      </div>

      {/* Quick stats */}
      {fields.length > 0 && (
        <div className='mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between'>
          <span>
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </span>
          <span>
            {fields.filter((f) => f.primaryKey).length} PK,{' '}
            {fields.filter((f) => f.foreignKey).length} FK
          </span>
        </div>
      )}

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
