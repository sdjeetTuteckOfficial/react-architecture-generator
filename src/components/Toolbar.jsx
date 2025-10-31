import React from 'react';
import {
  Download,
  Upload,
  PlusSquare,
  Group,
  Square,
  Table,
  Camera,
} from 'lucide-react';
import { useSelector } from 'react-redux';

export default function JamboardToolbar({
  onExport,
  onImport,
  onAddRectangle,
  onAddGroup,
  onAddCustomNode,
  onScreenshot,
  isLoading = false,
}) {
  const diagramType = useSelector((state) => state.diagram.diagramType);

  const commonTools = [
    {
      id: 'rectangle',
      icon: PlusSquare,
      label: 'Rectangle',
      onClick: onAddRectangle,
    },
    { id: 'group', icon: Group, label: 'Group', onClick: onAddGroup },
  ];

  const architectureTools = [
    {
      id: 'custom-node',
      icon: Square,
      label: 'Custom Node',
      onClick: () => onAddCustomNode('New custom Node', 'custom'),
    },
  ];

  const dbDiagramTools = [
    {
      id: 'db-table',
      icon: Table,
      label: 'DB Table',
      onClick: () => onAddCustomNode('New db Node', 'dbTableNode'),
    },
  ];

  const currentTools =
    diagramType === 'architecture'
      ? [...commonTools, ...architectureTools]
      : diagramType === 'db_diagram'
      ? [...commonTools, ...dbDiagramTools]
      : commonTools;

  const actions = [
    {
      id: 'screenshot',
      icon: Camera,
      label: 'Screenshot',
      onClick: onScreenshot,
    },
    {
      id: 'export',
      icon: Download,
      label: 'Export JSON',
      onClick: onExport,
    },
    {
      id: 'import',
      icon: Upload,
      label: 'Import JSON',
      onClick: onImport,
      isFileImport: true,
    },
  ];

  const ToolButton = ({ tool, className = '' }) => (
    <button
      onClick={tool.onClick}
      disabled={isLoading}
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
      <div className='flex flex-col gap-1 w-full'>
        {currentTools.map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      </div>

      <div className='h-px w-6 bg-gray-200 my-1 flex-shrink-0' />

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
