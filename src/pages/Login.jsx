import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Shield, Sparkles, Zap, Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (formData.email && formData.password) {
        console.log('Login successful!');
        localStorage.setItem("authToken", "react-token");
        localStorage.setItem("user", {emal: formData.email})
        navigate("/dashboard");
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animated floating icons
  const FloatingIcon = ({ Icon, delay = 0, duration = 3, className = "" }) => (
    <div 
      className={`absolute animate-bounce ${className}`}
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      <Icon className="h-4 w-4 text-blue-400/30" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Animated Background Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon Icon={Sparkles} delay={0} className="top-20 left-20" />
        <FloatingIcon Icon={Star} delay={1} className="top-32 right-32" />
        <FloatingIcon Icon={Shield} delay={2} className="bottom-40 left-16" />
        <FloatingIcon Icon={Zap} delay={0.5} className="top-1/2 right-20" />
        <FloatingIcon Icon={Heart} delay={1.5} className="bottom-20 right-40" />
        <FloatingIcon Icon={User} delay={2.5} className="top-16 right-1/4" />
        
        {/* Rotating elements */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 border-2 border-blue-200/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 border-2 border-purple-200/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
      </div>

      {/* Main Card */}
      <div className="relative">
        {/* Card with enhanced shadow and animations */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 p-8 w-full max-w-sm border border-white/50 transform hover:scale-[1.02] transition-all duration-300">
          
          {/* Animated Header */}
          <div className="text-center mb-8">
            {/* Main Logo with complex animation */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse shadow-lg"></div>
              <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                <div className="relative">
                  <User className="h-8 w-8 text-blue-600 animate-bounce" style={{ animationDuration: '2s' }} />
                  {/* Orbiting particles */}
                  <div className="absolute -inset-4">
                    <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                    <div className="absolute top-1/2 right-0 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-0 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in">Welcome back</h1>
            <p className="text-gray-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>Please sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm animate-shake rounded-r-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                {error}
              </div>
            </div>
          )}

          {/* Form with staggered animations */}
          <div className="space-y-5">
            {/* Email Field */}
            <div className="group animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:animate-pulse" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:animate-pulse" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 animate-pulse" />
                  ) : (
                    <Eye className="h-5 w-5 hover:animate-bounce" />
                  )}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                  />
                  {formData.rememberMe && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
                <span className="ml-2 text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:scale-105 relative group">
                Forgot password?
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl animate-slide-up relative overflow-hidden"
              style={{ animationDelay: '0.4s' }}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
              
              {isLoading ? (
                <div className="flex items-center relative z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span className="animate-pulse">Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center relative z-10">
                  <span>Sign in</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-200" />
                </div>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Don't have an account?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:scale-105 inline-block relative group">
              Sign up
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </p>
        </div>

        {/* Decorative elements around the card */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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
      `}</style>
    </div>
  );
};

export default Login;