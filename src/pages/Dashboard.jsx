import React from 'react';
import { PencilLine, LayoutDashboard } from 'lucide-react'; // Importing icons from Lucide React
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  return (
    // Applied the background styles from the Login component here
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden font-inter
      bg-gray-50 dark:bg-gray-950
      bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2210%22%20height%3D%2210%22%20x%3D%220%22%20y%3D%220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M10%200L0%200L0%2010%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3C%2Fpattern%3E%3Cpattern%20id%3D%22ruler%22%20width%3D%22100%22%20height%3D%22100%22%20x%3D%220%22%20y%3D%220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%22100%22%20y2%3D%220%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2225%22%20x2%3D%22100%22%20y2%3D%2225%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2250%22%20x2%3D%22100%22%20y2%3D%2250%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2275%22%20x2%3D%22100%22%20y2%3D%2275%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%22100%22%20x2%3D%22100%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%2225%22%20y1%3D%220%22%20x2%3D%2225%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%220%22%20x2%3D%2250%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%2275%22%20y1%3D%220%22%20x2%3D%2275%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%22100%22%20y1%3D%220%22%20x2%3D%22100%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2240%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2210%22%20x2%3D%2250%22%20y2%3D%2290%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%20transform%3D%22rotate(45%2050%2050)%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2210%22%20x2%3D%2250%22%20y2%3D%2290%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%20transform%3D%22rotate(135%2050%2050)%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23ruler)%22%2F%3E%3C%2Fsvg%3E')]
      bg-repeat bg-center
    "
    >
      <h1 className='text-4xl font-bold text-gray-800 dark:text-white mb-10 text-center animate-fade-in'>
        Project Documentation Dashboard
      </h1>

      <div className='flex flex-wrap justify-center gap-8 relative z-10'>
        {' '}
        {/* Added z-10 to ensure cards are above background */}
        {/* Card 1: Meeting notes to architecture and BRD */}
        <div
          className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20 p-8 w-full max-w-sm border border-white/50 dark:border-gray-700/50 transition-all duration-300 transform hover:-translate-y-1 animate-slide-up'
          style={{ animationDelay: '0.1s' }}
        >
          {' '}
          {/* Added animations and updated card styles */}
          <div className='flex items-center justify-center mb-4'>
            <PencilLine className='text-blue-500' size={48} />
          </div>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center'>
            Meeting Notes to Architecture & BRD
          </h2>
          <p className='text-gray-600 dark:text-gray-400 text-center'>
            Consolidate and transform meeting discussions into actionable
            architectural designs and Business Requirements Documents.
          </p>
          <div className='mt-6 text-center'>
            <a
              href='#'
              className='inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 group relative overflow-hidden'
            >
              {/* Button shine effect */}
              <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>
              <span className='relative z-10'>Start Documenting</span>
              <svg
                className='ml-2 -mr-1 h-5 w-5 relative z-10'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </a>
          </div>
        </div>
        {/* Card 2: Architecture Flow Make */}
        <div
          className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-green-500/10 dark:shadow-green-500/20 p-8 w-full max-w-sm border border-white/50 dark:border-gray-700/50 transition-all duration-300 transform hover:-translate-y-1 animate-slide-up'
          style={{ animationDelay: '0.2s' }}
        >
          {' '}
          {/* Added animations and updated card styles */}
          <div className='flex items-center justify-center mb-4'>
            <LayoutDashboard className='text-green-500' size={48} />
          </div>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center'>
            Architecture Flow Design
          </h2>
          <p className='text-gray-600 dark:text-gray-400 text-center'>
            Visualize and design the comprehensive architecture flow, from
            high-level overviews to detailed component interactions.
          </p>
          <div className='mt-6 text-center'>
            <a className='inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 group relative overflow-hidden'>
              {/* Button shine effect */}
              <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>
              <span
                className='relative z-10'
                onClick={() => navigate('/flow-page')}
              >
                Start Designing
              </span>
              <svg
                className='ml-2 -mr-1 h-5 w-5 relative z-10'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Custom CSS animations and font import */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
        /* Ensure Inter font is applied */
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}

export default HomePage;
