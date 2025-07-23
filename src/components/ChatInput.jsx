import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSubmit }) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='w-full bg-white border-t border-gray-200'>
      <div className='p-3'>
        <div
          className={`
          relative bg-white rounded-lg border transition-all duration-200
          ${isFocused ? 'border-blue-400' : 'border-gray-300'}
        `}
        >
          <textarea
            className='w-full p-3 pr-12 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-400 text-sm'
            placeholder='Describe your system architecture...'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={2}
            style={{ minHeight: '80px', maxHeight: '120px' }}
          />

          {/* Send Button */}
          <button
            className={`
              absolute bottom-2 right-2 w-8 h-8 rounded-md flex items-center justify-center
              transition-all duration-300 transform-gpu
              ${
                prompt.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 hover:rotate-12 active:scale-90 active:rotate-0 hover:shadow-lg hover:shadow-blue-300/50'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-300'
              }
            `}
            onClick={handleSend}
            disabled={!prompt.trim()}
            aria-label='Send message'
            style={{
              animation: prompt.trim() ? 'pulse 2s infinite' : 'none',
            }}
          >
            <Send
              size={16}
              className={`transition-transform duration-300 ${
                prompt.trim()
                  ? 'hover:translate-x-0.5 hover:-translate-y-0.5'
                  : ''
              }`}
            />
          </button>

          <style jsx>{`
            @keyframes pulse {
              0%,
              100% {
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
              }
              50% {
                box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
