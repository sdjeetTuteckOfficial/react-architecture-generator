import { Code2, Database, LayoutDashboard, Zap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const navigateToChatbot = () => {
    console.log('Navigate to /chatbot');
    navigate('/code-editor');
    // In your actual app: navigate('/chatbot')
  };

  const navigateToFlow = () => {
    console.log('Navigate to /flow-page');
    navigate('/flow-page');
  };

  const handleLogout = () => {
    console.log('User logged out!');
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden font-inter
      bg-gray-50 dark:bg-gray-950
      bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2210%22%20height%3D%2210%22%20x%3D%220%22%20y%3D%220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M10%200L0%200L0%2010%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3C%2Fpattern%3E%3Cpattern%20id%3D%22ruler%22%20width%3D%22100%22%20height%3D%22100%22%20x%3D%220%22%20y%3D%220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%22100%22%20y2%3D%220%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2225%22%20x2%3D%22100%22%20y2%3D%2225%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2250%22%20x2%3D%22100%22%20y2%3D%2250%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2275%22%20x2%3D%22100%22%20y2%3D%2275%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%22100%22%20x2%3D%22100%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%2225%22%20y1%3D%220%22%20x2%3D%2225%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%220%22%20x2%3D%2250%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%2275%22%20y1%3D%220%22%20x2%3D%2275%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%22100%22%20y1%3D%220%22%20x2%3D%22100%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2240%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2210%22%20x2%3D%2250%22%20y2%3D%2290%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%20transform%3D%22rotate(45%2050%2050)%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2210%22%20x2%3D%2250%22%20y2%3D%2290%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%20transform%3D%22rotate(135%2050%2050)%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23ruler)%22%2F%3E%3C%2Fsvg%3E')]
      bg-repeat bg-center"
    >
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 pointer-events-none'></div>

      {/* Logout Button */}
      <button
        onClick={() => handleLogout()}
        className='absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300 group'
      >
        <LogOut className='w-4 h-4 group-hover:rotate-12 transition-transform duration-300' />
        <span className='text-sm font-medium'>Logout</span>
      </button>

      <div className='relative z-10 max-w-4xl mx-auto w-full'>
        {/* Header */}
        <div className='text-center mb-8 animate-fade-in'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2'>
            🧑‍💻 Welcome, Gunevian! 🚀
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Dream. Design. Build something amazing.
          </p>
        </div>

        {/* Cards Grid */}
        <div className='grid md:grid-cols-2 gap-6'>
          {/* Code Studio Card */}
          <div
            className='group relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-blue-500/20 hover:-translate-y-1 animate-slide-up'
            style={{ animationDelay: '0.1s' }}
          >
            <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

            <div className='relative'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg'>
                    <Code2 className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                    Code Studio
                  </h2>
                </div>
                <span className='flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full'>
                  <Zap className='w-3 h-3' />
                  AI
                </span>
              </div>

              <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>
                Generate backend APIs from your SQL schema
              </p>

              {/* Code Preview */}
              <div className='relative bg-gray-900 rounded-lg p-3 mb-4 overflow-hidden border border-gray-800'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='flex gap-1'>
                    <div className='w-2 h-2 rounded-full bg-red-500'></div>
                    <div className='w-2 h-2 rounded-full bg-yellow-500'></div>
                    <div className='w-2 h-2 rounded-full bg-green-500'></div>
                  </div>
                  <span className='text-xs text-gray-500'>api.js</span>
                </div>
                <pre className='text-xs font-mono text-gray-300'>
                  <code>{`router.post('/users', async (req) => {
  return User.create(req.body);
});`}</code>
                </pre>
              </div>

              {/* Features */}
              <div className='flex gap-2 mb-4'>
                <div className='flex-1 flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg'>
                  <Database className='w-4 h-4 text-blue-600 dark:text-blue-400 mr-1' />
                  <span className='text-xs text-gray-600 dark:text-gray-400'>
                    SQL
                  </span>
                </div>
                <div className='flex-1 flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg'>
                  <Code2 className='w-4 h-4 text-purple-600 dark:text-purple-400 mr-1' />
                  <span className='text-xs text-gray-600 dark:text-gray-400'>
                    APIs
                  </span>
                </div>
              </div>

              <button
                onClick={navigateToChatbot}
                className='w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-300 group/btn relative overflow-hidden'
              >
                <Code2 className='w-4 h-4 relative z-10' />
                <span className='relative z-10'>Start Coding</span>
                <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>
              </button>
            </div>
          </div>

          {/* Architecture Flow Card */}
          <div
            className='group relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-emerald-500/20 hover:-translate-y-1 animate-slide-up'
            style={{ animationDelay: '0.2s' }}
          >
            <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

            <div className='relative'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg'>
                    <LayoutDashboard className='w-5 h-5 text-emerald-600 dark:text-emerald-400' />
                  </div>
                  <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                    Flow Designer
                  </h2>
                </div>
                <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-full'>
                  Visual
                </span>
              </div>

              <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>
                Design system architecture visually with drag-and-drop
                components
              </p>

              {/* Flow Preview */}
              <div className='relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-4 mb-4 border-2 border-dashed border-emerald-300 dark:border-emerald-700/50'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg'>
                    DB
                  </div>
                  <div className='flex-1 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 relative'>
                    <div className='absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-teal-400 rounded-full'></div>
                  </div>
                  <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg'>
                    API
                  </div>
                  <div className='flex-1 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 relative'>
                    <div className='absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-teal-400 rounded-full'></div>
                  </div>
                  <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg'>
                    UI
                  </div>
                </div>
                <p className='text-center text-xs text-emerald-700 dark:text-emerald-300 mt-2 font-medium'>
                  Interactive Canvas
                </p>
              </div>

              {/* Features */}
              <div className='space-y-1.5 mb-4'>
                <div className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400'>
                  <div className='w-1 h-1 rounded-full bg-emerald-500'></div>
                  <span>Drag & drop components</span>
                </div>
                <div className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400'>
                  <div className='w-1 h-1 rounded-full bg-emerald-500'></div>
                  <span>Export diagrams</span>
                </div>
              </div>

              <button
                onClick={navigateToFlow}
                className='w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-300 group/btn relative overflow-hidden'
              >
                <LayoutDashboard className='w-4 h-4 relative z-10' />
                <span className='relative z-10'>Design Architecture</span>
                <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(15px);
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
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}

export default HomePage;
