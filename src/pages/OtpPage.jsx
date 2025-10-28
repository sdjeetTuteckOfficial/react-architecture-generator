import React, { useState, useEffect, useRef } from 'react';
import { Shield, ArrowRight, RefreshCw, Mail, Clock } from 'lucide-react';
import axiosInstance from '../security/axios-instance';
import { useNavigate } from 'react-router-dom';

const OtpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isValidOtp, setIsValidOtp] = useState(false);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Check if OTP is valid whenever values change
  useEffect(() => {
    const otpString = otpValues.join('');
    setIsValidOtp(otpString.length === 6 && /^\d{6}$/.test(otpString));
    if (errorMessage && otpString.length > 0) {
      setErrorMessage(''); // Clear error when user starts typing
    }
  }, [otpValues, errorMessage]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle individual OTP input changes
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace in OTP inputs
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste in OTP inputs
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 6) {
      const newOtpValues = digits.split('');
      setOtpValues(newOtpValues);
      otpRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otpValues.join('');
    console.log('otp', otpString);

    if (!isValidOtp) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Simulate API call
      const user = JSON.parse(localStorage.getItem('unregistered-user'));
      const response = await axiosInstance.post('/auth/verify-otp', {
        email: user.email,
        otp: otpString,
      });

      console.log('res', response);

      console.log('OTP verification successful!');
      setSuccessMessage('OTP verified successfully! Redirecting to login...');
      navigate('/login');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setErrorMessage('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    const requestData = {
      email: 'user@example.com', // You should get this from props, context, or localStorage
    };

    try {
      // For demo purposes in Claude artifacts, we'll simulate the axios call
      // In your real app, uncomment the axios code below:

      /*
      const response = await axios.post(
        'http://127.0.0.1:8000/auth/resend-otp',
        requestData
      );
      console.log('OTP resent successfully!', response.data);
      */

      // Simulate API call for demo
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log('Sending request to /auth/resend-otp with:', requestData);
          resolve({
            data: { success: true, message: 'OTP sent successfully' },
          });
        }, 1500);
      });

      setSuccessMessage('New OTP sent to your email!');
      setTimeLeft(300); // Reset timer to 5 minutes
      setCanResend(false);

      // Clear OTP inputs
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Failed to resend OTP. Please try again.'
      );
    } finally {
      setIsResending(false);
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
              <div className='absolute inset-0 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl animate-pulse shadow-lg'></div>
              <div className='absolute inset-2 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center'>
                <div className='relative'>
                  <Shield
                    className='h-5 w-5 text-green-600 animate-bounce'
                    style={{ animationDuration: '2s' }}
                  />
                  {/* Orbiting particles */}
                  <div className='absolute -inset-4'>
                    <div
                      className='absolute top-0 left-1/2 w-1 h-1 bg-green-400 rounded-full animate-ping'
                      style={{ animationDelay: '0s' }}
                    ></div>
                    <div
                      className='absolute top-1/2 right-0 w-1 h-1 bg-blue-400 rounded-full animate-ping'
                      style={{ animationDelay: '0.5s' }}
                    ></div>
                    <div
                      className='absolute bottom-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping'
                      style={{ animationDelay: '1s' }}
                    ></div>
                    <div
                      className='absolute top-1/2 left-0 w-1 h-1 bg-pink-400 rounded-full animate-ping'
                      style={{ animationDelay: '1.5s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <h2
              className='text-xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in'
              style={{ animationDelay: '0.1s' }}
            >
              Verify Your Email
            </h2>
            <p
              className='text-gray-500 dark:text-gray-400 animate-fade-in text-sm'
              style={{ animationDelay: '0.2s' }}
            >
              We've sent a 6-digit code to your email address
            </p>
            <div className='flex items-center justify-center mt-2 text-xs text-gray-600 dark:text-gray-400'>
              <Mail className='h-3 w-3 mr-1' />
              <span>user@example.com</span>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className='mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 text-sm animate-fade-in rounded-r-lg dark:bg-green-900/20 dark:border-green-600 dark:text-green-300'>
              <div className='flex items-center'>
                <div className='w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse'></div>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className='mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm animate-shake rounded-r-lg dark:bg-red-900/20 dark:border-red-600 dark:text-red-300'>
              <div className='flex items-center'>
                <div className='w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse'></div>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div
            className='text-center mb-4 animate-fade-in'
            style={{ animationDelay: '0.3s' }}
          >
            <div className='flex items-center justify-center text-sm'>
              <Clock className='h-4 w-4 mr-2 text-gray-500' />
              <span className='text-gray-600 dark:text-gray-400'>
                Time remaining:
                <span
                  className={`ml-1 font-mono font-semibold ${
                    timeLeft <= 60 ? 'text-red-500' : 'text-blue-600'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </span>
            </div>
          </div>

          {/* OTP Input Section */}
          <div className='space-y-6'>
            {/* OTP Input Fields */}
            <div
              className='animate-slide-up'
              style={{ animationDelay: '0.4s' }}
            >
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center'>
                Enter 6-digit verification code
              </label>
              <div className='flex justify-center space-x-2'>
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type='text'
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className='w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600'
                    style={{
                      animationDelay: `${0.5 + index * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <p className='text-xs text-center text-gray-500 mt-2'>
                Try entering{' '}
                <code className='bg-gray-100 px-1 py-0.5 rounded'>123456</code>{' '}
                for demo
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isValidOtp}
              className='w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl animate-slide-up relative overflow-hidden text-sm'
              style={{ animationDelay: '0.8s' }}
            >
              {/* Button shine effect */}
              <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12'></div>

              {isLoading ? (
                <div className='flex items-center relative z-10'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  <span className='animate-pulse'>Verifying...</span>
                </div>
              ) : (
                <div className='flex items-center relative z-10'>
                  <span>Verify Code</span>
                  <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-200' />
                </div>
              )}
            </button>
          </div>

          {/* Resend OTP Section */}
          <div
            className='mt-6 text-center animate-fade-in'
            style={{ animationDelay: '0.9s' }}
          >
            {canResend ? (
              <button
                onClick={handleResendOtp}
                disabled={isResending}
                className='text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:scale-105 inline-flex items-center relative group dark:text-blue-400 dark:hover:text-blue-300 text-sm'
              >
                {isResending ? (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300' />
                    Resend Code
                  </>
                )}
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300'></span>
              </button>
            ) : (
              <p className='text-gray-500 dark:text-gray-400 text-sm'>
                Resend code in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          {/* Footer */}
          <p
            className='mt-5 text-center text-xs text-gray-600 animate-fade-in dark:text-gray-400'
            style={{ animationDelay: '1s' }}
          >
            Didn't receive the code?{' '}
            <button
              className='text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:scale-105 inline-block relative group dark:text-blue-400 dark:hover:text-blue-300'
              onClick={() => alert('Going back to signup...')}
            >
              Go back to signup
              <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300'></span>
            </button>
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
          overflow-x: hidden;
          overflow-y: auto;
        }
        /* OTP input animation on focus */
        input:focus {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default OtpPage;
