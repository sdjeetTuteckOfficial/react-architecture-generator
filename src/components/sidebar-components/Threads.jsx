import React, { useState, useEffect, useRef } from 'react';

export default function Threads({ showCustomMessageBox }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10); // Adjusted for vertical scroll
  const [hasMore, setHasMore] = useState(true); // Track if more threads are available
  const scrollContainerRef = useRef(null);

  const fetchThreads = async (newSkip) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/architecture/threads?skip=${newSkip}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setThreads((prev) => [...prev, ...data]); // Append new threads
      setHasMore(data.length === limit); // If fewer threads than limit, no more to fetch
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to fetch threads. Please try again.');
      showCustomMessageBox(
        'Fetch Error',
        'Failed to load threads. Please check your connection or authentication.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads(skip);
  }, [skip]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || loading || !hasMore) return;

    // Check if scrolled to the bottom end
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10
    ) {
      setSkip((prev) => prev + limit); // Increment skip for next page
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loading, hasMore]);

  return (
    <div className='mb-4'>
      <div className='text-base font-medium text-gray-700 mb-2'>Threads</div>
      {loading && threads.length === 0 ? (
        <div className='flex items-center justify-center py-4'>
          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500'></div>
          <span className='ml-3 text-sm text-gray-600'>Loading threads...</span>
        </div>
      ) : error ? (
        <div className='text-center py-4'>
          <p className='text-red-500 text-sm'>{error}</p>
        </div>
      ) : threads.length === 0 ? (
        <div className='text-center py-4'>
          <div className='text-gray-400 text-2xl mb-2'>📜</div>
          <p className='text-gray-500 text-sm'>No threads found.</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className='border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-inner overflow-y-auto custom-scrollbar h-32' // Vertical scroll, fixed height
        >
          {threads.map((thread) => (
            <div
              key={thread.thread_id}
              className='p-2 mb-2 text-sm text-gray-700 truncate'
            >
              {thread.thread_name}
            </div>
          ))}
          {loading && (
            <div className='flex items-center justify-center py-2'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500'></div>
              <span className='ml-3 text-sm text-gray-600'>
                Loading more...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
