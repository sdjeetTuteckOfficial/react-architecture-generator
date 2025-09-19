import React from 'react';

export default function CustomMessageBox({ message, title, type, onClose }) {
  let bgColor, borderColor, textColor;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      borderColor = 'border-green-400';
      textColor = 'text-green-700';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      borderColor = 'border-red-400';
      textColor = 'text-red-700';
      break;
    case 'warning':
      bgColor = 'bg-yellow-100';
      borderColor = 'border-yellow-400';
      textColor = 'text-yellow-700';
      break;
    default:
      bgColor = 'bg-blue-100';
      borderColor = 'border-blue-400';
      textColor = 'text-blue-700';
  }

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'>
      <div
        className={`rounded-lg shadow-xl p-6 max-w-sm w-full ${bgColor} border ${borderColor}`}
      >
        <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>{title}</h3>
        <p className={`text-sm mb-4 ${textColor}`}>{message}</p>
        <button
          onClick={onClose}
          className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors'
        >
          OK
        </button>
      </div>
    </div>
  );
}
