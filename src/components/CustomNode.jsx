// CustomNode.js
import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Handle, Position } from 'reactflow';

export default function CustomNode({ data, id }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className='relative bg-white border rounded shadow-md p-2 w-40 text-center'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Minimal handles: one input (top) and one output (bottom) */}
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 bg-blue-500'
      />
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 bg-green-500'
      />

      {data.image && (
        <img
          src={data.image}
          alt='Node'
          className='h-24 w-full object-cover rounded mb-1'
        />
      )}

      <div className='text-sm font-medium'>{data.label}</div>

      {hovered && (
        <button
          className='absolute top-1 right-1 bg-white shadow p-1 rounded hover:bg-gray-100'
          onClick={() => data.onEdit(id)}
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}
