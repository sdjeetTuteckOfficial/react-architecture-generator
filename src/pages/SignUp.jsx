import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import gunevoLogo from '/public/images/gunevo.svg';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!formData.acceptTerms) {
        setError('Please accept the terms and conditions');
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Registration successful!');
      // In a real application, you would handle registration here
      localStorage.setItem('authToken', 'simulated-auth-token');
      localStorage.setItem('user', JSON.stringify({ 
        email: formData.email, 
        firstName: formData.firstName, 
        lastName: formData.lastName 
      }));
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden font-inter
      bg-gray-50 dark:bg-gray-950
      bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2210%22%20height%3D%2210%22%20x%3D%220%22%20y%3D%220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M10%200L0%200L0%2010%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3C%2Fpattern%3E%3Cpattern%20id%3D%22ruler%22%20width%3D%22100%22%20height%3D%22100%22%20x%3D%220%22%20y%3D%220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%22100%22%20y2%3D%220%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2225%22%20x2%3D%22100%22%20y2%3D%2225%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2250%22%20x2%3D%22100%22%20y2%3D%2250%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2275%22%20x2%3D%22100%22%20y2%3D%2275%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%22100%22%20x2%3D%22100%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%2225%22%20y1%3D%220%22%20x2%3D%2225%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%220%22%20x2%3D%2250%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%2275%22%20y1%3D%220%22%20x2%3D%2275%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%22100%22%20y1%3D%220%22%20x2%3D%22100%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2240%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2210%22%20x2%3D%2250%22%20y2%3D%2290%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%20transform%3D%22rotate(45%2050%2050)%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2210%22%20x2%3D%2250%22%20y2%3D%2290%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%20transform%3D%22rotate(135%2050%2050)%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23ruler)%22%2F%3E%3C%2Fsvg%3E')]
      bg-repeat bg-center py-12
    "
    >
      {/* Main Card */}
      <div className='relative z-10'>
        {/* Card with enhanced shadow and animations */}
        <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20 p-6 w-full max-w-md border border-white/50 dark:border-gray-700/50 transition-all duration-300'>
          {/* Animated Header */}
          <div className='text-center mb-6'>
            {/* Main Logo with complex animation */}
            <div className='relative w-16 h-16 mx-auto mb-4'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse shadow-lg'></div>
              <div className='absolute inset-2 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center'>
                <div className='relative'>
                  <User
                    className='h-5 w-5 text-blue-600 animate-bounce'
                    style={{ animationDuration: '2s' }}
                  />
                  {/* Orbiting particles */}
                  <div className='absolute -inset-4'>
                    <div
                      className='absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-ping'
                      style={{ animationDelay: '0s' }}
                    ></div>
                    <div
                      className='absolute top-1/2 right-0 w-1 h-1 bg-purple-400 rounded-full animate-ping'
                      style={{ animationDelay: '0.5s' }}
                    ></div>
                    <div
                      className='absolute bottom-0 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-ping'
                      style={{ animationDelay: '1s' }}
                    ></div>
                    <div
                      className='absolute top-1/2 left-0 w-1 h-1 bg-green-400 rounded-full animate-ping'
                      style={{ animationDelay: '1.5s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className='mb-2 text-center'>
              <div className='mb-4 text-center'>
                <img
                  src={gunevoLogo}
                  alt='Gunevo Logo'
                  className='w-48 mx-auto'
                />
              </div>
            </div>
            <p
              className='text-gray-500 dark:text-gray-400 animate-fade-in text-sm'
              style={{ animationDelay: '0.2s' }}
            >
              Create your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm animate-shake rounded-r-lg dark:bg-red-900/20 dark:border-red-600 dark:text-red-300'>
              <div className='flex items-center'>
                <div className='w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse'></div>
                {error}
              </div>
            </div>
          )}

          {/* Form with staggered animations */}
          <div className='space-y-4'>
            {/* Name Fields Row */}
            <div className='grid grid-cols-2 gap-3 animate-slide-up' style={{ animationDelay: '0.1s' }}>
              <div className='group'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  First Name
                </label>
                <input
                  name='firstName'
                  type='text'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm'
                  placeholder='First name'
                  required
                />
              </div>
              <div className='group'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Last Name
                </label>
                <input
                  name='lastName'
                  type='text'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm'
                  placeholder='Last name'
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div
              className='group animate-slide-up'
              style={{ animationDelay: '0.2s' }}
            >
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Email
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110'>
                  <Mail className='h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:animate-pulse' />
                </div>
                <input
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm'
                  placeholder='Enter your email'
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div
              className='group animate-slide-up'
              style={{ animationDelay: '0.3s' }}
            >
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Password
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110'>
                  <Lock className='h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:animate-pulse' />
                </div>
                <input
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className='w-full pl-11 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm'
                  placeholder='Enter your password'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 focus:outline-none'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 animate-pulse' />
                  ) : (
                    <Eye className='h-5 w-5 hover:animate-bounce' />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div
              className='group animate-slide-up'
              style={{ animationDelay: '0.4s' }}
            >
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Confirm Password
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110'>
                  <Lock className='h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:animate-pulse' />
                </div>
                <input
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className='w-full pl-11 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm'
                  placeholder='Confirm your password'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 focus:outline-none'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5 animate-pulse' />
                  ) : (
                    <Eye className='h-5 w-5 hover:animate-bounce' />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div
              className='flex items-start text-xs animate-slide-up'
              style={{ animationDelay: '0.5s' }}
            >
              <div className='flex items-center h-5'>
                <input
                  name='acceptTerms'
                  type='checkbox'
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className='w-3.5 h-3.5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200
                    dark:bg-gray-600 dark:border-gray-500 dark:checked:bg-blue-600'
                />
              </div>
              <div className='ml-2'>
                <span className='text-gray-600 dark:text-gray-400'>
                  I agree to the{' '}
                  <Link to='/terms' className='text-blue-600 hover:text-blue-800 font-medium transition-colors dark:text-blue-400 dark:hover:text-blue-300'>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to='/privacy' className='text-blue-600 hover:text-blue-800 font-medium transition-colors dark:text-blue-400 dark:hover:text-blue-300'>
                    Privacy Policy
                  </Link>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.acceptTerms}
              className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl animate-slide-up relative overflow-hidden text-sm'
              style={{ animationDelay: '0.6s' }}
            >
              {/* Button shine effect */}
              <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>

              {isLoading ? (
                <div className='flex items-center relative z-10'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  <span className='animate-pulse'>Creating account...</span>
                </div>
              ) : (
                <div className='flex items-center relative z-10'>
                  <span>Create account</span>
                  <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-200' />
                </div>
              )}
            </button>
          </div>

          {/* Footer */}
          <p
            className='mt-5 text-center text-xs text-gray-600 animate-fade-in dark:text-gray-400'
            style={{ animationDelay: '0.7s' }}
          >
            Already have an account?{' '}
            <Link
              to='/login'
              className='text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:scale-105 inline-block relative group dark:text-blue-400 dark:hover:text-blue-300'
            >
              Sign in
              <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300'></span>
            </Link>
          </p>
        </div>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
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
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
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
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        /* Inter font for consistency */
        body {
          font-family: 'Inter', sans-serif;
        }
        /* Ensure no scrollbars */
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden; /* Hide horizontal scrollbar */
          overflow-y: auto; /* Allow vertical scroll if content exceeds viewport */
        }
      `}</style>
    </div>
  );
};

export default SignUp;