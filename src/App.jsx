import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FlowPage from './pages/FlowPage';
import ProtectedRoute from './route/ProtectedRoute';
import ChatInterface from './pages/Chatbot';
import CodeEditor from './pages/CodeEditor';

export default function App() {
  return (
    <Router>
      <div className='min-h-screen'>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<Login />} />

          {/* Protected Routes */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/chatbot'
            element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            }
          />
          <Route
            path='/code-editor'
            element={
              <ProtectedRoute>
                <CodeEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path='/flow-page'
            element={
              <ProtectedRoute>
                <FlowPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />

          {/* Catch all route - redirect to dashboard */}
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </div>
    </Router>
  );
}
