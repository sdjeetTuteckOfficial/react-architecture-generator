import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  Key,
  Check,
  Eye,
  EyeOff,
  Shield,
  User,
} from 'lucide-react';
import gunevoLogo from '/public/images/gunevo.svg';
import axiosInstance from '../security/axios-instance';

const PasswordResetStepper = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const steps = [
    { id: 1, title: 'Password', description: 'Enter new password', icon: Key },
    { id: 2, title: 'Email', description: 'Enter your email', icon: Mail },
    {
      id: 3,
      title: 'Verify OTP',
      description: 'Enter verification code',
      icon: Shield,
    },
    { id: 4, title: 'Complete', description: 'Password reset', icon: Check },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => password.length >= 8;

  // Step 1: Password
  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!formData.newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (!validatePassword(formData.newPassword)) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setCurrentStep(2);
  };
  // const handleStep1Submit = (e) => {
  //   e.preventDefault();
  //   if (!formData.newPassword) {
  //     setError('Please enter a new password.');
  //     return;
  //   }
  //   if (!validatePassword(formData.newPassword)) {
  //     setError('Password must be at least 8 characters long.');
  //     return;
  //   }
  //   if (formData.newPassword !== formData.confirmPassword) {
  //     setError('Passwords do not match.');
  //     return;
  //   }
  //   setCurrentStep(2);
  // };

  // Step 2: Email
  // const handleStep2Submit = async (e) => {
  //   e.preventDefault();
  //   if (!formData.email) {
  //     setError('Please enter your email address.');
  //     return;
  //   }
  //   if (!validateEmail(formData.email)) {
  //     setError('Please enter a valid email address.');
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     const response = await fetch(
  //       'http://localhost:8000/auth/forgot-password',
  //       {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ email: formData.email }),
  //       }
  //     );

  //     if (!response.ok) throw new Error('Network error');

  //     const data = await response.json();

  //     if (data.message) {
  //       setSuccessMessage(
  //         data.otp ? `${data.message}. OTP: ${data.otp}` : data.message
  //       );
  //       setTimeout(() => {
  //         setCurrentStep(3);
  //         setSuccessMessage('');
  //       }, 2000);
  //     } else {
  //       setError('Unexpected response from server.');
  //     }
  //   } catch (err) {
  //     setError('Failed to send reset request. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // NOTE: axiosInstance already handles the base URL and 'Content-Type': 'application/json' is default for POST
      const response = await axiosInstance.post('/auth/forgot-password', {
        email: formData.email,
      });

      const data = response.data;

      if (data.message) {
        // Caution: Displaying the OTP is a security risk, only do this in a controlled dev environment.
        setSuccessMessage(
          data.otp ? `${data.message}. OTP: ${data.otp}` : data.message
        );
        setTimeout(() => {
          setCurrentStep(3);
          setSuccessMessage('');
        }, 2000);
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      // Axios error handling: Use err.response.data for server messages
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to send reset request. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: OTP Verification
  // const handleStep3Submit = async (e) => {
  //   e.preventDefault();
  //   if (!formData.otp) {
  //     setError('Please enter the OTP.');
  //     return;
  //   }
  //   if (formData.otp.length !== 6) {
  //     setError('OTP must be 6 digits.');
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     const response = await fetch(
  //       'http://localhost:8000/auth/reset-password',
  //       {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           email: formData.email,
  //           otp: formData.otp,
  //           new_password: formData.newPassword,
  //         }),
  //       }
  //     );

  //     if (!response.ok) throw new Error('Failed to reset password');

  //     const data = await response.json();

  //     if (data.message) {
  //       setSuccessMessage('Password reset successfully!');
  //       setTimeout(() => setCurrentStep(4), 1500);
  //     } else {
  //       setError('Failed to reset password. Please try again.');
  //     }
  //   } catch (err) {
  //     setError('Failed to reset password. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError('Please enter the OTP.');
      return;
    }
    // Using simple digit check for better user experience
    if (!/^\d{6}$/.test(formData.otp)) {
      setError('OTP must be 6 digits.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // NOTE: axiosInstance already handles the base URL
      const response = await axiosInstance.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        new_password: formData.newPassword,
      });

      const data = response.data;

      if (data.message) {
        setSuccessMessage('Password reset successfully!');
        setTimeout(() => setCurrentStep(4), 1500);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      // Axios error handling: Use err.response.data for server messages
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step forms
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-4'>
            {/* New Password Field */}
            <div
              className='group animate-slide-up'
              style={{ animationDelay: '0.1s' }}
            >
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                New Password
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110'>
                  <Key className='h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:animate-pulse' />
                </div>
                <input
                  name='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className='w-full pl-11 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm'
                  placeholder='Enter new password'
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
              style={{ animationDelay: '0.2s' }}
            >
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Confirm Password
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110'>
                  <Key className='h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:animate-pulse' />
                </div>
                <input
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className='w-full pl-11 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm'
                  placeholder='Confirm new password'
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

            <button
              onClick={handleStep1Submit}
              className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl animate-slide-up relative overflow-hidden text-sm'
              style={{ animationDelay: '0.3s' }}
            >
              <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>
              <div className='flex items-center relative z-10'>
                <span>Next</span>
                <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-200' />
              </div>
            </button>
          </div>
        );

      case 2:
        return (
          <div className='space-y-4'>
            <div
              className='group animate-slide-up'
              style={{ animationDelay: '0.1s' }}
            >
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Email Address
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

            <button
              onClick={handleStep2Submit}
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl animate-slide-up relative overflow-hidden text-sm'
              style={{ animationDelay: '0.2s' }}
            >
              <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>
              {isLoading ? (
                <div className='flex items-center relative z-10'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  <span className='animate-pulse'>Sending...</span>
                </div>
              ) : (
                <div className='flex items-center relative z-10'>
                  <span>Send OTP</span>
                  <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-200' />
                </div>
              )}
            </button>
          </div>
        );

      case 3:
        return (
          <div className='space-y-4'>
            <div
              className='group animate-slide-up'
              style={{ animationDelay: '0.1s' }}
            >
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Verification Code
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110'>
                  <Shield className='h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:animate-pulse' />
                </div>
                <input
                  name='otp'
                  type='text'
                  value={formData.otp}
                  onChange={handleInputChange}
                  className='w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md text-center
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 text-sm'
                  placeholder='Enter 6-digit OTP'
                  maxLength='6'
                  required
                />
              </div>
            </div>

            <button
              onClick={handleStep3Submit}
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl animate-slide-up relative overflow-hidden text-sm'
              style={{ animationDelay: '0.2s' }}
            >
              <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>
              {isLoading ? (
                <div className='flex items-center relative z-10'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  <span className='animate-pulse'>Verifying...</span>
                </div>
              ) : (
                <div className='flex items-center relative z-10'>
                  <span>Verify & Reset Password</span>
                  <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-200' />
                </div>
              )}
            </button>
          </div>
        );

      case 4:
        return (
          <div className='text-center space-y-4 animate-fade-in'>
            <div className='relative w-20 h-20 mx-auto mb-6'>
              <div className='absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full animate-pulse shadow-lg'></div>
              <div className='absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center'>
                <Check className='h-8 w-8 text-green-600 animate-bounce' />
              </div>
            </div>
            <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
              Password Reset Complete!
            </h3>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              Your password has been successfully reset.
            </p>
            <a
              href='/login'
              className='inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 group shadow-lg hover:shadow-xl relative overflow-hidden text-sm mt-4'
            >
              <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>
              <div className='flex items-center relative z-10'>
                <span>Go to Login</span>
                <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-200' />
              </div>
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden font-inter
      bg-gray-50 dark:bg-gray-950
      bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2210%22%20height%3D%2210%22%20x%3D%220%22%20y%3D%220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M10%200L0%200L0%2010%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3C%2Fpattern%3E%3Cpattern%20id%3D%22ruler%22%20width%3D%22100%22%20height%3D%22100%22%20x%3D%220%22%20y%3D%220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%22100%22%20y2%3D%220%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2225%22%20x2%3D%22100%22%20y2%3D%2225%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2250%22%20x2%3D%22100%22%20y2%3D%2250%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%2275%22%20x2%3D%22100%22%20y2%3D%2275%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%22100%22%20x2%3D%22100%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%2225%22%20y1%3D%220%22%20x2%3D%2225%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%220%22%20x2%3D%2250%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Cline%20x1%3D%2275%22%20y1%3D%220%22%20x2%3D%2275%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%22100%22%20y1%3D%220%22%20x2%3D%22100%22%20y2%3D%22100%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.2%22%20opacity%3D%220.15%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2240%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2210%22%20x2%3D%2250%22%20y2%3D%2290%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%20transform%3D%22rotate(45%2050%2050)%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2210%22%20x2%3D%2250%22%20y2%3D%2290%22%20stroke%3D%22%23000000%22%20stroke-width%3D%220.1%22%20opacity%3D%220.1%22%20transform%3D%22rotate(135%2050%2050)%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23ruler)%22%2F%3E%3C%2Fsvg%3E')]
      bg-repeat bg-center
    "
    >
      {/* Main Card */}
      <div className='relative z-10'>
        <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20 p-6 w-full max-w-lg border border-white/50 dark:border-gray-700/50 transition-all duration-300'>
          {/* Animated Header */}
          <div className='text-center mb-6'>
            {/* Main Logo with complex animation */}
            <div className='relative w-16 h-16 mx-auto mb-4'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse shadow-lg'></div>
              <div className='absolute inset-2 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center'>
                <div className='relative'>
                  <Shield
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

            <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-1'>
              Reset Password
            </h2>
            <p
              className='text-gray-500 dark:text-gray-400 animate-fade-in text-sm'
              style={{ animationDelay: '0.2s' }}
            >
              {currentStep === 1 && 'Enter your new password'}
              {currentStep === 2 && 'Enter your email to receive OTP'}
              {currentStep === 3 && 'Enter the verification code'}
              {currentStep === 4 && 'Your password has been reset'}
            </p>
          </div>

          {/* Progress Stepper */}
          <div
            className='mb-6 px-2 animate-slide-up'
            style={{ animationDelay: '0.1s' }}
          >
            <div className='flex items-center justify-between relative mx-4'>
              {/* Background connector line */}
              <div className='absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-600'></div>

              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className='flex flex-col items-center relative z-10 flex-1'
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-500 mx-auto ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg scale-110'
                        : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600'
                    }`}
                  >
                    <step.icon className='h-3 w-3' />
                  </div>
                  <p
                    className={`text-xs mt-2 text-center transition-colors duration-300 ${
                      currentStep >= step.id
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.id === 1
                      ? 'New'
                      : step.id === 2
                      ? 'Email'
                      : step.id === 3
                      ? 'Verify'
                      : 'Done'}
                  </p>
                </div>
              ))}

              {/* Progress indicator line */}
              <div
                className='absolute top-4 left-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500'
                style={{
                  width: `calc(${
                    ((currentStep - 1) / (steps.length - 1)) * 100
                  }% - 2rem + ${
                    ((currentStep - 1) / (steps.length - 1)) * 2
                  }rem)`,
                }}
              ></div>
            </div>
          </div>

          {/* Error & Success messages */}
          {error && (
            <div className='mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm animate-shake rounded-r-lg dark:bg-red-900/20 dark:border-red-600 dark:text-red-300'>
              <div className='flex items-center'>
                <div className='w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse'></div>
                {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className='mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 text-sm rounded-r-lg dark:bg-green-900/20 dark:border-green-600 dark:text-green-300 animate-fade-in'>
              <div className='flex items-center'>
                <div className='w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse'></div>
                {successMessage}
              </div>
            </div>
          )}

          {/* Step Content */}
          {renderStepContent()}

          {/* Back to Login Link */}
          {currentStep !== 4 && (
            <p
              className='mt-5 text-center text-xs text-gray-600 animate-fade-in dark:text-gray-400'
              style={{ animationDelay: '0.5s' }}
            >
              Remember your password?{' '}
              <a
                href='/login'
                className='text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:scale-105 inline-block relative group dark:text-blue-400 dark:hover:text-blue-300'
              >
                Back to Login
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300'></span>
              </a>
            </p>
          )}
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

export default PasswordResetStepper;
