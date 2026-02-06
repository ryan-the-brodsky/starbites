import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false); // Admin test mode for unlocking all levels
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing auth state
    const storedAuth = localStorage.getItem('joybites_auth');
    const storedTestMode = localStorage.getItem('joybites_test_mode');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    if (storedTestMode === 'true') {
      setIsTestMode(true);
    }
    setIsLoading(false);
  }, []);

  const login = (password) => {
    const sitePassword = import.meta.env.VITE_SITE_PASSWORD;
    if (password === sitePassword) {
      setIsAuthenticated(true);
      localStorage.setItem('joybites_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsTestMode(false);
    localStorage.removeItem('joybites_auth');
    localStorage.removeItem('joybites_test_mode');
  };

  const toggleTestMode = () => {
    const newValue = !isTestMode;
    setIsTestMode(newValue);
    if (newValue) {
      localStorage.setItem('joybites_test_mode', 'true');
    } else {
      localStorage.removeItem('joybites_test_mode');
    }
  };

  const value = {
    isAuthenticated,
    isTestMode,
    isLoading,
    login,
    logout,
    toggleTestMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
