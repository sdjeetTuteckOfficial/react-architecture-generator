import { useState } from 'react';

export default function ChatInput({ onSubmit }) {
  const [prompt, setPrompt] = useState('');

  const handleSend = () => {
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  return (
    <div className='absolute bottom-0 left-64 right-0 p-4 bg-white shadow-md flex items-center'>
      <input
        type='text'
        className='flex-1 p-2 border rounded mr-2'
        placeholder='Describe your system architecture...'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button
        className='bg-green-600 text-white px-4 py-2 rounded'
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}
