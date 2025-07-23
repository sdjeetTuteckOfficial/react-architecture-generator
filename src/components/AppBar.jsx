import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown } from 'lucide-react';
import { setSelectedAgent } from '../redux/webChatSlice';

const AppBar = () => {
  const dispatch = useDispatch();
  const selectedAgent = useSelector(
    (state) => state.chat?.selectedAgent || 'BRD'
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const dropdownOptions = [
    'BRD',
    'KPI',
    'Architecture Generator',
    'SQL diagram Gen.',
    'SQL query Gen.',
  ];

  const handleAgentChange = (agent) => {
    dispatch(setSelectedAgent(agent));
    setShowDropdown(false);
    console.log(`Agent changed to: ${agent}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between'>
      <h1 className='text-xl font-bold text-blue-600'>ChatBot</h1>

      <div className='relative' ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className='flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors'
        >
          <span>{selectedAgent}</span>
          <ChevronDown className='w-4 h-4 ml-2' />
        </button>

        {showDropdown && (
          <div className='absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
            {dropdownOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAgentChange(option)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  selectedAgent === option
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppBar;
