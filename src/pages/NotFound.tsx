
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleGoBack = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
      <p className="text-gray-500 mt-2 text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button onClick={handleGoBack} className="mt-8">
        {user ? 'Back to Dashboard' : 'Back to Home'}
      </Button>
    </div>
  );
};

export default NotFound;
