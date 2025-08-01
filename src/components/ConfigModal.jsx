import React, { useEffect } from 'react';
import { Settings, X, Sparkles, Zap } from 'lucide-react';
import { libraryOptions } from '../constants/library_options';

const ConfigModal = ({
  language,
  setLanguage,
  webFramework,
  setWebFramework,
  orm,
  setOrm,
  dbDriver,
  setDbDriver,
  validation,
  setValidation,
  auth,
  setAuth,
  envVars,
  setEnvVars,
  reqHandling,
  setReqHandling,
  corsLib,
  setCorsLib,
  logging,
  setLogging,
  fileUploads,
  setFileUploads,
  testing,
  setTesting,
  apiDocs,
  setApiDocs,
  rateLimit,
  setRateLimit,
  scheduler,
  setScheduler,
  emailing,
  setEmailing,
  onGenerate,
  isLoading,
  onClose,
}) => {
  useEffect(() => {
    setWebFramework('');
    setOrm('');
    setDbDriver('');
    setValidation('');
    setAuth('');
    setEnvVars('');
    setReqHandling('');
    setCorsLib('');
    setLogging('');
    setFileUploads('');
    setTesting('');
    setApiDocs('');
    setRateLimit('');
    setScheduler('');
    setEmailing('');
  }, [language]);

  const getDynamicValue = (key) => {
    switch (key) {
      case 'webFramework':
        return webFramework;
      case 'orm':
        return orm;
      case 'dbDriver':
        return dbDriver;
      case 'validation':
        return validation;
      case 'auth':
        return auth;
      case 'envVars':
        return envVars;
      case 'reqHandling':
        return reqHandling;
      case 'corsLib':
        return corsLib;
      case 'logging':
        return logging;
      case 'fileUploads':
        return fileUploads;
      case 'testing':
        return testing;
      case 'apiDocs':
        return apiDocs;
      case 'rateLimit':
        return rateLimit;
      case 'scheduler':
        return scheduler;
      case 'emailing':
        return emailing;
      default:
        return '';
    }
  };

  const setDynamicValue = (key, value) => {
    switch (key) {
      case 'webFramework':
        setWebFramework(value);
        break;
      case 'orm':
        setOrm(value);
        break;
      case 'dbDriver':
        setDbDriver(value);
        break;
      case 'validation':
        setValidation(value);
        break;
      case 'auth':
        setAuth(value);
        break;
      case 'envVars':
        setEnvVars(value);
        break;
      case 'reqHandling':
        setReqHandling(value);
        break;
      case 'corsLib':
        setCorsLib(value);
        break;
      case 'logging':
        setLogging(value);
        break;
      case 'fileUploads':
        setFileUploads(value);
        break;
      case 'testing':
        setTesting(value);
        break;
      case 'apiDocs':
        setApiDocs(value);
        break;
      case 'rateLimit':
        setRateLimit(value);
        break;
      case 'scheduler':
        setScheduler(value);
        break;
      case 'emailing':
        setEmailing(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md'>
      <div className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-700'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg'>
              <Settings className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>
                Project Configuration
              </h2>
              <p className='text-sm text-gray-400'>
                Configure your backend architecture and libraries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-700 rounded-lg'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='relative group lg:col-span-3'>
            <label className='block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2'>
              <Sparkles className='w-4 h-4 text-yellow-400' />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='w-full p-3 text-sm bg-gray-900/60 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all'
            >
              <option value=''>Select Programming Language</option>
              {libraryOptions.language.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className='absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded-lg p-3 mt-2 z-10 max-w-xs shadow-lg border border-gray-600'>
              {libraryOptions.language.find((opt) => opt.value === language)
                ?.tooltip ||
                'Choose your preferred programming language for backend development.'}
            </div>
          </div>

          {Object.keys(libraryOptions)
            .filter((key) => key !== 'language')
            .map((key) => (
              <div key={key} className='relative group'>
                <label className='block text-sm font-semibold text-gray-300 mb-2 capitalize flex items-center gap-2'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <select
                  value={getDynamicValue(key)}
                  onChange={(e) => setDynamicValue(key, e.target.value)}
                  className='w-full p-3 text-sm bg-gray-900/60 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={!language || !libraryOptions[key][language]}
                >
                  <option value=''>
                    Select {key.replace(/([A-Z])/g, ' $1')}
                  </option>
                  {language &&
                    libraryOptions[key][language]?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                <div className='absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded-lg p-3 mt-2 z-10 max-w-xs shadow-lg border border-gray-600'>
                  {(language &&
                    libraryOptions[key][language]?.find(
                      (opt) => opt.value === getDynamicValue(key)
                    )?.tooltip) ||
                    `Select a ${key.replace(
                      /([A-Z])/g,
                      ' $1'
                    )} library for your project.`}
                </div>
              </div>
            ))}
        </div>

        <div className='mt-8 flex gap-4'>
          <button
            onClick={() => {
              onGenerate();
              onClose();
            }}
            disabled={isLoading || !webFramework}
            className='flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none'
          >
            {isLoading ? (
              <>
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                Generating Architecture...
              </>
            ) : (
              <>
                <Zap className='w-5 h-5' />
                Generate Backend
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className='px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
