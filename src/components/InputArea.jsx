// // components/InputArea.jsx
// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { Send, Zap } from 'lucide-react';
// import { addMessage } from '../redux/ChatSlice';

// const InputArea = () => {
//   const dispatch = useDispatch();
//   const [message, setMessage] = useState('');

//   const handleSendMessage = () => {
//     if (message.trim()) {
//       // Add user message
//       dispatch(addMessage({
//         text: message,
//         isBot: false
//       }));

//       setMessage('');

//       // Simulate bot response
//       setTimeout(() => {
//         dispatch(addMessage({
//           text: "I'd be happy to help you with that. Could you provide more details about what you're looking for?",
//           isBot: true
//         }));
//       }, 1000);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="border-t border-gray-200 bg-white p-4">
//       <div className="max-w-3xl mx-auto">
//         <div className="flex items-center gap-2 mb-3">
//         </div>

//         <div className="relative">
//           <textarea
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Ask AI..."
//             className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             rows="2"
//           />
//           <button
//             onClick={handleSendMessage}
//             className="absolute right-3 top-3 p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//             disabled={!message.trim()}
//           >
//             <Send className="w-5 h-5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InputArea;

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addMessage } from '../redux/chatSlice';
import useWebSocket from '../hooks/useWebSocket';

const InputArea = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { sendMessage } = useWebSocket('ws://localhost:3001'); // ✅ Your WebSocket server

  const handleSendMessage = () => {
    if (message.trim()) {
      // Show user message
      dispatch(
        addMessage({
          text: message,
          isBot: false,
        })
      );

      // Send to backend
      sendMessage({ text: message });

      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='w-full bg-white border-t border-gray-200'>
      <div className='p-3 max-w-3xl mx-auto'>
        <div
          className={`relative bg-white rounded-lg border transition-all duration-200 ${
            isFocused ? 'border-blue-400' : 'border-gray-300'
          }`}
        >
          <textarea
            className='w-full p-3 pr-12 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-400 text-sm'
            placeholder='Ask AI...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={2}
            style={{ minHeight: '80px', maxHeight: '120px' }}
          />

          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            aria-label='Send message'
            className={`
              absolute bottom-2 right-2 w-8 h-8 rounded-md flex items-center justify-center
              transition-all duration-300 transform-gpu
              ${
                message.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 hover:rotate-12 active:scale-90 active:rotate-0 hover:shadow-lg hover:shadow-blue-300/50'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-300'
              }
            `}
            style={{
              animation: message.trim() ? 'pulse 2s infinite' : 'none',
            }}
          >
            <Send size={16} />
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
};

export default InputArea;
