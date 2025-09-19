import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setDiagramType } from '../redux/diagramSlice';
import {
  ImagesDropdown,
  DiagramTypeDropdown,
  DatabaseDropdown,
} from './sidebar-components/Dropdowns';
import CustomMessageBox from './sidebar-components/CustomMessageBox';
import Threads from './sidebar-components/Threads';
import { handleDragStart, handleLogout } from './sidebar-components/utils';
import gunevoLogo from '/public/images/gunevo.svg';

export default function Sidebar({ nodes, edges }) {
  const [isImagesDropdownOpen, setIsImagesDropdownOpen] = useState(false);
  const [isDiagramTypeDropdownOpen, setIsDiagramTypeDropdownOpen] =
    useState(false);
  const [isDatabaseDropdownOpen, setIsDatabaseDropdownOpen] = useState(false);
  const [messageBox, setMessageBox] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const diagramType = useSelector((state) => state.diagram.diagramType);

  const showCustomMessageBox = (title, message, type) => {
    setMessageBox({ title, message, type });
  };

  const closeCustomMessageBox = () => {
    setMessageBox(null);
  };

  return (
    <div className='w-64 bg-white border-r p-4 font-sans flex flex-col h-full'>
      <div className='mb-4 text-center'>
        <img src={gunevoLogo} alt='Gunevo Logo' className='w-48 mx-auto' />
      </div>
      <Threads showCustomMessageBox={showCustomMessageBox} />
      <DiagramTypeDropdown
        isOpen={isDiagramTypeDropdownOpen}
        setIsOpen={setIsDiagramTypeDropdownOpen}
        diagramType={diagramType}
        handleSelectDiagramType={(type) => {
          dispatch(setDiagramType(type));
          setIsDiagramTypeDropdownOpen(false);
        }}
      />

      {diagramType === 'architecture' && (
        <ImagesDropdown
          isOpen={isImagesDropdownOpen}
          setIsOpen={setIsImagesDropdownOpen}
          handleDragStart={handleDragStart}
        />
      )}

      {diagramType === 'db_diagram' && (
        <DatabaseDropdown
          isOpen={isDatabaseDropdownOpen}
          setIsOpen={setIsDatabaseDropdownOpen}
          nodes={nodes}
          edges={edges}
          showCustomMessageBox={showCustomMessageBox}
        />
      )}

      <div className='mt-auto pt-4 border-t border-gray-200'>
        <button
          onClick={() => handleLogout(navigate)}
          className='w-full flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors'
        >
          <svg
            className='w-5 h-5 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1'
            ></path>
          </svg>
          Logout
        </button>
      </div>

      {messageBox && (
        <CustomMessageBox
          title={messageBox.title}
          message={messageBox.message}
          type={messageBox.type}
          onClose={closeCustomMessageBox}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
