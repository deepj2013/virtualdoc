import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      setIsAuthenticated(false); // Start as not authenticated
      setIsLoading(false);
    }, 1000);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login: () => setIsAuthenticated(true),
    logout: () => setIsAuthenticated(false),
  };
};
