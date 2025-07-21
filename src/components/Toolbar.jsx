import React from 'react';
import { Download, Upload, PlusSquare, Group } from 'lucide-react'; // Import icons

export default function Toolbar({
  onExport,
  onImport,
  onAddRectangle,
  onAddGroup,
  isLoading = false, // Add a prop for loading state
}) {
  return (
    <div className='absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-lg flex space-x-2'>
      <button
        onClick={onExport}
        className='px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center gap-1'
        title='Export Flow as JSON'
        disabled={isLoading} // Disable buttons during loading
      >
        <Download size={16} /> Export
      </button>
      <label
        htmlFor='import-flow'
        className={`px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-1 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Upload size={16} /> Import
        <input
          id='import-flow'
          type='file'
          accept='.json'
          onChange={onImport}
          className='hidden'
          disabled={isLoading}
        />
      </label>
      <div className='w-px bg-gray-200 mx-2' /> {/* Separator */}
      <button
        onClick={onAddRectangle}
        className='px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1'
        title='Add Resizable Rectangle (Ctrl+R)'
        disabled={isLoading}
      >
        <PlusSquare size={16} /> Rectangle
      </button>
      <button
        onClick={onAddGroup}
        className='px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1'
        title='Add Styled Group (Ctrl+G)'
        disabled={isLoading}
      >
        <Group size={16} /> Group
      </button>
    </div>
  );
}
