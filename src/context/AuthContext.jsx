import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // We have removed the in-memory registeredUsers array as requested.
  // The database will now serve as the single source of truth.

  useEffect(() => {
    // Attempt to load session from sessionStorage if desired
    const storedUser = sessionStorage.getItem('gladiconnect_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    // credentials should include { gcId, pin, role }
    try {
      const response = await fetch('https://gladiators-ngo.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setUser(data.user);
      sessionStorage.setItem('gladiconnect_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.error('AuthContext Login Error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('gladiconnect_user');
  };

  const registerUser = async (newUserData) => {
    try {
      const response = await fetch('https://gladiators-ngo.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Auto-login after registration
      setUser(data.user);
      sessionStorage.setItem('gladiconnect_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.error('AuthContext Registration Error:', error);
      return { success: false, message: error.message };
    }
  };

  const updateUserProfile = async (updatedData) => {
    if (!user || !user._id) return { success: false, message: 'Not logged in' };
    
    try {
      const response = await fetch('https://gladiators-ngo.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gcId: user._id, updatedData })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }
      
      setUser(data.user);
      sessionStorage.setItem('gladiconnect_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.error('AuthContext Update Error:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    login,
    logout,
    registerUser,
    updateUserProfile,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
