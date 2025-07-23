import React from 'react';
import { Download, Upload, PlusSquare, Group, Square } from 'lucide-react'; // Import Square icon for Custom Node

export default function JamboardToolbar({
  onExport,
  onImport,
  onAddRectangle,
  onAddGroup,
  onAddCustomNode, // <--- Updated prop name to be more descriptive
  isLoading = false,
}) {
  // Define the tools and actions for the toolbar
  const tools = [
    {
      id: 'rectangle',
      icon: PlusSquare,
      label: 'Rectangle',
      onClick: onAddRectangle,
    },
    { id: 'group', icon: Group, label: 'Group', onClick: onAddGroup },
    {
      id: 'custom-node', // <--- Updated id to match the functionality
      icon: Square, // Using Square icon for a custom node
      label: 'Custom Node', // <--- Updated label to "Custom Node"
      onClick: onAddCustomNode, // <--- Updated to use the new prop name
    },
  ];

  const actions = [
    { id: 'export', icon: Download, label: 'Export JSON', onClick: onExport },
    {
      id: 'import',
      icon: Upload,
      label: 'Import JSON',
      onClick: onImport,
      isFileImport: true,
    },
  ];

  // Helper component for consistent button styling and tooltip
  const ToolButton = ({ tool, className = '' }) => (
    <button
      onClick={tool.onClick}
      disabled={isLoading} // Disable all buttons when loading
      className={`
        relative group flex items-center justify-center
        w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0
        ${isLoading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${
          tool.danger
            ? 'hover:bg-red-50 border border-transparent text-red-600 hover:border-red-300'
            : 'hover:bg-gray-100 border border-transparent text-gray-600 hover:border-gray-300'
        }
        ${className}
      `}
      title={tool.label}
    >
      <tool.icon size={16} strokeWidth={1.5} />

      {/* Tooltip */}
      <div
        className='absolute left-12 top-1/2 transform -translate-y-1/2
                   bg-gray-900 text-white text-xs px-2 py-1 rounded
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   pointer-events-none whitespace-nowrap z-[60]'
      >
        {tool.label}
      </div>
    </button>
  );

  return (
    <div
      className='absolute top-4 left-4 z-10 flex flex-col items-center gap-1
                   bg-white rounded-xl shadow-lg border border-gray-200 p-2 h-fit'
    >
      {/* Tools Section */}
      <div className='flex flex-col gap-1 w-full'>
        {tools.map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Separator */}
      <div className='h-px w-6 bg-gray-200 my-1 flex-shrink-0' />

      {/* Actions Section */}
      <div className='flex flex-col gap-1 w-full'>
        {actions.map((tool) =>
          tool.isFileImport ? (
            <label
              key={tool.id}
              htmlFor='import-flow'
              className={`
                relative group flex items-center justify-center
                w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0
                ${
                  isLoading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }
                hover:bg-gray-100 border border-transparent text-gray-600 hover:border-gray-300
              `}
              title={tool.label}
            >
              <tool.icon size={16} strokeWidth={1.5} />
              <input
                id='import-flow'
                type='file'
                accept='.json'
                onChange={tool.onClick}
                className='hidden'
                disabled={isLoading}
              />
              {/* Tooltip for import */}
              <div
                className='absolute left-12 top-1/2 transform -translate-y-1/2
                           bg-gray-900 text-white text-xs px-2 py-1 rounded
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200
                           pointer-events-none whitespace-nowrap z-[60]'
              >
                {tool.label}
              </div>
            </label>
          ) : (
            <ToolButton key={tool.id} tool={tool} />
          )
        )}
      </div>
    </div>
  );
}
