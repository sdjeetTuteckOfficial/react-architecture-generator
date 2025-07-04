import React from 'react';

export default function Sidebar() {
  const handleDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className='w-64 bg-white border-r p-4'>
      <h2 className='text-lg font-bold mb-4'>Drag Nodes</h2>
      <div
        onDragStart={(e) => handleDragStart(e, 'default')}
        draggable
        className='cursor-move bg-blue-500 text-white px-4 py-2 rounded mb-2'
      >
        Default Node
      </div>
    </div>
  );
}
