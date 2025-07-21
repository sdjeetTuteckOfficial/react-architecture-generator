import React, { useState, useRef } from 'react';
import { Pencil, Text as TextIcon } from 'lucide-react';
import { Handle, Position, NodeResizer } from 'reactflow';

export default function CustomNode({ data, id, selected }) {
  const [hovered, setHovered] = useState(false);
  const labelRef = useRef(null);

  const handleNodeClick = (event) => {
    if (event.target.closest('.react-flow__resize-control')) {
      return;
    }
    data.onEdit(id);
  };

  return (
    <div
      className={`relative flex flex-col bg-white border-2 ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-300 shadow-md'
      } rounded-xl transition-all duration-200 ease-in-out overflow-hidden`}
      style={{
        // Make default size smaller
        width: '100%', // Allows react-flow to control initial width based on node data
        height: '100%', // Allows react-flow to control initial height
        minWidth: '100px', // Smaller default minimum width
        minHeight: '70px', // Smaller default minimum height
        background: 'linear-gradient(145deg, #f0f4f8, #e6e9ee)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleNodeClick}
    >
      {/* NodeResizer - only shows when node is selected */}
      <NodeResizer
        color='#2563eb'
        isVisible={selected}
        minWidth={80} // Allow even smaller resize
        minHeight={50} // Allow even smaller resize
        maxWidth={300} // Keep reasonable max width
        maxHeight={250} // Keep reasonable max height
      />

      {/* Handles: Distinctive and slightly larger for better usability */}
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 -top-1.5 bg-blue-600 rounded-full border-2 border-white shadow-sm' // Slightly smaller handles, less offset
      />
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 -bottom-1.5 bg-green-600 rounded-full border-2 border-white shadow-sm' // Slightly smaller handles, less offset
      />

      {/* Main content area */}
      <div className='flex flex-col items-center justify-center flex-grow p-2 text-center overflow-hidden'>
        {data.image && (
          <img
            src={data.image}
            alt='Node content'
            className='max-w-[calc(100%-10px)] max-h-[50px] object-contain mb-1' // Smaller max-h, use max-w for responsiveness
            style={{ pointerEvents: 'none' }} // Prevent image dragging issues
          />
        )}

        {/* Label: Always takes available space and wraps */}
        <div
          ref={labelRef}
          className='text-xs font-semibold text-gray-800 break-words line-clamp-3 px-1'
          style={{
            flexShrink: 0,
            // Adjust max height based on presence of image and overall node height
            maxHeight: data.image ? 'calc(100% - 60px)' : 'calc(100% - 30px)',
            overflowY: 'auto',
          }}
        >
          {/* Display placeholder icon if no image and label is empty, or if node is small */}
          {!data.image && !data.label && selected ? (
            <TextIcon size={18} className='text-gray-400' />
          ) : (
            data.label
          )}
        </div>
      </div>

      {/* Edit button: Always visible on hover or when node is selected */}
      {(hovered || selected) && (
        <button
          className='absolute top-1 right-1 bg-white text-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-100 hover:text-blue-500 transition-all duration-200 ease-in-out z-10' // Smaller button
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit(id);
          }}
          aria-label='Edit node'
        >
          <Pencil size={14} /> {/* Smaller icon */}
        </button>
      )}
    </div>
  );
}
