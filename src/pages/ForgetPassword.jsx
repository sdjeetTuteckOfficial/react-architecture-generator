import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  Key,
  Check,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import gunevoLogo from '/public/images/gunevo.svg';

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

  // Step 2: Email
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
      const response = await fetch(
        'http://localhost:8000/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();

      if (data.message) {
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
      setError('Failed to send reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: OTP Verification
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError('Please enter the OTP.');
      return;
    }
    if (formData.otp.length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:8000/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
            new_password: formData.newPassword,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to reset password');

      const data = await response.json();

      if (data.message) {
        setSuccessMessage('Password reset successfully!');
        setTimeout(() => setCurrentStep(4), 1500);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step forms
  const renderStepContent = () => {
    const animateClass = 'animate-slide-up transition-all duration-500';
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleStep1Submit} className='space-y-4'>
            {/* New Password */}
            <div className={animateClass}>
              <label className='block text-sm font-medium mb-1'>
                New Password
              </label>
              <div className='relative'>
                <Key className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  name='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder='Enter new password'
                  className='w-full pl-11 pr-12 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 transition'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div className={animateClass}>
              <label className='block text-sm font-medium mb-1'>
                Confirm Password
              </label>
              <div className='relative'>
                <Key className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder='Confirm new password'
                  className='w-full pl-11 pr-12 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 transition'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            <button
              type='submit'
              className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-xl transform transition hover:scale-105 shadow-md'
            >
              Next
            </button>
          </form>
        );

      case 2:
        return (
          <form
            onSubmit={handleStep2Submit}
            className='space-y-4 animate-fade-in'
          >
            <div>
              <label className='block text-sm font-medium mb-1'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='Enter your email'
                  className='w-full pl-11 pr-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 transition'
                />
              </div>
            </div>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-xl transform transition hover:scale-105 shadow-md'
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        );

      case 3:
        return (
          <form
            onSubmit={handleStep3Submit}
            className='space-y-4 animate-fade-in'
          >
            <div>
              <label className='block text-sm font-medium mb-1'>
                Verification Code
              </label>
              <div className='relative'>
                <Shield className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  name='otp'
                  type='text'
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder='Enter 6-digit OTP'
                  className='w-full pl-11 pr-4 py-2 border-2 rounded-xl text-center focus:ring-2 focus:ring-blue-400 transition'
                  maxLength='6'
                />
              </div>
            </div>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-xl transform transition hover:scale-105 shadow-md'
            >
              {isLoading ? 'Verifying...' : 'Verify & Reset Password'}
            </button>
          </form>
        );

      case 4:
        return (
          <div className='text-center space-y-4 animate-fade-in'>
            <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce'>
              <Check className='h-8 w-8 text-green-600' />
            </div>
            <h3 className='text-xl font-bold'>Password Reset Complete!</h3>
            <p>Your password has been successfully reset.</p>
            <a
              href='/login'
              className='inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-6 rounded-xl transform transition hover:scale-105 shadow-md'
            >
              Go to Login
              <ArrowRight className='ml-2 h-4 w-4' />
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4'>
      <div className='w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-8'>
        <div className='text-center mb-6'>
          <img
            src={gunevoLogo}
            alt='Gunevo Logo'
            className='w-40 mx-auto animate-fade-in'
          />
          <h2 className='text-2xl font-bold'>Reset Password</h2>
        </div>

        {/* Stepper */}
        <div className='flex items-center justify-between mb-8'>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className='flex flex-col items-center'>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    currentStep >= step.id
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <step.icon className='h-5 w-5' />
                </div>
                <p className='text-xs mt-2'>{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 transition-all duration-500 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error & Success messages */}
        {error && (
          <div className='mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r-lg animate-fade-in'>
            {error}
          </div>
        )}
        {successMessage && (
          <div className='mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 text-sm rounded-r-lg animate-fade-in'>
            {successMessage}
          </div>
        )}

        {renderStepContent()}
      </div>
    </div>
  );
};

export default PasswordResetStepper;
