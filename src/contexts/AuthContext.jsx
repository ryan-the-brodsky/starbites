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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false); // Admin test mode for unlocking all levels
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing auth state
    const storedAuth = localStorage.getItem('starbites_auth');
    const storedAdmin = localStorage.getItem('starbites_admin');
    const storedTestMode = localStorage.getItem('starbites_test_mode');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    if (storedAdmin === 'true') {
      setIsAdmin(true);
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
      localStorage.setItem('starbites_auth', 'true');
      return true;
    }
    return false;
  };

  const loginAdmin = (password) => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === adminPassword) {
      setIsAdmin(true);
      setIsAuthenticated(true);
      localStorage.setItem('starbites_admin', 'true');
      localStorage.setItem('starbites_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsTestMode(false);
    localStorage.removeItem('starbites_auth');
    localStorage.removeItem('starbites_admin');
    localStorage.removeItem('starbites_test_mode');
  };

  const toggleTestMode = () => {
    const newValue = !isTestMode;
    setIsTestMode(newValue);
    if (newValue) {
      localStorage.setItem('starbites_test_mode', 'true');
    } else {
      localStorage.removeItem('starbites_test_mode');
    }
  };

  const value = {
    isAuthenticated,
    isAdmin,
    isTestMode,
    isLoading,
    login,
    loginAdmin,
    logout,
    toggleTestMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
