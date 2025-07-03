import { useState } from 'react';

export default function Sidebar({ selected, elements, setElements }) {
  const [label, setLabel] = useState('');

  const handleUpdate = () => {
    if (!selected) return;
    setElements((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === selected.id ? { ...n, data: { ...n.data, label } } : n
      ),
    }));
  };

  const handleDelete = () => {
    if (!selected) return;
    setElements((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== selected.id),
      edges: prev.edges.filter(
        (e) => e.source !== selected.id && e.target !== selected.id
      ),
    }));
  };

  return (
    <div className='w-64 bg-white border-r p-4'>
      <h2 className='text-lg font-bold mb-4'>Sidebar</h2>
      {selected ? (
        <>
          <p className='text-sm text-gray-600 mb-2'>
            Selected Node: {selected.id}
          </p>
          <input
            className='w-full p-2 border mb-2'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder='Update label'
          />
          <button
            className='bg-blue-500 text-white px-4 py-1 rounded mr-2'
            onClick={handleUpdate}
          >
            Update
          </button>
          <button
            className='bg-red-500 text-white px-4 py-1 rounded'
            onClick={handleDelete}
          >
            Delete
          </button>
        </>
      ) : (
        <p className='text-sm text-gray-500'>No node selected</p>
      )}
    </div>
  );
}
