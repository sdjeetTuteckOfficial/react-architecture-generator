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

export default function Sidebar({
  // Destructure all flow state props
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
  selectedNode,
  setSelectedNode,
  selectedNodes,
  setSelectedNodes,
  selectedEdges,
  setSelectedEdges,
  isModalOpen,
  setIsModalOpen,
  loading,
  setLoading,
  onLoadConversation,
  flowState, // Keep this for backward compatibility if needed
}) {
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

  const handleLoadConversation = (threadId, conversation) => {
    if (onLoadConversation) {
      onLoadConversation(threadId, conversation);
    }

    if (conversation.diagram_json && window.updateDiagramFromChat) {
      window.updateDiagramFromChat(conversation.diagram_json);
    }
  };

  return (
    <div className='w-56 bg-white border-r border-gray-200 font-sans flex flex-col h-screen overflow-hidden'>
      {/* Header with Logo - Fixed height */}
      <div className='flex-shrink-0 px-3 py-2 border-b border-gray-100'>
        <img
          src={gunevoLogo}
          alt='Gunevo Logo'
          className='w-full h-8 object-contain'
        />
      </div>

      {/* Main content area - Scrollable */}
      <div className='flex-1 flex flex-col min-h-0 px-3 py-2 space-y-3'>
        {/* Conversation History - Takes remaining space */}
        <div className='flex-1 min-h-0'>
          <Threads
            showCustomMessageBox={showCustomMessageBox}
            onLoadConversation={handleLoadConversation}
            // Pass all flow state props to Threads
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            selectedEdges={selectedEdges}
            setSelectedEdges={setSelectedEdges}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            loading={loading}
            setLoading={setLoading}
          />
        </div>

        {/* Rest of your component remains the same */}
        <div className='flex-shrink-0'>
          <DiagramTypeDropdown
            isOpen={isDiagramTypeDropdownOpen}
            setIsOpen={setIsDiagramTypeDropdownOpen}
            diagramType={diagramType}
            handleSelectDiagramType={(type) => {
              dispatch(setDiagramType(type));
              setIsDiagramTypeDropdownOpen(false);
            }}
          />
        </div>

        {diagramType === 'architecture' && (
          <div className='flex-shrink-0'>
            <ImagesDropdown
              isOpen={isImagesDropdownOpen}
              setIsOpen={setIsImagesDropdownOpen}
              handleDragStart={handleDragStart}
            />
          </div>
        )}

        {diagramType === 'db_diagram' && (
          <div className='flex-shrink-0'>
            <DatabaseDropdown
              isOpen={isDatabaseDropdownOpen}
              setIsOpen={setIsDatabaseDropdownOpen}
              nodes={nodes}
              edges={edges}
              showCustomMessageBox={showCustomMessageBox}
            />
          </div>
        )}
      </div>

      {/* Footer buttons - Fixed height */}
      <div className='flex-shrink-0 px-3 py-2 border-t border-gray-100'>
        <div className='flex space-x-2'>
          <button
            onClick={() => navigate('/dashboard')}
            className='flex-1 flex items-center justify-center bg-gray-500 text-white py-2 rounded-md shadow-sm hover:bg-gray-600 transition-colors'
            title='Dashboard'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
              />
            </svg>
          </button>
          <button
            onClick={() => handleLogout(navigate)}
            className='flex-1 flex items-center justify-center bg-red-500 text-white py-2 rounded-md shadow-sm hover:bg-red-600 transition-colors'
            title='Logout'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013 3v1'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Message Box Modal */}
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
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}
