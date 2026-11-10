import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('irctc_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'otp'

  const login = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('irctc_user', JSON.stringify(user));
    } catch (e) {}
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('irctc_user');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      authModalOpen,
      setAuthModalOpen,
      authMode,
      setAuthMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
