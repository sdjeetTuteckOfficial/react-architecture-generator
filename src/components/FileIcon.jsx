import React from 'react';
import { File } from 'lucide-react';

const FileIcon = ({ fileName, iconSize = 'w-4 h-4 flex-shrink-0' }) => {
  const ext = fileName.split('.').pop().toLowerCase();

  switch (ext) {
    case 'js':
    case 'jsx':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
        >
          JS
        </div>
      );
    case 'py':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-blue-500 to-blue-700 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
        >
          PY
        </div>
      );
    case 'json':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-orange-400 to-orange-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
        >
          {'{}'}
        </div>
      );
    case 'sql':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-purple-500 to-purple-700 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
        >
          SQL
        </div>
      );
    case 'md':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-gray-400 to-gray-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-black shadow-sm`}
        >
          MD
        </div>
      );
    case 'env':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-green-500 to-green-700 rounded-sm flex items-center justify-center text-[7px] font-bold text-white shadow-sm`}
        >
          ENV
        </div>
      );
    case 'html':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-red-500 to-red-700 rounded-sm flex items-center justify-center text-[7px] font-bold text-white shadow-sm`}
        >
          HTML
        </div>
      );
    case 'css':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
        >
          CSS
        </div>
      );
    case 'ts':
    case 'tsx':
      return (
        <div
          className={`${iconSize} bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm`}
        >
          TS
        </div>
      );
    default:
      return <File className={`${iconSize} text-gray-400`} />;
  }
};

export default FileIcon;
