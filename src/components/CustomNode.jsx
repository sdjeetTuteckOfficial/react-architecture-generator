import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Handle, Position, NodeResizer } from 'reactflow';

export default function CustomNode({ data, id, selected }) {
  const [hovered, setHovered] = useState(false);

  const handleNodeClick = (event) => {
    // Prevent edit modal from opening when clicking on resize handles
    if (event.target.closest('.react-flow__resize-control')) {
      return;
    }
    data.onEdit(id);
  };

  return (
    <div
      className='relative bg-white border rounded shadow-md p-2 text-center'
      style={{
        width: '100%',
        height: '100%',
        minWidth: '120px',
        minHeight: '80px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleNodeClick}
    >
      {/* NodeResizer - only shows when node is selected */}
      <NodeResizer
        color='#ff0071'
        isVisible={selected}
        minWidth={120}
        minHeight={80}
        maxWidth={400}
        maxHeight={300}
      />

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
          className='w-full object-cover rounded mb-1'
          style={{
            height: 'calc(100% - 60px)', // Adjust based on text height
            maxHeight: '200px',
          }}
        />
      )}

      <div className='text-sm font-medium break-words'>{data.label}</div>

      {hovered && (
        <button
          className='absolute top-1 right-1 bg-white shadow p-1 rounded hover:bg-gray-100 z-10'
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit(id);
          }}
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}
