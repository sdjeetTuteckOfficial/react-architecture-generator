import React, { useState, useRef } from 'react';
import { Pencil, Type } from 'lucide-react';
import { Handle, Position, NodeResizer } from 'reactflow';

export default function CustomNode({ data = {}, id = '1', selected = true }) {
  const [hovered, setHovered] = useState(false);
  const labelRef = useRef(null);

  const handleNodeClick = (event) => {
    if (
      event.target.closest('.react-flow__resize-control') ||
      event.target.closest('.react-flow__handle')
    ) {
      return;
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-white border-2 ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-300 shadow-md'
      } rounded-xl transition-all duration-200 ease-in-out`}
      style={{
        width: '100%',
        height: '100%',
        minWidth: '100px',
        minHeight: '70px',
        background: 'linear-gradient(145deg, #f0f4f8, #e6e9ee)',
        overflow: 'visible',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleNodeClick}
    >
      <NodeResizer
        color='#2563eb'
        isVisible={selected}
        minWidth={80}
        minHeight={50}
        maxWidth={300}
        maxHeight={250}
      />

      <Handle
        type='target'
        position={Position.Top}
        id='target-top'
        style={{
          top: 0,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '8px',
          backgroundColor: '#3b82f6',
          border: '2px solid white',
          borderRadius: '50%',
          zIndex: 1000,
        }}
      />
      <Handle
        type='source'
        position={Position.Bottom}
        id='source-bottom'
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translate(-50%, 50%)',
          width: '8px',
          height: '8px',
          backgroundColor: '#10b981',
          border: '2px solid white',
          borderRadius: '50%',
          zIndex: 1000,
        }}
      />

      {/* Main content area */}
      <div
        className='flex flex-col items-center justify-center flex-grow p-3 text-center'
        style={{
          overflow: 'visible',
          gap: '4px',
        }}
      >
        {data.image && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '4px',
              minHeight: '50px',
              maxHeight: '50px',
            }}
          >
            <img
              src={data.image}
              alt='Node content'
              style={{
                maxWidth: 'calc(100% - 10px)',
                maxHeight: '50px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none',
              }}
              crossOrigin='anonymous'
            />
          </div>
        )}

        {/* Label with proper text wrapping */}
        <div
          ref={labelRef}
          className='text-xs font-semibold text-gray-800'
          style={{
            width: '100%',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            hyphens: 'auto',
            lineHeight: '1.4',
            textAlign: 'center',
            display: 'block',
            paddingLeft: '4px',
            paddingRight: '4px',
          }}
        >
          {!data.image && !data.label && selected ? (
            <Type size={18} className='text-gray-400' />
          ) : (
            data.label || 'Sample Node Text'
          )}
        </div>
      </div>

      {(hovered || selected) && (
        <button
          className='absolute top-1 right-1 bg-white text-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-100 hover:text-blue-500 transition-all duration-200 ease-in-out z-20'
          onClick={(e) => {
            e.stopPropagation();
            if (data.onEdit) {
              console.log('hit', id);
              data.onEdit(id);
            }
          }}
          aria-label='Edit node'
        >
          <Pencil size={24} />
        </button>
      )}
    </div>
  );
}
