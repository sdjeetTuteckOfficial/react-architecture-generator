import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Copy,
  Search,
  X,
  Code2,
} from 'lucide-react';
import FileIcon from './FileIcon';

const FileTree = ({ files, activeFileId, onFileSelect, onCopyContent }) => {
  const [expandedDirs, setExpandedDirs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const tree = {};
  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = tree;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = { ...file, type: 'file' };
      } else {
        if (!current[part]) {
          current[part] = { type: 'directory', children: {} };
        }
        current = current[part].children;
      }
    });
  });

  const toggleDirectory = (path) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderTree = (node, path = '', depth = 0) => {
    const filteredEntries = Object.entries(node)
      .filter(([key, item]) => {
        if (item.type === 'file') {
          return key.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return (
          JSON.stringify(item.children)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          key.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => {
        const aIsDir = a[1].type === 'directory';
        const bIsDir = b[1].type === 'directory';
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a[0].localeCompare(b[0]);
      });

    return filteredEntries.map(([key, item]) => {
      const currentPath = path ? `${path}/${key}` : key;
      const paddingLeft = `${depth * 12 + 8}px`;

      if (item.type === 'directory') {
        const isExpanded = expandedDirs[currentPath] === true;
        return (
          <div key={currentPath}>
            <div
              className='flex items-center h-7 px-2 text-xs cursor-pointer hover:bg-gray-700/60 text-gray-300 transition-all duration-200 group'
              style={{ paddingLeft }}
              onClick={() => toggleDirectory(currentPath)}
            >
              {isExpanded ? (
                <ChevronDown className='w-3 h-3 mr-2 text-gray-500 group-hover:text-blue-400 transition-colors' />
              ) : (
                <ChevronRight className='w-3 h-3 mr-2 text-gray-500 group-hover:text-blue-400 transition-colors' />
              )}
              {isExpanded ? (
                <FolderOpen className='w-3 h-3 mr-2 text-blue-400' />
              ) : (
                <Folder className='w-3 h-3 mr-2 text-blue-500' />
              )}
              <span className='truncate font-medium'>{key}</span>
            </div>
            {isExpanded && renderTree(item.children, currentPath, depth + 1)}
          </div>
        );
      } else {
        return (
          <div
            key={item.id}
            className={`flex items-center h-7 px-2 text-xs cursor-pointer hover:bg-gray-700/60 group ${
              activeFileId === item.id
                ? 'bg-gradient-to-r from-blue-600/40 to-purple-600/20 text-white border-r-2 border-blue-400'
                : 'text-gray-300'
            } transition-all duration-200`}
            style={{ paddingLeft }}
            onClick={() => onFileSelect(item.id)}
          >
            <FileIcon
              fileName={item.name}
              iconSize='w-3 h-3 mr-2 flex-shrink-0'
            />
            <span className='truncate flex-1 font-medium'>{item.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyContent(item.content);
              }}
              className='opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-600 rounded transition-all duration-200'
              title='Copy content'
            >
              <Copy className='w-3 h-3 text-gray-400 hover:text-blue-400' />
            </button>
          </div>
        );
      }
    });
  };

  return (
    <div className='flex flex-col h-full bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl overflow-hidden border border-gray-700'>
      <div className='p-3 border-b border-gray-700 bg-gradient-to-r from-gray-700/80 to-gray-600/80'>
        <div className='relative'>
          <Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search files...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-8 pr-7 py-1.5 text-xs bg-gray-900/60 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all'
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className='absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>
      <div className='flex-1 overflow-y-auto custom-scrollbar'>
        {files.length > 0 ? (
          <div className='py-1'>{renderTree(tree)}</div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full p-4 text-center'>
            <Code2 className='w-8 h-8 text-gray-500 mb-2' />
            <p className='text-xs text-gray-500 font-medium'>
              No files generated yet
            </p>
            <p className='text-xs text-gray-600 mt-1'>
              Configure and generate to see files
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTree;
